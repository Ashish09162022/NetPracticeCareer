# Matchmaking Redesign — "Find Match" Flow

**Status:** Design — not implemented yet.
**Owners:** Backend (Ankit), Frontend (Ashish).
**Goal:** Replace the current multi-click matchmaking flow with a single "Find Match" button. The backend handles candidate selection, invitations, push fallback, and bot assignment automatically based on a configurable time budget.

---

## 1. Why we're changing this

The current flow requires multiple frontend-driven actions (`random_invite` → `assign_opponent`) and exposes the matchmaking state machine to the client. This creates friction (extra clicks), races (the `stop_random_lookup` ↔ `assign_opponent` bug), and limits our ability to tune behavior server-side.

The new flow:

- One frontend button → one server-driven search.
- Server orchestrates: queue pairing, WS invites to online users, push notifications to recently-offline users, bot fallback after a configurable timeout.
- All timing, cooldowns, and rate limits are server-side settings — tunable without releases.

---

## 2. User-visible behavior

1. User taps **Find Match** on the matchmaking screen.
2. Frontend shows a "Looking for opponent…" state.
3. Within ~15 seconds, one of the following happens:
   - **Paired with a real user** (mutual queue match, or a user accepted an invite).
   - **Paired with a bot** (no real user accepted in time).
4. User can tap **Cancel** at any moment → search aborts, no match, no cooldowns applied.

Recently-active users (last opened the app within 10 days) may receive a push notification. The copy varies by how recently they were active — a user who was on the app yesterday gets a different message than one who hasn't opened it in a week. Tapping deep-links to the matchmaking screen, which auto-starts a new search; the queue pairs them with whoever is currently waiting.

This widens the candidate pool well beyond just-disconnected users and turns matchmaking into a re-engagement vector for dormant users.

Cooldowns and rate limits prevent users from being pinged excessively. These are described in section 6.

---

## 3. Architecture overview

```
                         ┌─────────────────────────┐
   User taps Find Match  │   MatchModeConsumer     │
   ───────────────────►  │   action="random_invite"│
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │  enqueue self in        │
                         │  match_queue:{topic_id} │
                         └────────────┬────────────┘
                                      │
                  ┌───────────────────┴────────────────────┐
                  │ Is anyone else already in this queue?  │
                  └───┬────────────────────────────────────┘
                      │
            ┌─────────┴──────────┐
            │ YES                │ NO
            ▼                    ▼
   ┌────────────────┐   ┌─────────────────────────────┐
   │ Mutual short-  │   │ Start invite-loop (asyncio  │
   │ circuit:       │   │ task, time-budgeted ~15s):  │
   │ pair both,     │   │  • Pick candidate           │
   │ status=MATCHED │   │  • Apply cooldowns / caps   │
   └────────────────┘   │  • WS invite (online) OR    │
                        │    push (recent-offline)    │
                        │  • Wait 3s / fire-and-go    │
                        │  • On accept → CLAIMED      │
                        │  • On budget exhausted →    │
                        │    bot fallback             │
                        └─────────────────────────────┘
```

**Key principle:** the invite loop runs as an asyncio task on the searcher's consumer. State lives in Redis (not on `self`), so we can move it to a Celery worker later without changing the WS protocol.

---

## 4. WebSocket protocol changes

### 4.1 `MatchModeConsumer` (path: `ws/match-mode/{quiz_id}/`)

#### Modified — `random_invite`

**App version note:** this action is only present in app version >= 4.0.0. Older clients don't expose the matchmaking entry that sends it, so no version gate is needed in the consumer.

Frontend sends:

```json
{ "action": "random_invite" }
```

Server response sequence (over the lifetime of one search):

| Server → Client | When | Payload |
|---|---|---|
| `search_state` | Immediately after enqueue | `{ "type": "search_state", "state": "QUEUED", "search_id": "<uuid>", "budget_ms": 15000 }` |
| `search_state` | When a candidate is being invited | `{ "type": "search_state", "state": "INVITING", "candidate_full_name": "..." }` (no PII like ID) |
| `match_found` | On successful pair (real user or bot) | `{ "type": "match_found", "opponent": <serialized>, "is_bot": true/false, "quiz_id": <int> }` |
| `lobby_event` | Triggered by mutual ready_up after pair | (existing payload, unchanged) |
| `start_match` | When both ready (existing) | (existing payload, unchanged) |

The frontend should treat `match_found` as the canonical "search ended successfully" signal.

#### Modified — `stop_random_lookup`

Frontend sends:

```json
{ "action": "stop_random_lookup" }
```

Server: full cleanup — dequeue, cancel invite-loop task, release any held claim-locks, no cooldowns applied. Sends:

```json
{ "type": "search_state", "state": "CANCELLED" }
```

This is the universal cancel for any non-terminal search state.

#### Deprecated — `assign_opponent`

The frontend should **stop sending `assign_opponent`**. Bot fallback is now driven entirely by the server's time budget.

For a one-release transition the backend will keep accepting it as a no-op (no error, no effect) so a stale client doesn't crash. Remove from frontend in this release; backend will remove the handler in the next.

### 4.2 `AppConsumer` (path: existing)

#### New — `screen_change`

Frontend should send this whenever the user navigates between screens:

```json
{ "action": "screen_change", "screen": "matchmaking" }
```

Allowed values for `screen`:

| `screen` value | Meaning | Invite eligibility |
|---|---|---|
| `matchmaking` | Find Match / random match screen | Priority — actively looking |
| `live_matches` | Live matches list / lobby | Priority — actively looking |
| `home` | Main home / dashboard | Eligible |
| `syllabus` | Syllabus / topics browser | Eligible |
| `solo_practice` | Solo practice quiz | Eligible |
| `solo_report` | Solo practice result screen | Eligible |
| `live_match_result` | Live match result screen | Eligible |
| `growth` | Growth / progress screen | Eligible |
| `mock_test` | Mock test list / pre-test screen | Eligible |
| `profile` | Profile / settings | Eligible |
| `inside_match` | Currently playing a live match | **Blocked** — do not invite |
| `inside_mock_test` | Currently inside an active mock test | **Blocked** — do not invite |
| `payment` | Mid-payment flow | **Blocked** — do not invite |

The backend uses this for candidate selection:

- **Priority screens** (`matchmaking`, `live_matches`) are picked first in the invite loop — these users are explicitly waiting.
- **Eligible screens** are picked next, in the order produced by the existing `get_opponents` ranking (friends → recent opponents → general pool).
- **Blocked screens** are skipped entirely from the WS lane regardless of cooldowns / caps. The block is non-negotiable: a user mid-mock-test or mid-payment must not be interrupted.

No server response is sent (fire-and-forget). The backend stores the value at `user_screen:{user_id}` in Redis with a 5-minute TTL. The set of blocked / priority screens is server-side configuration so it can be tuned without a release.

**Scope:** screen state is only consulted for **online users** (the WS invite lane). For offline users targeted by the push lane, `user_screen` is irrelevant and isn't read — push eligibility is governed entirely by `last_login` recency, push caps, and quiet hours. So a user mid-`inside_mock_test` is hard-blocked from WS invites; once they go offline, push eligibility kicks in normally based on their last-active time, not their last-known screen.

### 4.3 Push notification deep link

Push payload shape (sent to recently-active users — see §4.4 for which users qualify):

```json
{
  "title": "<varies by recency tier>",
  "body": "<varies by recency tier>",
  "type": "match_request_v2",
  "deep_link": "npc://matchmaking/topic/{tree_node_id}",
  "tree_node_id": 4321,
  "topic_name": "..."
}
```

The shape is the same across all tiers — the title/body strings are different. Server fills them from `PUSH_COPY_TEMPLATES` (see §5.6). All fields are sent under the FCM `data` object, so the FE listener (`notificationActionPerformed`) gets them via `event.notification.data.*` directly — no URL parsing needed; just read `data.tree_node_id` (see §7.4.1).

**No inviter identity in the payload.** The original inviter's name is **not** included anywhere. The queue-based design means a recipient who taps a push may end up paired with a different searcher entirely (whoever is currently waiting on the topic), so promising "X is looking to play" would be wrong as often as it's right. Copy and payload stay person-agnostic and topic-focused; the recipient learns who their actual opponent is via `match_found` after the queue pairs them.

**Deep link uses `tree_node_id` (topic), not `quiz_id`.** A `UserQuiz` row is per-user; the inviter's `quiz_id` is meaningless to the recipient. The recipient's frontend resolves the topic to their own `UserQuiz` via the existing endpoint:

```
GET /api/mlb/v3/topical-quiz/create/?topic-id={tree_node_id}
```

This endpoint is **idempotent** — see `mlb/apiV3/utils.py:177-188`. If the user already has a `WAITING` or `STARTED` `UserQuiz` for this topic, it's reused; otherwise a new one is created. Safe for repeated push taps. Frontend already has a typed wrapper (`src/apis/createQuiz/createQuiz.ts`) and a hook (`src/hooks/useCreateTopicalQuizAndUpdateTopic.tsx`) that handle this — see §7.4.3 for the wiring.

**No `recency_bucket` in the payload.** The backend computes it from the recipient's `last_login` at search time, and conversion attribution is done server-side by joining the recipient's `random_invite` to the most recent `push_sent` event for that user (within a configurable window, default 10 minutes). The frontend doesn't need to carry any tracking field.

Default copy by tier (person-agnostic — see note below):

| Tier | `recency_bucket` | Last active | Title | Body |
|---|---|---|---|---|
| Active | `0` | < 1 day | "Quick match available" | "A {topic_name} match is starting — tap to play" |
| Mild dormancy | `1` | 1–3 days | "Want a quick match?" | "Up for a quick {topic_name} match? It only takes 5 minutes" |
| Re-engagement | `2` | 4–10 days | "We miss you" | "Come back for a quick {topic_name} match" |

These strings are settings-driven, so you can tune them without a release.

Frontend, on receiving a `match_request_v2` push:
- On tap, take the embedded `tree_node_id` from the deep link, resolve it to the user's own `quiz_id` using the existing get-or-create endpoint, and open the matchmaking screen → connect to `ws/match-mode/{their_quiz_id}/` → send `random_invite`.
- Frontend does **not** need to render different UI per tier — once the user is in the app, the matchmaking screen is the same.
- Do **not** auto-pair with the original inviter; the queue handles pairing whoever is currently waiting (which is usually the original inviter, but may be someone newer if the inviter already got matched).
- The `random_invite` action is sent unchanged from the normal matchmaking flow — no special fields, no `recency_bucket`, no `via_push` flag. Backend handles conversion attribution by joining server-side.

### 4.4 Push lane lifecycle (worked example)

A walkthrough showing how a search dovetails with pushes — useful for understanding why the queue, not the push, does the actual pairing.

**Scenario:** User A taps Find Match at t=0 on topic "Polity". Candidate pool:

- B — online, on home screen
- C — recently offline, last active 12 min ago (tier 0)
- D — recently offline, last active 25 min ago (tier 0)
- E — last active 2 days ago (tier 1)
- F — last active 7 days ago (tier 2)

```
t=0.0   A enqueues. Server starts search task. Budget = 15s.
        ├─► WS lane: invite B (3s ring)
        └─► Push lane (parallel, fire-and-forget):
            • C, D get tier-0 copy ("Quick match available")
            • E gets tier-1 copy ("Want a quick match?")
            • F gets tier-2 copy ("We miss you")
            • For each: mark push_count_day++, set pair_cooldown:A:* by tier,
              emit push_sent event with recency_bucket in metadata.
            (Search task does NOT wait for any push response.)

t=2.1   B declines. pair_cooldown:A:B (300s). Loop continues.

t=2.5   C's phone buzzes. (D, E, F also buzz.)

t=4.0   C taps the notification.
        Frontend reads tree_node_id from the deep link, resolves it to C's
        own UserQuiz (existing endpoint), opens ws/match-mode/{c_quiz_id}/,
        and sends:
        { "action": "random_invite" }
        (no extra fields — same wire as an organic search.)

t=4.1   Server processes C's random_invite.
        Server checks for a recent push_sent event for C — finds the one
        from t=0.0, copies its recency_bucket into the search's metadata.
        C's enqueue check finds A already waiting in match_queue:{topic}.
        Mutual short-circuit pairs A and C atomically.
        Both receive match_found.
        Server emits queue_paired event with metadata.recency_bucket=0
        and metadata.was_push_conversion=true (so dashboards can credit
        this match to the push).

   D, E, F's pushes remain untapped. No harm done — their daily cap
   is respected, no further pushes from A for the cooldown window.
```

**If C taps too late** (say t=20, after A is already playing a bot):

- C's `random_invite` still works.
- C enqueues normally.
- If another searcher X is waiting on Polity → mutual pair with X. The push still produced a real match — just not with A.
- If no one is waiting → C's own search task starts (with its own push lane).

So pushes are **never wasted**: they help the original searcher, the next searcher, or warm the pool for the one after.

**Why we don't "ring-and-wait" on pushes (the way we do on WS invites):**

A naive design would push C, then hold A↔C as a reserved pair until C taps. We don't do this because:

1. Push round-trip is 15–60s in practice. A's 15s search budget would expire long before most taps land.
2. Holding reservations across a push round-trip blocks A from progressing with other invites — either we block A (bad UX) or we don't reserve (race).
3. If A already got matched and C taps "accept" 30s later, the app would have to show "sorry, that match is gone" — which feels broken.

The queue-based design sidesteps all three. The push is just "come play"; the queue does the actual pairing.

**Pair cooldown is set on send, not on response.** For online WS invites we set cooldown on decline/timeout (a refusal signal). For pushes there's no refusal signal — the recipient might just not have seen it yet. So we set `pair_cooldown:A:C` immediately on send. Otherwise A would re-push C every minute for an hour.

### 4.5 Online user invite delivery (WS lane)

Online users receive invites in real time over their **`AppConsumer`** WS (which they connect to on app launch — the same socket that handles screen tracking, friend requests, etc.). The invite delivery and response wire is largely the **existing protocol** from the current code, with two small additions for the new countdown UX.

#### Server → invitee (delivered via the invitee's AppConsumer)

```json
{
  "type": "invite_received",
  "user_data_id": 123,
  "profile_picture": "https://.../foo.jpg",
  "full_name": "Ankit",
  "quiz_id": 4567,
  "topic": { },
  "opponent": { },
  "search_id": "<uuid>",
  "expires_at_ms": 1730000003000
}
```

Field semantics:

- `user_data_id` — the inviter's user_data id (existing).
- `profile_picture`, `full_name` — inviter's profile (existing).
- `quiz_id` — the **inviter's** `UserQuiz` id (existing, kept). See note below on why this is fine for WS even though we changed it to topic-based for push.
- `topic` — serialized topic detail (existing).
- `opponent` — the invitee's own serialized profile (existing — sent so the FE doesn't need to re-fetch it for the lobby UI).
- `search_id` — **new**. UUID of the inviter's current search; lets server correlate the response and lets dashboards trace one search end-to-end.
- `expires_at_ms` — **new**. Server-side wall-clock (Unix ms) when this invite times out. Lets the frontend render a countdown ring without clock-drift drift problems. Set to `now + INVITE_RING_TIMEOUT_SEC` at send time and matches the server-side `invite_lock:{candidate_id}` TTL exactly.

The `quiz_id` here is the **inviter's** `UserQuiz` id — not a bug. Unlike the push deep-link case (where the recipient is offline and needs their own `quiz_id`), the WS invite happens between two live consumers that can share a quiz group keyed by either side's id. The existing `update_user_quiz_match` step on accept links the invitee's own `UserQuiz` to the inviter's match row.

#### Invitee → server (sent via the invitee's AppConsumer)

Existing action, unchanged on the wire:

```json
{
  "action": "invite_response",
  "user_data_id": 123,
  "quiz_id": 4567,
  "response": "accept_invite"
}
```

`user_data_id` and `quiz_id` are echoed back from the `invite_received` payload (the inviter's IDs). `response` is `"accept_invite"` or `"decline_invite"`.

The AppConsumer routes the response to the inviter's `match_mode_{from_user_id}` group, where the inviter's `MatchModeConsumer.invite_response` handler resolves the search.

#### Timing

| Phase | Duration | What's happening |
|---|---|---|
| Lock + send | <100 ms | `invite_lock:{candidate}` is SET-NX, `invite_received` is fanned out |
| Ring | `INVITE_RING_TIMEOUT_SEC` (default 5s) | Invitee sees the modal; can accept or decline |
| Server timeout | at TTL expiry | If no response, lock expires; inviter's `_send_invite_and_wait` returns timeout |
| Accept → start | ≤ `CLAIMED_TO_START_TIMEOUT_SEC` (default 5s) | Invitee's quiz socket must connect; otherwise drop-recovery fires |

**Note on `INVITE_RING_TIMEOUT_SEC`**: the earlier draft used 3s. In practice 3s is too tight for a human reaction (notice → focus → tap), so the default is bumped to **5s**. With a 15s search budget, that allows up to 3 sequential WS invites — fewer than 5 but more realistic per-invite. Tunable.

#### Race protection

`invite_lock:{candidate_id}` (TTL = `INVITE_RING_TIMEOUT_SEC`) is set with `SET NX`. If two inviters' search tasks try to invite the same candidate simultaneously, only one succeeds; the loser falls through to the next candidate. From the invitee's point of view, they see exactly one in-flight invite at a time.

#### Stale invite hygiene

If the invitee's AppConsumer drops while an invite is in flight (network blip, app backgrounded), nothing needs server-side cleanup. The `invite_lock` expires after the ring timeout, the inviter's `_send_invite_and_wait` returns timeout, and the loop continues. The old code's `match_mode_invite_{id}` and `invites_sent_{id}` Redis lists from `match_mode_consumer.py` are no longer needed — the lock is the source of truth.

---

## 5. Backend implementation

This section is the punch list for the backend dev.

### 5.1 Models

New file (or new app) `mlb/models_telemetry.py` — or add to existing `mlb/models.py`:

```python
class MatchSearchEvent(models.Model):
    EVENT_CHOICES = [
        ("search_started", "search_started"),
        ("queue_paired", "queue_paired"),
        ("invite_sent", "invite_sent"),
        ("invite_accepted", "invite_accepted"),
        ("invite_declined", "invite_declined"),
        ("invite_timeout", "invite_timeout"),
        ("accept_dropped", "accept_dropped"),
        ("push_sent", "push_sent"),
        ("bot_fallback", "bot_fallback"),
        ("search_cancelled", "search_cancelled"),
    ]
    LANE_CHOICES = [("ws", "ws"), ("push", "push"), ("queue", "queue"), ("bot", "bot")]
    OUTCOME_CHOICES = [
        ("accepted", "accepted"), ("declined", "declined"), ("timeout", "timeout"),
        ("dropped", "dropped"), ("cancelled", "cancelled"),
    ]

    search_id    = models.UUIDField(db_index=True)
    event_type   = models.CharField(max_length=32, db_index=True, choices=EVENT_CHOICES)
    user_id      = models.IntegerField(db_index=True)
    candidate_id = models.IntegerField(null=True, db_index=True)
    topic_id     = models.IntegerField(null=True, db_index=True)
    lane         = models.CharField(max_length=16, null=True, choices=LANE_CHOICES)
    outcome      = models.CharField(max_length=16, null=True, choices=OUTCOME_CHOICES)
    attempt_n    = models.PositiveSmallIntegerField(null=True)
    latency_ms   = models.PositiveIntegerField(null=True)
    created_at   = models.DateTimeField(auto_now_add=True, db_index=True)
    metadata     = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["search_id", "created_at"]),
            models.Index(fields=["event_type", "created_at"]),
            models.Index(fields=["topic_id", "event_type", "created_at"]),
        ]


class MatchSearchDailyStats(models.Model):
    date     = models.DateField(db_index=True)
    topic_id = models.IntegerField(null=True, db_index=True)  # null row = global

    searches_started      = models.PositiveIntegerField(default=0)
    searches_matched_real = models.PositiveIntegerField(default=0)
    searches_matched_bot  = models.PositiveIntegerField(default=0)
    searches_cancelled    = models.PositiveIntegerField(default=0)

    invites_sent      = models.PositiveIntegerField(default=0)
    invites_accepted  = models.PositiveIntegerField(default=0)
    invites_declined  = models.PositiveIntegerField(default=0)
    invites_timed_out = models.PositiveIntegerField(default=0)
    accepts_dropped   = models.PositiveIntegerField(default=0)

    pushes_sent       = models.PositiveIntegerField(default=0)
    pushes_converted  = models.PositiveIntegerField(default=0)

    # Per-recency-tier breakdown (indexes match PUSH_RECENCY_BUCKETS).
    pushes_sent_tier_0       = models.PositiveIntegerField(default=0)
    pushes_sent_tier_1       = models.PositiveIntegerField(default=0)
    pushes_sent_tier_2       = models.PositiveIntegerField(default=0)
    pushes_converted_tier_0  = models.PositiveIntegerField(default=0)
    pushes_converted_tier_1  = models.PositiveIntegerField(default=0)
    pushes_converted_tier_2  = models.PositiveIntegerField(default=0)

    match_latency_p50_ms = models.PositiveIntegerField(null=True)
    match_latency_p95_ms = models.PositiveIntegerField(null=True)

    class Meta:
        unique_together = [("date", "topic_id")]
        indexes = [models.Index(fields=["date", "topic_id"])]
```

`user_id`, `candidate_id`, `topic_id` are plain `IntegerField` (not `ForeignKey`) so events outlive their referents. Frappe Insights still joins on them via SQL.

### 5.2 Redis schema

| Key | Type | TTL | Purpose |
|---|---|---|---|
| `match_queue:{topic_id}` | sorted set, score=enqueue_ts, member=user_id | none (cleaned up by removals) | Per-topic search queue |
| `match_search:{user_id}` | string (JSON) | 120s, refreshed | The user's current search state: `{search_id, status, started_at, budget_remaining_ms, claimed_candidate_id}` |
| `invite_lock:{candidate_id}` | string (search_id of holder) | 3s | Prevents two inviters from claiming the same candidate |
| `pair_cooldown:{a}:{b}` | string (1) | 300s online; per-tier for push (30m / 12h / 24h) | Per-pair recent-decline cooldown |
| `invite_count_min:{user_id}` | counter | 60s | Global per-minute invite cap |
| `invite_count_hr:{user_id}` | counter | 3600s | Global per-hour invite cap |
| `push_count_day:{user_id}` | counter | 86400s | Daily push cap |
| `push_count_hr:{user_id}` | counter | 3600s | Hourly push cap |
| `push_stats:{user_id}` | hash `{sent, tapped, converted}` | none (aged out by job) | For engagement tier promotion |
| `user_invite_stats:{user_id}` | hash `{sent, accepted, declined, timed_out, dropped_after_accept}` | none | Decline-rate filter |
| `user_screen:{user_id}` | string | 300s, refreshed | Current frontend screen |

### 5.3 `AppConsumer` changes

In `users/app_consumer.py`:

- Add `screen_change` action handler in `receive_json`. Stores screen on `self.current_screen` and writes `user_screen:{user_id}` with 300s TTL.
- On `disconnect`, delete `user_screen:{user_id}` immediately (don't wait for TTL).

### 5.4 `MatchModeConsumer` rewrite

In `mlb/match_mode_consumer.py`:

- **Rewrite `add_random_to_list`** as the new search entry point. It now:
  - Generates a `search_id` UUID.
  - Writes `match_search:{user_id}` with status=`QUEUED`.
  - Adds to `match_queue:{topic_id}`.
  - Performs the **mutual short-circuit check** (see 5.5).
  - If no peer found, spawns `_run_search_task` as `asyncio.create_task`.
  - Emits `search_started` telemetry event.
- **Rewrite `stop_random_lookup`** as the universal cancel:
  - Cancels `_search_task` if running.
  - Removes self from `match_queue:{topic_id}`.
  - Deletes `match_search:{user_id}`.
  - Releases any `invite_lock` held in self's name.
  - Emits `search_cancelled` telemetry event.
  - Sends `{type: "search_state", state: "CANCELLED"}` to the client.
- **Make `assign_opponent` a no-op** with a deprecation log line. Remove in next release.

### 5.5 The search task

Pseudocode for `_run_search_task`:

```python
async def _run_search_task(self, search_id, topic_id):
    deadline = time.time() + settings.MATCH_SEARCH_BUDGET_SEC
    attempt = 0

    # Push lane fires once at the start, in parallel.
    asyncio.create_task(self._send_push_invites(search_id, topic_id))

    while time.time() < deadline:
        # Re-check mutual queue first — someone may have just enqueued.
        peer = await self._find_queue_peer(topic_id)
        if peer:
            ok = await self._claim_pair(self.user_data.id, peer)
            if ok:
                await self._finalize_match(peer, is_bot=False)
                return

        candidate = await self._pick_next_candidate(topic_id, attempt)
        if not candidate:
            await asyncio.sleep(1)  # wait briefly, candidate pool may refill
            continue

        attempt += 1
        ok = await self._send_invite_and_wait(candidate, search_id)  # 3s ring
        if ok:
            # Accepted — wait for their quiz socket.
            survived = await self._wait_for_quiz_socket(candidate, timeout=settings.CLAIMED_TO_START_TIMEOUT_SEC)
            if survived:
                await self._finalize_match(candidate, is_bot=False)
                return
            else:
                # Drop recovery: penalize, continue searching if budget remains.
                await self._apply_drop_penalty(candidate)
                await self._emit_telemetry("accept_dropped", candidate_id=candidate)
                continue
        # Decline / timeout: cooldown applied inside _send_invite_and_wait, loop continues.

    # Budget exhausted → bot fallback.
    bot = await self._assign_bot()
    await self._finalize_match(bot, is_bot=True)
```

`_pick_next_candidate` operates **only on online users** (the WS invite lane). The candidate pool is restricted to `online == True` from the start; offline users are exclusively the push lane's concern (handled in `_send_push_invites`, which does not look at `user_screen` at all).

Filter order, applied to the online pool:

1. **Hard exclusion** — drop anyone whose `user_screen:{id}` is in `MATCHMAKING_DND_SCREENS` (`inside_match`, `inside_mock_test`, `payment`). These are non-negotiable.
2. **Soft filters** — drop anyone with active `pair_cooldown`, who is global rate-limited, or whose decline_rate < 0.2 with sample > 10 (the last one is pushed to back of pool, not dropped).
3. **Priority bucket** — users whose screen is in `MATCHMAKING_PRIORITY_SCREENS` (`matchmaking`, `live_matches`) are tried first. They've explicitly raised their hand.
4. **Eligible bucket** — everyone else online with a tracked screen value (`home`, `syllabus`, `solo_practice`, `solo_report`, `live_match_result`, `growth`, `mock_test`, `profile`).
5. **Stale-screen handling** — if `user_screen:{id}` is missing (TTL expired) but the user is still online, treat as eligible but lower priority than tracked-eligible. Don't drop entirely; the user is connected and might just have a quiet AppConsumer.
6. Within each bucket, sort by: friends first → recent opponents → general pool (lift from the existing `get_opponents` helper).

`_send_invite_and_wait` sets `invite_lock`, increments rate counters, sends WS, awaits response with 3s timeout, applies pair cooldown on decline/timeout (TTL by online status), updates `user_invite_stats`.

#### Candidate pool per tier

For each `PUSH_RECENCY_BUCKETS` entry, build an eligible list of candidates filtering by:

1. `online == False` (online users go through WS lane, not push).
2. `last_login` within the bucket's day window.
3. `pair_cooldown:{a}:{candidate}` not set.
4. `push_count_day:{candidate}` below the bucket's daily cap (tier-aware: baseline vs engaged based on `push_stats:{candidate}`).
5. `push_count_hr:{candidate}` below `PUSH_HOURLY_CAP`.
6. Current time outside `PUSH_QUIET_HOURS`.

#### Tier-quota allocation (with rollover)

`_send_push_invites` does **not** greedy-fill tier 0 first and only spill to lower tiers when tier 0 is exhausted — that would starve the re-engagement pool at any meaningful scale. Instead it allocates per-tier quotas with rollover:

```python
PUSH_TIER_QUOTA_PER_SEARCH = {
    0: 3,   # tier 0: <1 day
    1: 1,   # tier 1: 1–3 days
    2: 1,   # tier 2: 4–10 days
}
# sum == PUSH_MAX_PER_SEARCH (5)
```

Algorithm:

1. For each tier `t`: pick up to `PUSH_TIER_QUOTA_PER_SEARCH[t]` candidates from `eligible[t]`.
2. **Rollover**: any unfilled quota redistributes — tier 0 underfill rolls down (tier 0 → tier 1 → tier 2); tier 1 and tier 2 underfill roll **up** (favor higher-conversion tiers when re-engagement candidates are scarce).
3. Total selected never exceeds `PUSH_MAX_PER_SEARCH`.

This guarantees tier 2 always gets at least 1 push when a qualifying tier-2 candidate exists, and a power-user with many tier-0 friends doesn't hog the entire budget. At low scale (most candidates in tier 2), all 5 slots can fill from tier 2 via rollover; at higher scale the quotas bite and bias toward tier 0.

#### Send loop

For each selected candidate, build the `data` dict from `PUSH_COPY_TEMPLATES[tier]` and dispatch via the existing `send_generic_notification` helper:

```python
copy = settings.PUSH_COPY_TEMPLATES[tier]
data = {
    "title": copy["title"],
    "body":  copy["body"].format(topic_name=topic.name),       # only topic_name placeholder
    "type": "match_request_v2",                                # FE routing key
    "deep_link": f"npc://matchmaking/topic/{topic.id}",
    "tree_node_id": topic.id,                                  # FE reads this directly (no URL parsing)
    "topic_name": topic.name,
    "recency_bucket": tier,
}

send_generic_notification(
    notification_type=NotificationTypeChoices.MATCH_REQUEST,
    user_ids=[candidate.user_data.id],
    data=data,
)
```

Then:
- Increment `push_count_day:{candidate}`, `push_count_hr:{candidate}`.
- Set `pair_cooldown:{inviter.id}:{candidate.id}` with the tier's `pair_cooldown_sec` immediately (see §4.4 for why on send, not on response).
- Emit `push_sent` event with `metadata.recency_bucket = tier` and `candidate_id`.

#### Lazy `UserGoal` creation at push send time

Before sending the push, ensure the recipient has a `UserGoal` row for the topic's goal. The existing matchmaking code already does this for WS invites (`mlb/match_mode_consumer.py:check_opponent_user_goal`) — the push lane needs the same hook, otherwise when the recipient taps and the FE calls `topical-quiz/create/`, the view will 500 because it does `UserGoal.objects.get(...)` without get-or-create (`mlb/apiV3/views.py:240`). Mirror the existing helper:

```python
if not UserGoal.objects.filter(user_data=candidate.user_data, goal=topic.goal).exists():
    UserGoal.objects.create(user_data=candidate.user_data, goal=topic.goal, is_active=False)
```

`is_active=False` is intentional — we're not changing what they're studying, just preparing the FK so the matchmaking flow works.

**Push conversion attribution.** When a recipient later sends `random_invite` (whether from a push tap or organically — the wire is identical), the backend joins it to the most recent `push_sent` event for that user within `PUSH_CONVERSION_WINDOW_SEC` (default 600s = 10 min). If a match is found, the resulting search emits its terminal event (`queue_paired` / `invite_accepted` / `bot_fallback`) with `metadata.was_push_conversion = true` and `metadata.recency_bucket` copied from the originating `push_sent`. No frontend involvement.

The 10-min window is a tradeoff: too short and you miss legitimate conversions where the user opened the app a few minutes after the push; too long and you over-attribute organic searches that happened to follow an ignored push. Tunable via setting; revisit once you have telemetry on tap-to-search latency.

### 5.6 Settings

Add to `settings.py` (or an admin-editable config model):

```python
MATCH_SEARCH_BUDGET_SEC          = 15
INVITE_RING_TIMEOUT_SEC          = 3
CLAIMED_TO_START_TIMEOUT_SEC     = 5
PAIR_COOLDOWN_ONLINE_SEC         = 300       # WS lane (online users who decline)
DROP_AFTER_ACCEPT_COOLDOWN_SEC   = 1800
INVITE_RATE_PER_MIN              = 1
INVITE_RATE_PER_HR               = 6
PUSH_HOURLY_CAP                  = 1
PUSH_QUIET_HOURS                 = (22, 8)   # 10pm–8am IST
PUSH_ENGAGED_THRESHOLD_RATE      = 0.5
PUSH_ENGAGED_THRESHOLD_SAMPLES   = 5
PUSH_MAX_PER_SEARCH              = 5         # don't wake more than this many devices per search
PUSH_CONVERSION_WINDOW_SEC       = 600        # window to attribute a search as a push conversion

# Per-tier quota for the 5 push slots, with rollover when a tier under-fills.
# Sum should equal PUSH_MAX_PER_SEARCH.
PUSH_TIER_QUOTA_PER_SEARCH = {
    0: 3,   # tier 0: <1 day
    1: 1,   # tier 1: 1–3 days
    2: 1,   # tier 2: 4–10 days
}
DECLINE_RATE_THRESHOLD           = 0.2
DECLINE_RATE_MIN_SAMPLES         = 10
USER_SCREEN_TTL_SEC              = 300

# Screen-based filters apply ONLY to online users (the WS invite lane).
# Offline users are reached via the push lane, which uses last_login recency
# and does not consult user_screen at all.

# Screens where the user must NOT be interrupted by a match invite.
MATCHMAKING_DND_SCREENS = {"inside_match", "inside_mock_test", "payment"}

# Screens that get priority treatment — these users are explicitly looking.
MATCHMAKING_PRIORITY_SCREENS = {"matchmaking", "live_matches"}

# All other tracked screens are treated as eligible at normal priority:
# home, syllabus, solo_practice, solo_report, live_match_result, growth, mock_test, profile.

# Tiered push pool — order matters; first matching bucket wins.
# Each tuple: (max_days_since_last_active, daily_cap_baseline, daily_cap_engaged, pair_cooldown_sec)
PUSH_RECENCY_BUCKETS = [
    (1,  3, 8, 30 * 60),        # tier 0: < 1 day
    (3,  2, 4, 12 * 3600),      # tier 1: 1–3 days
    (10, 1, 2, 24 * 3600),      # tier 2: 4–10 days
]

# Copy per tier — index matches PUSH_RECENCY_BUCKETS.
# Only placeholder is {topic_name}. The original inviter's name is intentionally
# NOT included anywhere — the recipient may end up matched with a different
# searcher via the queue, so naming a specific person would be misleading.
PUSH_COPY_TEMPLATES = [
    {  # tier 0 — recently active
        "title": "Quick match available",
        "body":  "A {topic_name} match is starting — tap to play",
    },
    {  # tier 1 — mild dormancy
        "title": "Want a quick match?",
        "body":  "Up for a quick {topic_name} match? It only takes 5 minutes",
    },
    {  # tier 2 — re-engagement
        "title": "We miss you",
        "body":  "Come back for a quick {topic_name} match",
    },
]
```

Notes:
- The old single `PAIR_COOLDOWN_OFFLINE_SEC` is gone — pair cooldown for the push lane is now per-tier (third element of each `PUSH_RECENCY_BUCKETS` tuple). Online WS users still use `PAIR_COOLDOWN_ONLINE_SEC`.
- Tier definitions and copy are co-indexed; if you add a tier, add a corresponding copy template.
- All values are server-side and tunable without a release.

### 5.7 Telemetry rollup job

Celery beat task `mlb/tasks.py:rollup_match_search_stats`:

- Runs nightly at 03:00 IST.
- Aggregates yesterday's `MatchSearchEvent` rows into `MatchSearchDailyStats`.
- One row per `(date, topic_id)`, plus a `topic_id=NULL` row for global.
- Idempotent: `update_or_create` on `(date, topic_id)`.
- Latencies: `match_latency_p50_ms` / `p95_ms` computed from `(queue_paired - search_started)` or `(invite_accepted - search_started)` durations per search_id.
- Per-tier counts: `pushes_sent_tier_N` and `pushes_converted_tier_N` computed by grouping `push_sent` / `queue_paired` events by `metadata.recency_bucket`. These survive the 90-day raw purge so you can do long-range tier-conversion trend analysis.

Management command for backfills: `python manage.py rollup_match_stats --date=YYYY-MM-DD`.

### 5.8 Raw event purge

Daily Celery beat task: delete `MatchSearchEvent` rows older than 90 days, in batches of 10 000 to avoid long locks.

### 5.9 Existing-code fixes prerequisite to push lane

Three small fixes to existing files are needed before the push lane goes live. None are in the new code; all are in code paths the push lane reuses.

#### 5.9.1 `topical-quiz/create/` endpoint defensive hardening

The existing endpoint (`mlb/apiV3/views.py:233`) is reused by the FE on push tap to resolve `tree_node_id` to the recipient's own `quiz_id` — see §4.3.

1. **Wrap `UserGoal.objects.get(...)` at line 240 in get-or-create.** The push-send path (§5.5) already lazy-creates the `UserGoal`, so this should be a defensive no-op in the happy path — but the endpoint should be safe to call independently of the push lane.
2. **Handle `create_topical_quiz()` returning `None`.** It can return `None` for topics whose `completed_once_done` or `exposure_done` parameters are `True` (`mlb/apiV3/utils.py:167, 175`). Currently the view doesn't check this and will throw `AttributeError` on `serialized_quiz.data`. Return a clean `400` with a clear error message; the FE will surface it as a toast (§7.4.4).

#### 5.9.2 `send_generic_notification` — create in-app Notification under MATCH_REQUEST

In `notification_new/tasks.py:442-453`, the `MATCH_REQUEST` branch currently only dispatches FCM push tokens; it does **not** create an in-app `Notification` record (the generic `else` branch does — see line 480). For the new push lane this is a real gap: a recipient who dismisses the OS push or has notifications disabled will lose the prompt entirely. With an in-app record, they see the invite in their notification panel on next app open and can still tap into matchmaking — the durable surface for re-engagement.

Mirror the generic branch's pattern inside the `MATCH_REQUEST` branch:

```python
elif notification_type == NotificationTypeChoices.MATCH_REQUEST:
    asset, _ = NotificationAssets.objects.get_or_create(
        title=data.get("title", "New match invite"),
        body=data.get("body", ""),
        type=data.get("type", "match_request_v2"),
    )
    all_fcm_tokens = []
    for user_id in user_ids:
        user_data = UserData.objects.get(id=user_id)

        # NEW: in-app record so the user sees it on next app open
        Notification.objects.create(asset=asset, user_data=user_data)

        if is_notification_allowed(user_data):
            fcm_tokens = FcmDevice.objects.filter(
                credential__user_data=user_data, is_active=True
            ).values_list("registration_id", flat=True)
            all_fcm_tokens.extend(fcm_tokens)
    if all_fcm_tokens:
        push_count += dispatch_fcm_tokens(all_fcm_tokens, data, scheduled_time=scheduled_time)
```

Notes:
- `NotificationAssets.get_or_create` keyed on `(title, body, type)` ensures we don't pile up duplicate asset rows for the same tier copy.
- The in-app record is created regardless of whether the user has push enabled (`is_notification_allowed`). Push-disabled users now still see invites in-app — exactly the durable surface we want.
- This change keeps the existing call from `match_mode_consumer.py:428` (the legacy direct-invite path) working too, so it's safe to ship before the new push lane is live.

#### 5.9.3 Implementation note

All three fixes are independent of each other and can be made in one PR before the push-lane work begins. They're listed as a single prerequisite step (§5.10).

### 5.10 Implementation order (suggested)

1. Models + migrations (`MatchSearchEvent`, `MatchSearchDailyStats`).
2. Settings constants.
3. `AppConsumer.screen_change` handler + Redis write.
4. `MatchModeConsumer.random_invite` rewrite — queue + mutual short-circuit only (no invite loop yet).
5. Invite loop with WS lane only (no push, no decline-rate filter).
6. Cooldowns + rate limits + claim-locks.
7. Decline-rate stats and filter.
8. Accept→start safety net + drop recovery.
9. **Existing-code fixes (§5.9)** — `topical-quiz/create/` hardening + `send_generic_notification` in-app record creation. Prerequisite for push lane.
10. Push lane integration (with lazy `UserGoal` creation per §5.5).
11. Telemetry event emission throughout.
12. Celery rollup + purge jobs.
13. Frappe Insights dashboards (Ankit, separately).

Each step is shippable on its own; you can pause the rollout after any of them and have a working (if reduced) feature.

---

## 6. Configuration reference (operational)

Knobs you'll most likely tune after launch:

| Setting | Default | What to watch |
|---|---|---|
| `MATCH_SEARCH_BUDGET_SEC` | 15 | Bot-fallback rate; user-perceived wait time |
| `INVITE_RING_TIMEOUT_SEC` | 3 | Invite acceptance rate |
| `PAIR_COOLDOWN_ONLINE_SEC` | 300 | Repeat-pair complaints |
| `PUSH_RECENCY_BUCKETS` (tier 2 daily cap) | 1 | Push-related uninstalls (this is the dormant-tier cap; tighten first if uninstalls climb) |
| `PUSH_COPY_TEMPLATES` (per tier) | see §5.6 | Tap-through and conversion rate per tier — A/B copy here based on telemetry |
| `PUSH_TIER_QUOTA_PER_SEARCH` | `{0: 3, 1: 1, 2: 1}` | Per-tier slot reservation. **Drop tier-2 quota to 0** if its conversion rate is weak after 2 weeks (see §8 query); shift the slot to tier 0/1 |
| `INVITE_RATE_PER_HR` | 6 | "Too many invites" complaints |

All of these are server-side; tune without releases.

---

## 7. Frontend implementation

This section is the punch list for the frontend dev.

### 7.1 Matchmaking screen

- Replace the multi-step "look for opponent → assign opponent" flow with a single **Find Match** button.
- On tap, send WS:
  ```json
  { "action": "random_invite" }
  ```
- Show "Looking for opponent…" UI from the moment the button is tapped until either `match_found` arrives or the user cancels.
- Handle incoming `search_state` events to update UI text:
  - `QUEUED` → "Looking for opponent…"
  - `INVITING` → "Asking {full_name}…" (use the name from payload; never display IDs)
  - `CANCELLED` → return to idle UI
- On `match_found`:
  - Transition to the lobby/quiz UI as today.
  - The existing `lobby_event` and `start_match` handlers are unchanged.
- **Cancel button** sends:
  ```json
  { "action": "stop_random_lookup" }
  ```
  Also send this on screen unmount or app backgrounding mid-search.

### 7.2 Stop sending `assign_opponent`

Remove all client-side calls to `assign_opponent`. The server now handles bot fallback automatically. (Backend will accept it as a no-op for one release for safety, but treat it as removed.)

### 7.3 Screen tracking via AppConsumer

On the existing AppConsumer WS, send `screen_change` whenever the user navigates between top-level screens:

```json
{ "action": "screen_change", "screen": "matchmaking" }
```

The full set of `screen` values to send (one of these per navigation, exact strings):

| Screen value | When to send |
|---|---|
| `home` | Home / dashboard mounted |
| `syllabus` | Syllabus / topics browser mounted |
| `solo_practice` | Solo practice quiz mounted |
| `solo_report` | Solo practice result screen mounted |
| `matchmaking` | Find Match screen mounted |
| `live_matches` | Live matches list / lobby mounted |
| `inside_match` | Live match in progress (user is playing) |
| `live_match_result` | Live match result screen mounted |
| `growth` | Growth / progress screen mounted |
| `mock_test` | Mock test list / pre-test screen mounted |
| `inside_mock_test` | Mock test in progress (user is taking it) |
| `profile` | Profile / settings mounted |
| `payment` | Mid-payment flow (in-app purchase, checkout, etc.) |

Important rules:

- Send the event *after* the screen actually mounts, not on navigation intent — backgrounded or aborted navigations would otherwise lie about state.
- For `inside_match`, `inside_mock_test`, and `payment`, **be especially careful** to send these the moment the user enters that flow. The backend uses these as "do-not-disturb" gates and will not invite a user with those screens active. A late `screen_change` here means the user could still get an invite while inside the test/match/payment.
- Equally important: send the *next* `screen_change` immediately on exit from a DND screen, so the user becomes invitable again as soon as they're free. (E.g., when the mock test completes and the report shows, send `screen_change: "solo_report"` or `"home"` — don't leave them stuck on `inside_mock_test`.)
- No response handling needed; this is fire-and-forget.

### 7.4 Push notification handling and bottom-sheet auto-trigger

This section maps the new push-driven matchmaking flow onto the **existing** frontend code so the FE dev doesn't need to invent any new infrastructure. The good news: every building block already exists. The new work is wiring them together with a notification-tap listener and an "auto-find-match" intent flag.

#### 7.4.1 Recognize the push and route the user

Currently `src/utils/registerPushNotifications.ts` only handles permissions — it never adds a `notificationActionPerformed` listener. That listener is the new piece.

Add one (Capacitor Firebase Messaging) at app boot, alongside the existing register call:

```ts
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
  const data = event.notification?.data;
  if (data?.type !== "match_request_v2") return;

  const treeNodeId = data.tree_node_id; // server sends this as a top-level field
  if (!treeNodeId) return;

  navigate(
    `${PathFor.topicPage.replace(":topicId", treeNodeId)}?autoFindMatch=1`
  );
});
```

A few notes:

- The deep link in the push payload is `npc://matchmaking/topic/{tree_node_id}` (see §4.3), but parsing it is brittle. The server also sends `tree_node_id` as a top-level field in `notification.data`; **read it from there**.
- `match_request_v2` is the new push type — distinct from any existing match-related push type so the listener can be added without touching old behavior.
- Routing to the topic page (`PathFor.topicPage`) reuses the existing entry path. The page already loads topic data (`loadTopicOverviewData`, `loadTopicHistoryData`) and opens the bottom sheet on mount via `Overview.tsx:39-51`. Reusing this means we get all the data-loading correctness for free.
- The `?autoFindMatch=1` query flag is the new bit — it tells the bottom sheet "the user got here via a push, immediately enter the find-opponent state."

#### 7.4.2 Auto-trigger find-opponent in the bottom sheet

`TopicBottomSheet.tsx` currently has the user manually tap "Find Opponent" to enter the matchmaking state (`handleFindAnOpponent`, line 111). For push entry, we need to call this programmatically — but only **after** the bottom sheet has a non-null `quizId`.

Add a `useEffect` to `TopicBottomSheet.tsx` (or a parent) that:

1. Reads `autoFindMatch` from the URL search params.
2. Waits for `topicData?.quizId` to be non-null. (This may take one render — see 7.4.3 on quiz-id bootstrap.)
3. Calls `handleFindAnOpponent()`.
4. Strips the URL flag (so a back-navigation re-render doesn't re-trigger).

Pseudocode:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const autoFindMatch = searchParams.get("autoFindMatch") === "1";

useEffect(() => {
  if (!autoFindMatch) return;
  if (topicData?.quizId == null) return;       // wait for quizId
  handleFindAnOpponent();
  searchParams.delete("autoFindMatch");
  setSearchParams(searchParams, { replace: true });
}, [autoFindMatch, topicData?.quizId]);
```

That's the entire push-driven entry — one listener and one effect. No new screens, no new redux slices.

#### 7.4.3 Quiz-id bootstrap (the existing lazy-create pattern handles this)

When the user taps a push for a topic they've never opened, their redux store has no `UserQuiz` for that topic — `topicData.quizId` will be `null`. The frontend already has a clean pattern for this:

- API wrapper: `src/apis/createQuiz/createQuiz.ts` calls `GET /api/mlb/v3/topical-quiz/create/?topic-id={tree_node_id}` and returns `{ quizId, topicId, sectionId, unitId }`.
- Hook: `src/hooks/useCreateTopicalQuizAndUpdateTopic.tsx` wraps the API call, dispatches `setQuizIdForTopic` to redux, and returns the `quizId`. The bottom sheet then re-renders with the new id and the WS connection comes up.
- Existing call site for organic flow: `TopicButton.tsx:88-99` (when user taps "Start Practicing" on a topic that doesn't yet have a quiz).

For the push flow, we need to invoke the same hook eagerly when the bottom sheet opens with `autoFindMatch=1`. Add this alongside the auto-trigger effect:

```tsx
const handleCreateQuiz = useCreateTopicalQuizAndUpdateTopic();

useEffect(() => {
  if (!autoFindMatch) return;
  if (topicData == null) return;
  if (topicData.quizId != null) return;        // already have one
  handleCreateQuiz({ topicData });             // creates and dispatches setQuizIdForTopic
}, [autoFindMatch, topicData]);
```

Once the dispatch lands, the auto-trigger effect from 7.4.2 fires (because `topicData.quizId` becomes non-null) and the search starts. Net: the user taps a push and within ~1s of landing on the topic page is in `lookingForOpponent` state.

The endpoint is **idempotent** — repeated taps for the same topic reuse any existing `WAITING`/`STARTED` `UserQuiz` (see `mlb/apiV3/utils.py:177-188`). Safe to call confidently.

#### 7.4.4 Defensive handling for edge cases

Two cases the FE should guard against:

1. **Endpoint returns null/empty body.** `create_topical_quiz()` can return `None` for topics in certain `exposure_done` / `completed_once_done` states (see `mlb/apiV3/utils.py:167, 175`). The view will currently 500 on this; backend will fix that (see §5.10), but the FE should also handle it gracefully — show a toast like "this topic isn't available for matches right now" and pop the user back to home rather than leaving them on a half-loaded matchmaking sheet.
2. **Deep link arrives while a search is already in progress.** If the user taps a second push while their previous push-driven search is still active, the second tap will navigate to a different topic page. The bottom sheet's existing `useEffect` (line 421-423: `resetTopicMatchSlice` on `topicId` change) handles state reset; but make sure the WS for the previous topic is properly closed (the existing `useTopicMatchModeSocket` hook should already do this on `topicMatchId` change — verify in QA).

#### 7.4.5 What to remove (cleanup from old flow)

Remove these from the FE during this change:

- `assign_opponent` send — `TopicBottomSheet.tsx:445-457`. The whole `useEffect` that calls `handleAssignOpponent` after a 1s delay is gone; bot fallback is now server-driven on the time budget.
- `getAssignOpponentActionData` import — `useTopicMatchModeSocket/actions.ts`. The action helper itself can be deleted once no callers remain.
- Any UI state tied to "we just sent assign_opponent, waiting for invite_response from bot" — replace with a simple `lookingForOpponent` state that ends when `match_found` arrives (see §4.1).

#### 7.4.6 Summary of the new push-tap flow (end to end)

```
Push arrives  ──►  registerPushNotifications listener fires
                     reads tree_node_id from notification.data
                     navigates to topic page with ?autoFindMatch=1
                                      │
                                      ▼
Topic page mounts ─►  Overview.tsx loads topic data + opens bottom sheet
                                      │
                                      ▼
TopicBottomSheet ──►  reads autoFindMatch=1 from URL
                       if quizId is null → calls useCreateTopicalQuizAndUpdateTopic
                                          (server: GET /api/mlb/v3/topical-quiz/create/)
                       waits for quizId via redux re-render
                       calls handleFindAnOpponent() programmatically
                       strips autoFindMatch flag from URL
                                      │
                                      ▼
matchmaking WS ───►   ws/match-mode/{their_quiz_id}/ opens
                       sends { action: "random_invite" }
                       server's queue / mutual short-circuit takes over
                       user receives match_found → lobby → start_match
```

Total new FE code: one `addListener` call, two `useEffect` blocks, plus removing the deprecated `assign_opponent` effect. Everything else (createQuiz API, useCreateTopicalQuizAndUpdateTopic hook, openTopicBottomSheet flow, useTopicMatchModeSocket, redux slices) is reused as-is.

### 7.5 App version note

This feature ships in app version **>= 4.0.0**. Older clients don't surface the new flow at all (the matchmaking entry that triggers `random_invite` is added in 4.0.0), so no compatibility code is needed on either side — no version gate, no "please update" prompt.

### 7.6 Invitee UI (online users receiving WS invites)

When a user is **online** (AppConsumer connected) and another user's search picks them as a WS-lane candidate, they receive an `invite_received` event over their AppConsumer socket. This is the **same event the existing app already handles** — the FE work here is mostly tightening the existing UI for the new shorter ring time, plus consuming two new fields.

**On `invite_received`:**

1. Show a prominent invite modal/dialog (existing UI, unchanged in shape). Display:
   - Inviter's avatar, name (`profile_picture`, `full_name`)
   - Topic name (`topic.name` or equivalent)
   - Two clear actions: **Accept** and **Decline**
2. Render a **countdown ring/bar** based on the new `expires_at_ms` field (`expires_at_ms - Date.now()`). The default ring is 5 seconds. Don't compute "5 seconds from receipt" client-side — use the server's wall-clock target so a slow network doesn't unfairly shrink the user's window.
3. On the countdown reaching 0 with no user action, dismiss the modal silently. Do **not** auto-send `decline_invite` from the FE — the server treats no-response and explicit decline differently in telemetry, and a silent timeout is the more accurate signal.
4. Suppress incoming `invite_received` events while the user is on a DND screen (`inside_match`, `inside_mock_test`, `payment`). The server will normally never send one to a DND-screen user, but as a belt-and-suspenders measure the FE should drop any that slip through (e.g. screen state mid-transition).

**On Accept (user tap):**

Send the existing action — wire is unchanged from the current implementation:

```json
{
  "action": "invite_response",
  "user_data_id": 123,
  "quiz_id": 4567,
  "response": "accept_invite"
}
```

Echo back the `user_data_id` and `quiz_id` from the `invite_received` payload (those are the inviter's IDs).

**On Decline (user tap):**

Same shape, with `"response": "decline_invite"` instead of `"accept_invite"`.

After accept, the existing lobby flow takes over: the user is added to the inviter's quiz_group, sees `lobby_event` updates, and `start_match` transitions them to the quiz. No new actions to handle on this side.

**Invite-expired event (when the inviter cancels mid-ring):**

The existing `invite_expired` event is also emitted by `app_consumer.py`. The FE should continue to handle it by dismissing the modal silently. The new flow uses this when an inviter's `stop_random_lookup` cancellation arrives while a ring is in progress.

---

## 8. Telemetry & dashboards

Events emitted (one row per event, all into `MatchSearchEvent`):

| Event | When |
|---|---|
| `search_started` | `random_invite` received, queue entry created |
| `queue_paired` | Mutual short-circuit pair succeeded |
| `invite_sent` | WS invite or push sent (`lane` distinguishes) |
| `invite_accepted` | Candidate's accept arrived |
| `invite_declined` | Candidate's decline arrived |
| `invite_timeout` | 3s ring elapsed without response |
| `accept_dropped` | Accepted candidate's quiz socket didn't connect within timeout |
| `push_sent` | Push notification dispatched (subset of `invite_sent` with `lane=push`) |
| `bot_fallback` | Search budget exhausted, bot assigned |
| `search_cancelled` | User-initiated cancel |

**Standard `metadata` keys** populated by the backend on each event:

- `recency_bucket` (int, 0–2) — set on `push_sent` events. Also set on a search's terminal event (`queue_paired` / `invite_accepted` / `bot_fallback`) when the search was attributed as a push conversion (see below).
- `was_push_conversion` (bool) — set on a search's terminal event if the backend matched the search to a recent `push_sent` for the same user (within `PUSH_CONVERSION_WINDOW_SEC`). Frontend never touches this; it's pure server-side join.
- `candidate_pool_size` — for diagnosing why bot fallbacks happen (small pool vs no acceptances).
- `attempts_made` — number of WS invites tried before this terminal event.
- `is_engaged` — whether the user was promoted to engaged-tier push caps at the time of the event.

Dashboard-ready queries (mostly typed columns; bucket queries use a single JSON extract):

- **Bot fallback rate by topic, last 7 days**
  `SELECT topic_id, COUNT(*) FROM mlb_matchsearchevent WHERE event_type='bot_fallback' AND created_at > NOW() - INTERVAL 7 DAY GROUP BY topic_id`
- **Median time-to-real-match, last 30 days**
  Join `search_started` and `queue_paired` / `invite_accepted` on `search_id`, take median of latency.
- **Overall push conversion rate (last 30 days)**
  Conversions = searches whose triggering push tap led to a real match.
  `SUM(case when event_type='push_sent') AS pushes_sent` vs. `SUM(case when event_type IN ('queue_paired','invite_accepted') AND JSON_EXTRACT(metadata,'$.recency_bucket') IS NOT NULL) AS pushes_converted`
- **Per-bucket push conversion rate** (the most important dashboard for tuning the dormant tier):
  ```sql
  SELECT
    JSON_EXTRACT(metadata,'$.recency_bucket') AS bucket,
    SUM(event_type='push_sent') AS sent,
    SUM(event_type IN ('queue_paired','invite_accepted','bot_fallback')
        AND JSON_EXTRACT(metadata,'$.was_push_conversion') = true) AS converted_to_match,
    SUM(event_type IN ('queue_paired','invite_accepted')
        AND JSON_EXTRACT(metadata,'$.was_push_conversion') = true) AS converted_to_real_match
  FROM mlb_matchsearchevent
  WHERE created_at > NOW() - INTERVAL 14 DAY
    AND JSON_EXTRACT(metadata,'$.recency_bucket') IS NOT NULL
  GROUP BY bucket
  ORDER BY bucket
  ```
  This counts both conversions to any match (real or bot) and to real matches only. Decision rule: if tier 2's `converted_to_real_match / sent` < 2% after 2 weeks of data, drop tier 2's daily cap to 0 (effectively disabling) until you have a better re-engagement message.
- **Per-user decline rate**
  Already in Redis (`user_invite_stats`); also reconstructable from the events table if Redis is wiped.

Long-term trend dashboards point at `MatchSearchDailyStats`, which has stable columns and survives the 90-day raw purge. Add `pushes_sent_tier_0/1/2` and `pushes_converted_tier_0/1/2` columns to `MatchSearchDailyStats` so per-bucket history outlives the raw retention window.

---

## 9. Open questions / things to confirm

1. **Push deep-link scheme:** what's the current scheme prefix? Used `npc://...` as a placeholder above.
2. **Push provider quiet-hours behavior:** does the existing push infra already enforce quiet hours, or do we need to gate at send time?
3. **Friend prioritization signal:** lifted from existing `get_opponents` — ok, or do we want to revisit ranking?

Resolved during design:

- **App version:** ships in `>= 4.0.0` only; older clients don't expose the entry point, so no runtime gate is needed. See section 7.5.
- **Bot honesty:** silent — bots present as users. Revisit if telemetry shows users notice.
- **Mutual-search topic granularity:** at `tree_node_id` (topic), not goal.

---

## 10. Out of scope (deferred)

These were discussed and explicitly deferred:

- Skill / level bucketing (not enough users for it to matter yet)
- Topic-relevance filter on invitee (same reason)
- Bot honesty UX changes
- Cold-storage archival for raw events (90-day local retention is enough)
- Partitioned tables (only needed at >50M rows)

When user volume grows, the first three are the most likely to come back.
