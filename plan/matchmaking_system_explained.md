# Matchmaking System — How It Works

A walkthrough of the new server-driven matchmaking system (the "Find Match" feature in app version 4.4.0+). Written for any reader: new backend devs, the frontend dev, product/PM, or future-you returning to this code in six months.

Companion to `docs/matchmaking_redesign.md` — that doc is the design spec; this doc explains the system as built, with prose around every diagram and every method.

---

## TL;DR

When a user taps "Find Match" on a topic, the backend tries to find them a real opponent within 15 seconds, falling back to a bot if it can't. To find a real opponent it does three things in parallel:

1. **Queue lane** — if another user is also waiting on the same topic, pair them instantly.
2. **WS-invite lane** — pick online users one at a time and send each a real-time invite ring (5 seconds each); whoever accepts first wins.
3. **Push lane** — wake up to 5 recently-active offline users with a push notification; if any of them open the app and start their own search, the queue lane picks them up.

The user only ever sees: "Looking for opponent…" → opponent appears (real or bot). All the orchestration is server-side, tunable from settings without a release.

---

## The Big Picture

```
                                    User taps "Find Match"
                                            │
                                            ▼
                                  WS: { action: look_for_opponent }
                                            │
                                            ▼
                              ┌──────────────────────────┐
                              │  MatchModeConsumer        │
                              │  (server-side orchestrator)│
                              └────────────┬──────────────┘
                                            │
                            ┌───────────────┼───────────────┐
                            │               │               │
                            ▼               ▼               ▼
                       Queue lane      WS-invite lane   Push lane
                       (~instant)      (loops, 5s/ring) (fire-and-forget)
                            │               │               │
                            └───────┬───────┴───────────────┘
                                    │
                                    ▼ within 15s
                              one of: paired with real user / bot fallback / cancelled
                                    │
                                    ▼
                              FE: shows opponent in lobby; ready-up flow takes over
```

### Three lanes — what each does

| Lane | When it pairs | How fast |
|---|---|---|
| **Queue lane** | Two users tap "Find Match" for the same topic at the same time | Sub-second |
| **WS-invite lane** | Searcher's invite ring is accepted by an online user | 5–15s (one accept) |
| **Push lane** | A push recipient opens the app and starts their own search; the queue lane then pairs them | Slow / probabilistic — a re-engagement vector, not a primary lane |
| **Bot fallback** | None of the above produced a match within 15s | Always at 15s |

---

## Key concepts (plain-English glossary)

These show up in the code and diagrams. Skim if you already know them.

- **WebSocket (WS)**: a long-lived two-way connection between the user's app and the server. Unlike a normal HTTP request (which is one-shot), the server can push messages to the client at any time. This is how "Looking for opponent…" updates and the final match arrival are delivered without the client polling.
- **MatchModeConsumer**: the server-side object that owns one user's WS connection. Each connected user has exactly one of these. It's where all the new matchmaking code lives.
- **AppConsumer**: a separate, longer-lived WS connection that's open whenever the user is using the app (regardless of which screen they're on). Used for invite delivery, friend events, screen-change tracking, etc.
- **Channel layer**: an internal Django Channels concept — basically a message bus over Redis that lets one consumer send a message to another consumer (or to a *group* of consumers) without HTTP. Used for cross-user dispatch (e.g., delivering a match invite from User A's MatchModeConsumer to User B's AppConsumer).
- **Redis**: in-memory key/value store. We use it for fast shared state across consumer processes — anything that needs to be visible to multiple users at once (the matchmaking queue, the various locks and counters).
- **Queue (sorted set)**: a Redis data structure where each member has a numeric score. We store searchers there with `score = enqueue timestamp`, so reading them in order gives us "who has been waiting longest." Operations: `ZADD` (add), `ZREM` (remove), `ZRANGE` (read).
- **Pair lock**: a small Redis key with a sorted-pair name (`pair_lock:{small_id}_{big_id}`). If two consumers both try to finalize the same pair at the same time, only one can SET-NX (set-if-not-exists) the lock — the other quietly bows out. Prevents duplicate `UserQuizMatch` rows.
- **Search task**: the asyncio coroutine on the searcher's MatchModeConsumer that runs the WS-invite loop. Lives until the search ends (paired / bot / cancel / disconnect).
- **DND screen / priority screen / eligible screen**: the FE tells the backend what screen the user is currently on (`screen_change` action). Some screens are "do not disturb" — `inside_match`, `inside_mock_test`, `payment` — and those users are never invited. Other screens (matchmaking, live_matches) get priority.
- **Recency tier**: for the push lane, offline users are bucketed by how long ago they last opened the app: tier 0 (<1 day), tier 1 (1–3 days), tier 2 (4–10 days). Different copy and caps per tier.
- **Engaged user**: someone who taps the matchmaking pushes they receive. Tracked in `push_stats:{user_id}`. Engaged users tolerate a higher daily push cap.
- **Telemetry event**: every meaningful step (search started, invite sent, accepted, declined, push sent, bot fallback, etc.) writes a row to the `MatchSearchEvent` table. A nightly Celery task rolls these up into per-day, per-topic stats for dashboards.

---

## Diagram 1 — End-to-end happy path

```
FE (>= 4.4.0)                 Backend                                  Other side
─────────────                 ───────                                  ──────────
                              MatchModeConsumer
                              (ws/match-mode/{quiz_id}/)
{action:                  ┌─► receive_json
 look_for_opponent}  ─────┘     │
                                ▼
                          _look_for_opponent ──── idempotency guards
                                │                 (existing _search_task?
                                │                  existing match_search:{uid}?)
                                │
                                ├── search_id = uuid4()
                                ├── topic_id = UserQuiz.tree_node_id
                                ├── attribution = GET push_attribution:{uid}
                                ├── SET match_search:{uid} (JSON) TTL=120s
                                ├── ◄── send {type:search_state, state:QUEUED, search_id, budget_ms:15000}
                                ├── INSERT MatchSearchEvent(search_started)
                                │
                                ├──► _claim_queue_peer (mutual short-circuit)
                                │     ├─ ZRANGE match_queue:{topic} 0 1
                                │     └─ for each member ≠ self: ZREM (atomic)
                                │
                            ┌───┴────────┐
                            │  peer hit? │
                            └───┬────────┘
                          YES   │   NO
                            │   │
                            │   ├─ ZADD match_queue:{topic} {ts: uid}
                            │   ├─ asyncio.create_task(_run_search_task)
                            │   └─ asyncio.create_task(_send_push_invites)
                            │
                            ▼
                   _finalize_match_with_peer(lane="queue") (see Diagram 4)
```

**What's happening, line by line**

1. The FE sends a single message: `{ "action": "look_for_opponent" }`. That's the entire user-facing API of the new flow.
2. The MatchModeConsumer's `receive_json` dispatches to `_look_for_opponent`.
3. We guard against duplicate searches: if the user already has a running search task or a stale `match_search:{user_id}` record in Redis, we ignore the action. (Prevents UI bugs from triggering two parallel searches.)
4. Generate a fresh `search_id` UUID. Every event for this search will carry it — that's how the rollup later joins events from the same search.
5. Look up the topic from the `UserQuiz` (`tree_node_id`). Topic is the unit of pairing — two users on the same topic can pair, two on different topics can't.
6. Check if this search is a **push conversion**: does Redis have a `push_attribution:{user_id}` key? That's set when we pushed this user within the last 10 minutes. If so, we'll stamp the terminal event metadata with `was_push_conversion=true` and the original push tier.
7. Persist the search state to Redis (TTL 120s, refreshed). This is the user's "I am searching" record — visible to other consumers, used for the queue-pair flow.
8. Send a `search_state: QUEUED` message back to the FE so the UI can show "Looking for opponent…" with a 15-second countdown.
9. Insert a `search_started` row into `MatchSearchEvent` for telemetry.
10. **Mutual short-circuit**: peek at `match_queue:{topic_id}` — if someone else is already there (the queue is FIFO by enqueue timestamp), atomically claim them with `ZREM`. ZREM is atomic in Redis: only one consumer can successfully remove any given member. If we succeed, we proceed straight to finalization.
11. If no peer is in the queue, we add ourselves with `ZADD` and spawn two parallel asyncio tasks:
    - `_run_search_task` — the WS-invite loop, owns the 15-second search budget
    - `_send_push_invites` — the push lane, fire-and-forget

---

## Diagram 2 — The WS-invite loop (`_run_search_task`)

```
                _run_search_task
                       │
          ┌────────────▼──────────────────────────────────────┐
          │ deadline = now + 15s, attempt = 0                 │
          └────────────┬──────────────────────────────────────┘
                       │
   ┌───────────────────▼──────────────────────────────────────┐
   │ while time.now() < deadline:                             │
   │                                                          │
   │   ┌─────────────────────────────────────────────────┐    │
   │   │ peer = _claim_queue_peer(topic_id)              │    │
   │   │ if peer: dequeue_self → finalize(queue) → RET   │    │
   │   └─────────────────────────────────────────────────┘    │
   │                                                          │
   │   ┌─────────────────────────────────────────────────┐    │
   │   │ candidate = _pick_next_candidate(topic_id)      │    │
   │   │ if None: sleep(1) → continue                    │    │
   │   └─────────────────────────────────────────────────┘    │
   │                                                          │
   │   attempt++; _invited_in_search.add(candidate)           │
   │                                                          │
   │   ┌─────────────────────────────────────────────────┐    │
   │   │ response = _send_invite_and_wait(candidate)     │    │
   │   │   (see Diagram 3)                               │    │
   │   └────────────────┬────────────────────────────────┘    │
   │                    │                                     │
   │       accept_invite│   decline / timeout / lock_lost     │
   │                    │   ──────► continue (next candidate) │
   │                    ▼                                     │
   │   ┌─────────────────────────────────────────────────┐    │
   │   │ survived = _wait_for_quiz_socket(candidate, 5s) │    │
   │   │   (poll quiz_socket_joined:{quiz_id}:{uid})     │    │
   │   └────────────────┬────────────────────────────────┘    │
   │              ┌─────┴─────┐                               │
   │           YES│           │NO                             │
   │              ▼           ▼                               │
   │   dequeue_self   _apply_drop_penalty                     │
   │     ↓             (pair_cooldown 30min)                  │
   │   finalize(ws) →  user_invite_stats.dropped_after_accept │
   │   RETURN          INSERT accept_dropped event            │
   │                   continue                               │
   └────────────┬─────────────────────────────────────────────┘
                │ budget exhausted
                ▼
       dequeue_self → _finalize_match_with_bot
```

**The loop, in plain English**

The loop has 15 seconds total. On each iteration:

1. **Re-check the queue.** Someone might have just enqueued in the last second. If so, pair them. (This makes mutual short-circuit work even if both users start within the same second — whichever gets to step 1 second wins.)
2. **Pick an online candidate.** `_pick_next_candidate` walks the list of online users and applies all the filters (DND screens, cooldowns, rate limits, decline rate). Returns the highest-priority candidate or `None`.
3. **If no candidate**, sleep 1 second and retry — someone might come online or finish a match.
4. **Send a 5-second invite ring** to the candidate (Diagram 3). They see a modal with our profile and a 5-second countdown.
5. **On accept**, run the safety net: wait up to 5 more seconds for the candidate's match-mode socket to actually attach. If they accept and then immediately background the app or the network drops, we'd otherwise pair into a half-broken state. Drop recovery penalizes them with a 30-minute pair-cooldown so we don't immediately re-target.
6. **On decline / timeout / lost-the-lock**, continue to the next candidate. (The candidate gets a 5-minute pair-cooldown so they don't get re-targeted by us this same minute.)
7. **If 15 seconds elapse without success**, fall back to a bot. The bot is auto-readied so the user only has to ready themselves to start the match.

---

## Diagram 3 — One invite ring (`_send_invite_and_wait`)

```
_send_invite_and_wait(candidate, attempt_n)
        │
        ▼
SET NX invite_lock:{candidate} TTL=5s ──── lost? ──► return None
        │ won
        ▼
INCR invite_count_min:{candidate} EXPIRE 60
INCR invite_count_hr:{candidate}  EXPIRE 3600
HINCRBY user_invite_stats:{candidate} sent +1
        │
        ▼
check_opponent_user_goal()   ◄── lazy UserGoal create (defensive)
get_topic_serialized()
get_user_serialized(candidate)
        │
        ▼
expires_at_ms = (now + 5s) × 1000
future = create_future()
self._pending_invite = (candidate, future)
        │
        ▼  channel_layer.group_send(f"user_{candidate}", invite_received{
        │     user_data_id, profile_picture, full_name,
        │     quiz_id, topic, opponent, search_id, expires_at_ms
        │  })
        │
        ▼  ◄── self.send {type:search_state, state:INVITING, candidate_full_name}
        │
        ▼  INSERT invite_sent event
        │
        ▼
await asyncio.wait_for(future, timeout=5s)
        │                                   ┌──── candidate's AppConsumer
        │                                   │     receives invite_received
        │                                   │     user taps Accept / Decline
        │                                   │     sends invite_response back
        │                                   │     to match_mode_{inviter}
        │                                   └────────────┬─────────────────
        │                                                ▼
        │                            invite_response handler resolves
        │                            self._pending_invite future
        ▼
   ┌────┴──────────────────────────────────────┐
   │                                           │
   ▼ accept_invite                             ▼ decline / timeout
HINCRBY accepted +1                  SET pair_cooldown:{me}:{cand} TTL=300s
INSERT invite_accepted (latency)     HINCRBY declined|timed_out +1
return "accept_invite"               INSERT invite_declined / invite_timeout
                                     if timeout: group_send invite_expired
                                     return None / "decline_invite"
```

**Why the lock?**

If two searchers (A and B) both want to invite candidate X at the same exact moment, only one of them should succeed. Both set `invite_lock:{X}` with `SET NX TTL=5s` — only the first wins; the second falls through and tries someone else. From X's point of view, they only ever see one invite at a time, never two stacked modals.

**Why the future?**

The invite response comes back via the channel layer (a separate code path in the consumer), not as a return value from `group_send`. So we create an `asyncio.Future`, stash it on `self._pending_invite`, and await it with a 5-second timeout. The `invite_response` channel handler resolves the future when the candidate replies. If 5 seconds elapse, `wait_for` raises and we treat it as a timeout.

**Why update the stats here?**

`user_invite_stats:{candidate}` is a Redis hash with `{sent, accepted, declined, timed_out, dropped_after_accept}`. It feeds the decline-rate filter in `_pick_next_candidate` — users who consistently decline get pushed to the back of the candidate pool.

---

## Diagram 4 — Pair finalization (with race protection)

```
                       _finalize_match_with_peer(peer_id, lane)
                                       │
                                       ▼
              ┌──────  SET NX pair_lock:{lo}_{hi} TTL=30s  ─────┐
              │                                                 │
       lock won│                                                 │lock lost
              ▼                                                 ▼
   GET match_search:{peer_id}                       dequeue_self
              │                                     DEL match_search:{me}
       ┌──────┴──────┐                              return
   exists           gone
       │             │
       │             ▼
       │   release pair_lock
       │   _finalize_match_with_bot
       │
       ▼
   _create_pair_user_quiz_match(peer_quiz_id, peer_user_id):
       UserQuizMatch.get_or_create(user_quiz=peer_quiz)
         .opponent = self.user_data
         .opponent_user_quiz = my_quiz
         .status = WAITING
         .bot_match = False
       │
       ▼
   self.send {type:match_found, opponent:peer_serialized, is_bot:false, quiz_id:my_quiz_id}
       │
       ▼
   group_send → match_mode_{peer_id}:
       {type:match_found_dispatch, opponent:self_serialized, is_bot:false, quiz_id:peer_quiz_id}
       │
       ▼
   pair_group = f"pair_match_{lo}_{hi}"
   group_add(pair_group, self.channel_name)
   self.quiz_group = pair_group
   group_send → match_mode_{peer_id}: {type:join_pair_group, pair_group}
       │
       ▼
   if lane == "queue":
       INSERT queue_paired (latency_ms, was_push_conversion, recency_bucket if applicable)
   else:  # lane == "ws"
       (skip — invite_accepted already emitted in Diagram 3 with same metadata)
       │
       ▼
   DEL match_search:{me}; DEL match_search:{peer_id}
```

**The race we're protecting against**

Imagine A and B both call `look_for_opponent` at the exact same millisecond. Both peek at the queue (empty for each), both add themselves, both spawn search tasks. Now both tasks loop and call `_claim_queue_peer`:
- A's task ZRANGE returns [A, B], skips A (self), ZREMs B → success
- B's task ZRANGE returns [A, B], skips B (self), ZREMs A → also success

ZREM is atomic on a *single member*, but A removed B and B removed A — different members, both successful. Without a higher-level lock, both would proceed to create separate `UserQuizMatch` rows, both would emit `match_found`, and the data would be inconsistent.

**Pair lock fixes this.** The key `pair_lock:{lo}_{hi}` (sorted so both sides compute the same key) is set with `SET NX`. Only one wins; the loser quietly bows out and just cleans up its own state. The winner's `match_found_dispatch` (Diagram 6) still delivers `match_found` to the loser's client, so the user-visible result is identical to the no-race case.

**Why a shared "pair group"?**

Once paired, the two consumers need to agree on lobby state — ready_up, unready, leave_lobby, start_match. The existing code does these via `channel_layer.group_send` to a single group. Originally each consumer had its own group `quiz_{quiz_id}` (one per quiz, never shared). To bridge that, both join a synthetic group named `pair_match_{lo_id}_{hi_id}`. From here on, all lobby messages go to this group — both consumers receive everything.

---

## Diagram 5 — Push lane

```
_send_push_invites
       │
       ▼
   _is_quiet_hours()? ──── True ──► return  (wraps midnight: 22:00–08:00 IST)
       │ False
       ▼
   _gather_push_eligible_by_tier(topic_id):
       _fetch_push_candidates_by_tier  (DB)
          SELECT cred WHERE online=False
                 AND last_login >= now - 10 days
                 AND user_data NOT IN (self, bots)
          partition by days_since_last_login into tier 0/1/2
       │
       │  for each tier, filter (Redis):
       │     - GET pair_cooldown:{me}:{cid}                  ── set? skip
       │     - GET push_count_hr:{cid}     ≥ 1?              ── skip
       │     - GET push_count_day:{cid}    ≥ tier_cap?       ── skip (tier-aware)
       ▼
   _allocate_tier_quotas(eligible):
       Native quotas: tier 0=3, tier 1=1, tier 2=1 (5 total)
       Underfill rolls over to next-best tier
       │
       ▼
   for (tier, candidate_id) in selected:
       _dispatch_push_to_candidate:
           ├─ _lazy_create_user_goal       (UserGoal.is_active=False if missing)
           ├─ data = {title, body, type:match_request_v2, deep_link,
           │         tree_node_id, topic_name, recency_bucket}
           ├─ send_generic_notification(MATCH_REQUEST, [candidate], data)
           │     └─► creates Notification row (in-app)
           │     └─► dispatches FCM to all active devices
           ├─ INCR push_count_day:{cid}  EXPIRE 86400
           ├─ INCR push_count_hr:{cid}   EXPIRE 3600
           ├─ SET pair_cooldown:{me}:{cid} TTL = bucket_pair_cooldown_sec
           │     (30m / 12h / 24h by tier — set on send, not response)
           ├─ SET push_attribution:{cid} = tier  TTL = 600s
           ├─ HINCRBY push_stats:{cid} sent +1
           └─ INSERT push_sent event (metadata.recency_bucket = tier)
```

**Why "set the cooldown on send, not response"**

For an online WS invite, we know whether the candidate accepted, declined, or ignored. For a push, we don't. The recipient might never see the notification (phone in pocket, notifications muted). If we waited for a "decline" signal we'd never get one — and we'd re-push them every minute. So we cool down preemptively: tier 0 gets 30 minutes, tier 1 gets 12 hours, tier 2 gets 24 hours.

**Why tier-quota with rollover (instead of greedy "tier 0 first")**

If we always filled tier 0 first, dormant users (tier 2) would never get a push at scale, and we'd lose the re-engagement function. Instead, each tier reserves slots: 3/1/1. A tier with no eligible candidates rolls its slots over to whichever tier has more room, preferring higher-conversion tiers first.

**Why the in-app `Notification` row**

Even if the user has push notifications disabled or dismisses the OS push without reading, they'll see the invite in their in-app notifications panel next time they open the app. That's the durable surface for re-engagement — a push provider can fail; an in-app row can't be missed.

---

## Diagram 6 — The peer side: receiving `match_found`

```
peer's MatchModeConsumer
        │
        ▼  receives channel-layer message:
        │  {type:match_found_dispatch, opponent, is_bot, quiz_id}
        │
        ▼
   match_found_dispatch handler:
        ├─ _search_task.cancel()        ◄── stop the loop, it has been paired
        ├─ _pending_invite resolved with None
        ├─ ZREM match_queue:{topic} self.uid
        ├─ DEL match_search:{me}
        ├─ reset all instance state (search_id, topic, started_at, push flags)
        └─ self.send {type:match_found, opponent, is_bot, quiz_id}
```

**Why this handler does so much**

When user A claimed user B from the queue, B's MatchModeConsumer was happily running its own `_run_search_task` loop. B had no idea they'd been claimed. Without this handler, B's loop would keep going — eventually picking another candidate or bot-falling-back, which would *overwrite* the `UserQuizMatch.opponent` from A to a bot. Net result: B's row would lie about who B is matched with.

The handler solves this by:
1. Cancelling B's search task immediately (it has been paired, the loop must stop)
2. Draining any pending WS invite future (if B was mid-ring with another candidate, that ring is now stale)
3. Cleaning up B's queue entry and `match_search` record
4. Forwarding the `match_found` message to B's client so the FE can transition to the lobby

This is idempotent end-of-search for the recipient.

---

## Diagram 7 — Push tap → search start (FE-side flow)

```
FCM delivers data payload (type=match_request_v2)
        │
        ▼  registerPushNotifications.ts addListener
        │  (Capacitor FirebaseMessaging.notificationActionPerformed)
        │
        ▼
   navigate(`/topic/{tree_node_id}?autoFindMatch=1`)
        │
        ▼
   TopicBottomSheet mounts:
        ├─ if topicData.quizId == null:
        │     useCreateTopicalQuizAndUpdateTopic({topicData})
        │     ─► GET /api/mlb/v3/topical-quiz/create/?topic-id={tree_node_id}
        │           (idempotent — reuses WAITING/STARTED quiz if any)
        │           returns {quizId, topicId, sectionId, unitId}
        │     ─► dispatch setQuizIdForTopic, redux re-renders bottom sheet
        │
        └─ when quizId != null and autoFindMatch == "1":
              handleFindAnOpponent()  ◄── opens ws/match-mode/{quizId}
              clear ?autoFindMatch from URL (no re-trigger on back)
                                  │
                                  ▼
              ws send {action: "look_for_opponent"}
                                  │
                                  ▼
              backend's _look_for_opponent finds push_attribution:{recipient_uid}
              ─► search_state["was_push_conversion"] = True
              ─► search_state["recency_bucket"] = N
              ─► proceeds normally (queue / ws / bot)
                                  │
                                  ▼
              terminal event emitted with metadata.was_push_conversion=true
              + metadata.recency_bucket=N  (joins the dashboards in Diagram 9)
```

**The conversion attribution trick**

We don't put a "this is a push tap" flag in the WS message — the wire is identical whether the user organically opened the app or tapped a push. The backend just checks: is there a `push_attribution:{user_id}` key in Redis (set when we pushed them within the last 10 minutes)? If yes, this search counts as the conversion and the terminal event metadata gets stamped accordingly. The 10-minute window is a tradeoff between attribution accuracy (too short → miss real conversions) and over-attribution (too long → credit organic searches).

---

## Diagram 8 — Search lifecycle and cleanup

```
            tap Find Match
                │
                ▼
          ┌──── QUEUED ──────────────────────────────────────────┐
          │                                                      │
   ┌──────┼──────────────┬───────────────────────────────────────┤
   │      │              │                                       │
   │      ▼              ▼                                       ▼
   │   INVITING       INVITING        ...      no opponent  →  bot fallback
   │   (cand A)       (cand B)                  in 15s
   │   accept ✓       decline ✗
   │      │              │
   │      ▼              ▼
   │  match_found  cooldown 300s; loop
   │  (real)
   │
   ▼ user taps Cancel  /  app backgrounds  /  socket drops
 stop_looking_for_opponent  /  disconnect
       │
       ▼
   _cleanup_search_state:
     ├─ _search_task.cancel()
     ├─ ZREM match_queue:{topic} self.uid
     ├─ DEL match_search:{me}
     ├─ pending_invite future resolved with None
     ├─ if invite_lock:{candidate} held by my search_id: DEL it
     ├─ INSERT search_cancelled event (only on user-initiated cancel)
     ├─ self.send {type:search_state, state:CANCELLED}  (only on user cancel)
     └─ reset instance state
```

**Why a single cleanup function for both cancel and disconnect**

Whether the user taps Cancel or their network drops, the *state* is the same: a partially-running search task, a queue entry, a Redis state record, possibly a held invite lock, possibly a pending invite future. The same cleanup code handles all of it. Two boolean parameters — `emit_cancelled_event` (skip telemetry on disconnect) and `send_to_client` (skip the WS write if the socket is already gone) — let the same function serve both call sites.

---

## Diagram 9 — Telemetry: events → daily stats → dashboards

```
MatchSearchEvent (one row per event, raw, 90-day retention)
─────────────────────────────────────────────────────────────────────────────
search_started      (look_for_opponent enters)
queue_paired        (lane=queue: mutual short-circuit  paired)             ┐
invite_sent         (lane=ws: ring fires)                                  │
invite_accepted     (lane=ws: candidate accepted) ─── terminal-event       ├── terminal events
invite_declined     (lane=ws: candidate declined)                          │   carry latency_ms
invite_timeout      (lane=ws: 5s elapsed, no response)                     │   + was_push_conversion
accept_dropped      (accepted but quiz socket didn't connect in 5s)        │   + recency_bucket
push_sent           (lane=push, metadata.recency_bucket = 0/1/2)           │   when applicable
bot_fallback        (lane=bot: 15s budget exhausted)                       ┘
search_cancelled    (user-initiated cancel)
─────────────────────────────────────────────────────────────────────────────
                                  │
                  Celery beat 03:00 IST (django-celery-beat DatabaseScheduler)
                                  ▼
            rollup_match_search_stats(target_date_iso=None)
              ├─ aggregate yesterday's events per topic_id
              ├─ also emit a topic_id=NULL global row
              └─ idempotent on (date, topic_id) — safe to re-run / backfill
                                  │
                                  ▼
MatchSearchDailyStats (one row per (date, topic_id), survives 90-day purge)
   searches_started / matched_real / matched_bot / cancelled
   invites_sent / accepted / declined / timed_out / accepts_dropped
   pushes_sent / pushes_converted
   pushes_sent_tier_0/1/2  /  pushes_converted_tier_0/1/2
   match_latency_p50_ms  /  p95_ms       (from queue_paired/invite_accepted only)
                                  │
                                  ▼
                           Frappe Insights dashboards


             Celery beat 03:30 IST
                     ▼
       purge_old_match_search_events(retention_days=90, batch_size=10000)
             deletes raw events older than cutoff in batches
```

**Why a daily rollup and a 90-day purge**

`MatchSearchEvent` is high-volume — at production scale (1000+ searches/day), each search emits 5–10 events, so we'd accumulate millions of rows quickly. Querying that table for long-range trends would be slow and expensive. The daily rollup gives us small, fast aggregates with stable column names (great for dashboards). The raw events table is then bounded at 90 days — enough for ad-hoc deep-dives, not so much that it eats disk forever.

**Why latency_ms only on `queue_paired` and `invite_accepted`**

Those are the only "the search succeeded with a real user" terminal events. `bot_fallback` is always at the budget deadline (~15s), so its latency would just measure the budget, not anything interesting. `search_cancelled` is user-driven, also not a useful latency signal. Including only the meaningful events keeps p50/p95 honest.

---

## Method reference

Methods grouped by phase in the search lifecycle. Method names are linked to file paths via `file:line` references.

### Entry / dispatch

#### `MatchModeConsumer.receive_json` action dispatch (mlb/match_mode_consumer.py:113–136)
The consumer's main switchboard. New flow's two action names:
- `look_for_opponent` → `_look_for_opponent`
- `stop_looking_for_opponent` → `_stop_looking_for_opponent`
Legacy actions (`random_invite`, `stop_random_lookup`, `assign_opponent`) keep their old handlers untouched, serving < 4.4.0 clients.

#### `AppConsumer.receive_json` `screen_change` (users/app_consumer.py:251–264)
FE sends `{action: "screen_change", screen: "<name>"}` on every top-level navigation. The handler writes `user_screen:{user_id}` to Redis with TTL 300s. The matchmaking candidate filter consults this so it can hard-block invites for users mid-mock-test / mid-payment (DND screens) and prioritize users on the matchmaking screen.

### Search start (`_look_for_opponent`)

#### `_look_for_opponent` (mlb/match_mode_consumer.py:521–574)
Generates `search_id`, persists `match_search:{user_id}` Redis state, looks up push attribution, sends `QUEUED` to the FE, emits `search_started` telemetry, attempts mutual short-circuit, and on no immediate peer spawns the WS-invite loop and the push lane in parallel.

#### `_fetch_topic_id_for_quiz` (mlb/match_mode_consumer.py)
Sync DB lookup for `UserQuiz.tree_node_id`. Wrapped in `@sync_to_async` so it's safe to call from the async consumer.

#### `_lookup_push_attribution(user_data_id)` (mlb/match_mode_consumer.py)
Reads `push_attribution:{user_data_id}` from Redis. Returns the recency_bucket (int 0/1/2) of the most recent push to this user within the conversion window, or `None`. Used to stamp the search state with `was_push_conversion`.

### Queue lane

#### `_claim_queue_peer(topic_id)` (mlb/match_mode_consumer.py)
Reads the two oldest members of `match_queue:{topic_id}` (skipping self if present), and atomically `ZREM`s the first non-self peer. Returns the peer's user_id on success, `None` otherwise. Atomicity guarantees that two concurrent searchers can't both claim the same peer.

#### `_enqueue_self(topic_id)` (mlb/match_mode_consumer.py)
`ZADD match_queue:{topic_id}` with score = current timestamp. The score determines who-was-waiting-longest order.

#### `_dequeue_self(topic_id)` (mlb/match_mode_consumer.py)
`ZREM match_queue:{topic_id}` self. Called on pair-finalize, cancel, and disconnect.

### WS-invite loop

#### `_run_search_task` (mlb/match_mode_consumer.py)
The 15-second loop that drives the WS lane. Each iteration: re-check queue, pick next candidate, send invite + wait, on accept run safety net, on bot-budget-exhausted assign bot. Fully detailed in Diagram 2.

#### `_pick_next_candidate(topic_id)` (mlb/match_mode_consumer.py)
Returns the next candidate user_id (or `None`). Filters and ranks online users:
1. Drop self + already-invited-in-this-search
2. Drop bots
3. Drop DND-screen users
4. Drop users with active `pair_cooldown:{me}:{them}`
5. Drop users at the per-recipient rate cap
6. **De-prioritize** (don't drop) users with high decline rate — they go to the back of the pool
7. Bucket: priority screens → tracked-eligible → stale-screen → deprioritized
8. Return the first candidate

#### `_fetch_online_user_ids(excluded_ids)` (mlb/match_mode_consumer.py)
Sync DB query for up to 50 online `CredentialData` rows excluding `excluded_ids` and bots.

#### `_candidate_rate_limited(candidate_id)` (mlb/match_mode_consumer.py)
Checks `invite_count_min:{candidate_id}` and `invite_count_hr:{candidate_id}` against `INVITE_RATE_PER_MIN` and `INVITE_RATE_PER_HR`. Returns True if the candidate has been invited too many times recently across all searchers — protects users from being spammed.

#### `_candidate_high_decline_rate(candidate_id)` (mlb/match_mode_consumer.py)
Reads `user_invite_stats:{candidate_id}` hash. Returns True if `(declined + timed_out) / sent >= DECLINE_RATE_THRESHOLD` AND `sent >= DECLINE_RATE_MIN_SAMPLES`. Used for de-prioritization, not exclusion.

#### `_send_invite_and_wait(candidate_id, attempt_n)` (mlb/match_mode_consumer.py)
Acquires `invite_lock:{candidate_id}`, increments rate counters, sends `invite_received` over the candidate's `user_{candidate_id}` AppConsumer group, awaits the response future with 5s timeout. Updates stats and emits telemetry on each branch (accept / decline / timeout). Detailed in Diagram 3.

#### `invite_response` channel handler (mlb/match_mode_consumer.py:354–375)
Hooked into the existing legacy invite_response handler. If `_pending_invite` matches, it resolves the future and skips legacy code. Otherwise falls through to legacy handling — preserving < 4.4.0 behavior.

### Pair finalization

#### `_try_acquire_pair_lock(peer_id)` (mlb/match_mode_consumer.py)
`SET NX pair_lock:{lo}_{hi} TTL=30s`. Sorted-pair canonical key so both sides compute the same key. Returns True if we won.

#### `_release_pair_lock(peer_id)` (mlb/match_mode_consumer.py)
`DEL pair_lock:{lo}_{hi}`. Called in the rare path where we won the lock but peer's state had vanished (we'll fall back to bot, want to clear the lock for any future pair).

#### `_finalize_match_with_peer(peer_id, lane)` (mlb/match_mode_consumer.py)
The big one. Acquires pair lock, looks up peer state, creates the canonical `UserQuizMatch` row, sends `match_found` to self, sends `match_found_dispatch` to peer's group, both join the shared pair group. Emits `queue_paired` for queue lane only (WS lane already emitted `invite_accepted`). Detailed in Diagram 4.

#### `_create_pair_user_quiz_match(peer_quiz_id, peer_user_id)` (mlb/match_mode_consumer.py)
Sync DB write: `UserQuizMatch.get_or_create(user_quiz=peer_quiz)` with `opponent=self.user_data`, `opponent_user_quiz=my_quiz`, `status=WAITING`, `bot_match=False`. The peer's UserQuiz is the canonical match key.

#### `_finalize_match_with_bot()` (mlb/match_mode_consumer.py)
Calls existing `get_bot_match()` helper to assign a random bot, sends `match_found{is_bot:true}` to self, fires `lobby_event{ready_up}` so the bot is auto-ready, emits `bot_fallback` telemetry.

#### `match_found_dispatch(event)` (mlb/match_mode_consumer.py)
Channel handler invoked when *another* consumer pairs with us via the queue. Cancels our search task, drains pending invite future, dequeues us, deletes our match_search, resets state, then forwards `match_found` to our client. Idempotent end-of-search for the recipient. Detailed in Diagram 6.

#### `join_pair_group(event)` (mlb/match_mode_consumer.py)
Channel handler that adds this consumer to the shared `pair_match_{lo}_{hi}` group and updates `self.quiz_group` so subsequent lobby events route through the shared group.

### Accept→start safety net

#### `_wait_for_quiz_socket(candidate_id)` (mlb/match_mode_consumer.py)
After an accept, polls `quiz_socket_joined:{quiz_id}:{candidate_id}` every 0.5s for up to `CLAIMED_TO_START_TIMEOUT_SEC` (5s). The marker is written by `MatchModeConsumer.connect` whenever a non-creator user attaches to an existing match state — i.e., the candidate's match-mode socket arriving at the lobby post-accept. Returns True on join, False on timeout.

#### `_apply_drop_penalty(candidate_id)` (mlb/match_mode_consumer.py)
Sets a long pair-cooldown (`DROP_AFTER_ACCEPT_COOLDOWN_SEC`, default 30 min) and increments `dropped_after_accept` on `user_invite_stats`. Used when a candidate accepts but their match-mode socket never shows up.

### Push lane

#### `_send_push_invites()` (mlb/match_mode_consumer.py)
Top-level push lane orchestrator. Quiet hours check, gather eligible by tier, allocate quotas, dispatch each. Wrapped in try/except so push failures never block the WS lane. Detailed in Diagram 5.

#### `_is_quiet_hours()` (mlb/match_mode_consumer.py)
Returns True if current IST hour is inside `PUSH_QUIET_HOURS` (default 22:00–08:00). Handles the midnight wrap correctly.

#### `_gather_push_eligible_by_tier(topic_id)` (mlb/match_mode_consumer.py)
Returns `{tier_index: [user_data_id, ...]}` of offline users eligible right now. Per-candidate: not in pair_cooldown, below hourly cap, below tier-aware daily cap (engaged users get a higher cap).

#### `_fetch_push_candidates_by_tier()` (mlb/match_mode_consumer.py)
Sync DB query: offline users with `last_login >= now - 10 days`, partitioned into tier 0/1/2 by days_since_last_login.

#### `_is_engaged_user(user_data_id)` (mlb/match_mode_consumer.py)
Reads `push_stats:{user_data_id}`. Returns True if `tapped/sent >= PUSH_ENGAGED_THRESHOLD_RATE` AND `sent >= PUSH_ENGAGED_THRESHOLD_SAMPLES`.

#### `_allocate_tier_quotas(eligible)` (mlb/match_mode_consumer.py)
Pure function. Given `{tier: [candidates]}`, returns up to `PUSH_MAX_PER_SEARCH` `(tier, candidate_id)` tuples honoring per-tier quotas with rollover.

#### `_dispatch_push_to_candidate(candidate_user_data_id, tier, topic_obj)` (mlb/match_mode_consumer.py)
Per-candidate dispatch: lazy UserGoal create, build payload from `PUSH_COPY_TEMPLATES[tier]`, dispatch via `send_generic_notification`, update counters, set tier-specific pair_cooldown, write `push_attribution`, emit `push_sent` telemetry.

#### `_lazy_create_user_goal(candidate_user_data_id, topic_obj)` (mlb/match_mode_consumer.py)
If the candidate doesn't have a UserGoal for this topic's goal, create one with `is_active=False`. Required so the recipient's later `topical-quiz/create` call (after they tap the push) doesn't 500.

#### `_dispatch_match_request_push(user_data_id, data)` (mlb/match_mode_consumer.py)
Sync wrapper around `send_generic_notification(MATCH_REQUEST, ...)`. Existing helper handles FCM dispatch + in-app `Notification` row creation.

### Cancel / cleanup

#### `_stop_looking_for_opponent()` (mlb/match_mode_consumer.py)
Calls `_cleanup_search_state(emit_cancelled_event=True, send_to_client=True)`.

#### `_cleanup_search_state(emit_cancelled_event, send_to_client)` (mlb/match_mode_consumer.py)
Single-source-of-truth cleanup for both user-initiated cancel and disconnect. Cancels search task, dequeues self, deletes match_search, drains pending invite, releases held invite_lock, optionally emits search_cancelled, optionally sends CANCELLED to client, resets instance state. Detailed in Diagram 8.

#### `MatchModeConsumer.disconnect` (mlb/match_mode_consumer.py:80–104)
Cancels the legacy `_assign_task`, runs new-flow cleanup, then runs the legacy `stop_random_lookup` cleanup. The two operate on disjoint Redis keys so they're safe to run together — covers both old and new clients in one disconnect path.

#### `AppConsumer.disconnect` (users/app_consumer.py:54–67)
Marks user offline, deletes `user_screen:{user_id}` immediately (don't make matchmaking wait out the TTL on a known-offline user).

### Telemetry

#### `_emit_search_event(event_type, ...)` (mlb/match_mode_consumer.py)
Sync DB insert into `MatchSearchEvent`. For terminal events (`queue_paired`, `invite_accepted`, `bot_fallback`), automatically merges `was_push_conversion` and `recency_bucket` into the metadata so the per-bucket conversion dashboards work without an external join.

#### `_search_latency_ms()` (mlb/match_mode_consumer.py)
Returns `(now - search_started_at) * 1000` as int, or None. Populated on terminal events for the latency rollup.

#### `rollup_match_search_stats(target_date_iso=None)` Celery task (mlb/tasks.py)
Aggregates one day's `MatchSearchEvent` rows into `MatchSearchDailyStats`. Idempotent on `(date, topic_id)`. Detailed in Diagram 9.

#### `_aggregate_match_search_day(target_date)` (mlb/tasks.py)
The aggregation worker. Reads all events for the day, partitions by `topic_id`, runs `_stats_for(events)` on each partition + a global partition, upserts into `MatchSearchDailyStats`.

#### `_percentile(sorted_values, pct)` (mlb/tasks.py)
Pure function for inclusive linear-interpolation percentile. Used to compute `match_latency_p50_ms` and `match_latency_p95_ms`.

#### `purge_old_match_search_events(retention_days=90, batch_size=10000)` Celery task (mlb/tasks.py)
Deletes `MatchSearchEvent` rows older than the cutoff in batches, to avoid long table locks.

#### `python manage.py rollup_match_stats --date=YYYY-MM-DD` (mlb/management/commands/rollup_match_stats.py)
Backfill command. Accepts `--date=YYYY-MM-DD` for a single day, or `--start=… --end=…` for a range.

---

## Settings reference

All in `npc/settings.py`. Tunable without a release.

| Setting | Default | What it controls |
|---|---|---|
| `MATCH_SEARCH_BUDGET_SEC` | 15 | Total time before bot fallback |
| `INVITE_RING_TIMEOUT_SEC` | 5 | How long each WS invite rings |
| `CLAIMED_TO_START_TIMEOUT_SEC` | 5 | Accept→quiz-socket safety-net window |
| `PAIR_COOLDOWN_ONLINE_SEC` | 300 | After WS decline, don't re-target this pair for 5 min |
| `DROP_AFTER_ACCEPT_COOLDOWN_SEC` | 1800 | After accept-then-no-show, 30 min cooldown |
| `INVITE_RATE_PER_MIN` / `_PER_HR` | 1 / 6 | Per-recipient WS-invite rate caps |
| `PUSH_HOURLY_CAP` | 1 | Max pushes per recipient per hour |
| `PUSH_QUIET_HOURS` | (22, 8) | IST window when push lane is silent |
| `PUSH_MAX_PER_SEARCH` | 5 | Total pushes per single search |
| `PUSH_TIER_QUOTA_PER_SEARCH` | {0:3, 1:1, 2:1} | Per-tier slot reservation (with rollover) |
| `PUSH_RECENCY_BUCKETS` | tuples | (max_days, daily_cap_baseline, daily_cap_engaged, pair_cooldown_sec) per tier |
| `PUSH_COPY_TEMPLATES` | dicts | Title/body per tier (only `{topic_name}` placeholder) |
| `PUSH_ENGAGED_THRESHOLD_RATE` / `_SAMPLES` | 0.5 / 5 | When does a user get the engaged daily-cap |
| `PUSH_CONVERSION_WINDOW_SEC` | 600 | How long a push-attribution lookup is valid (10 min) |
| `DECLINE_RATE_THRESHOLD` / `_MIN_SAMPLES` | 0.2 / 10 | When does a user get de-prioritized |
| `USER_SCREEN_TTL_SEC` | 300 | TTL on `user_screen:{user_id}` before stale |
| `MATCHMAKING_DND_SCREENS` | {inside_match, inside_mock_test, payment} | Hard-blocked from invites |
| `MATCHMAKING_PRIORITY_SCREENS` | {matchmaking, live_matches} | Priority-ranked for invites |

---

## Reference: Redis key map

| Key | Type | TTL | Purpose |
|---|---|---|---|
| `match_queue:{topic_id}` | sorted set | none | Per-topic search queue |
| `match_search:{user_id}` | string (JSON) | 120s | The user's current search state |
| `invite_lock:{candidate_id}` | string | 5s | One-at-a-time WS invite mutex |
| `pair_lock:{lo}_{hi}` | string | 30s | Pair-finalize race protection |
| `pair_cooldown:{searcher}:{candidate}` | string | 5m WS / 30m–24h push | Don't re-target this pair |
| `invite_count_min:{candidate}` | counter | 60s | Per-recipient WS-invite/min cap |
| `invite_count_hr:{candidate}` | counter | 3600s | Per-recipient WS-invite/hour cap |
| `push_count_hr:{candidate}` | counter | 3600s | Per-recipient push/hour cap |
| `push_count_day:{candidate}` | counter | 86400s | Per-recipient push/day cap (tier-aware) |
| `push_attribution:{candidate}` | string | 600s | Recent-push tier, for conversion attribution |
| `push_stats:{candidate}` | hash | none | `{sent, tapped, converted}` for engaged-tier promotion |
| `user_invite_stats:{candidate}` | hash | none | `{sent, accepted, declined, timed_out, dropped_after_accept}` |
| `user_screen:{user_id}` | string | 300s | Current FE screen, written by AppConsumer |
| `quiz_socket_joined:{quiz_id}:{user_id}` | string | 30s | Accept→start safety-net signal |

---

## Reference: Channel-layer dispatch

| Group | Sender | Handler | Purpose |
|---|---|---|---|
| `user_{candidate}` | inviter `_send_invite_and_wait` | `AppConsumer.receive_invite` | WS invite delivery |
| `match_mode_{inviter}` | `AppConsumer.invite_response` | `MatchModeConsumer.invite_response` | Response routing |
| `match_mode_{peer}` | self `_finalize_match_with_peer` | `MatchModeConsumer.match_found_dispatch` | Deliver match_found + cancel peer's search |
| `match_mode_{peer}` | self `_finalize_match_with_peer` | `MatchModeConsumer.join_pair_group` | Join shared pair group |
| `pair_match_{lo}_{hi}` | either side | `MatchModeConsumer.lobby_event` / `start_match` | ready_up, unready, leave_lobby, start |
| `quiz_{quiz_id}` | legacy invite path | `MatchModeConsumer.lobby_event` | Legacy < 4.4.0 path |
| `live_topical_matches` | legacy `add_random_to_list` | `AppConsumer.broadcast_live_matches` | Legacy < 4.4.0 path |
| `user_{candidate}` | inviter on timeout | `AppConsumer.invite_expired` | Clear stale modal |

---

## Backwards compatibility

The legacy `random_invite` / `stop_random_lookup` / `assign_opponent` actions are left fully functional for clients < 4.4.0. They serve their old behavior:
- `random_invite` registers in the live-match broadcast pool (NOT the new search queue)
- `stop_random_lookup` removes from the live-match pool
- `assign_opponent` runs `_run_assign_opponent`, emits `invite_response`/`accept_invite` (the wire old clients are coded against)

The new flow is selected purely by action name (`look_for_opponent`) — no version sniffing in the consumer. New clients send only the new actions; old clients send only the old ones.

---

## FAQ

**Q: What if both A and B start searching at literally the same instant?**
The pair lock (Diagram 4) ensures only one of them drives the finalize. The other quietly cleans up locally and receives `match_found` via `match_found_dispatch`. From the user's POV, both see the same opponent at the same time.

**Q: What if A's search task is running and someone else (B) claims A from the queue?**
B's `_finalize_match_with_peer` sends `match_found_dispatch` to A's group. A's handler cancels the search task, cleans up, and forwards `match_found` to A's client. A's loop never gets a chance to pair with anyone else or fall back to a bot.

**Q: What if a user accepts a WS invite but then crashes / closes the app?**
The accept→start safety net (`_wait_for_quiz_socket`) waits 5 seconds for their match-mode socket to attach. If it doesn't, drop recovery kicks in — they get a 30-minute pair-cooldown, and the searcher's loop continues.

**Q: What if all candidates are on DND screens (mid-mock-test, etc.)?**
The candidate filter excludes them. If no one is invitable, the loop sleeps 1s and retries, and eventually bot-falls-back at the budget deadline.

**Q: What if I push someone but they tap the notification 30 minutes later?**
The `push_attribution:{user_id}` key has TTL 10 minutes (default). At 30 minutes it has expired, so the conversion isn't attributed. Their organic search proceeds normally.

**Q: What if the same user is pushed by multiple searchers in the same minute?**
The hourly cap (`PUSH_HOURLY_CAP=1`) prevents that — they only get one push per hour. The second searcher's filter would drop them.

**Q: What about screen tracking for offline users?**
Screen state only matters for online users (the WS lane). Offline users are reached via the push lane, which doesn't consult `user_screen` at all. Push eligibility is governed by `last_login`, push caps, and quiet hours.

**Q: How do I add a new tier (say, tier 3 for 11–30 day dormancy)?**
Three places: append to `PUSH_RECENCY_BUCKETS`, append to `PUSH_COPY_TEMPLATES`, set quota in `PUSH_TIER_QUOTA_PER_SEARCH` (and bump `PUSH_MAX_PER_SEARCH`). Also add `pushes_sent_tier_3` and `pushes_converted_tier_3` columns to `MatchSearchDailyStats` via a migration. The rollup task references tier indices 0–2 hardcoded; that needs updating too.

---

## What this doc isn't

- **Not the design spec.** That's `docs/matchmaking_redesign.md` — has the rationale, alternatives, deferred decisions.
- **Not the test plan.** That's a separate exercise — see the load-test scenarios discussed earlier in the conversation history if needed.
- **Not the FE doc.** §7 of `matchmaking_redesign.md` covers FE wiring (`autoFindMatch=1` URL flag, `notificationActionPerformed` listener, etc.).
