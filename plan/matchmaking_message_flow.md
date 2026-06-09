# Matchmaking — FE ↔ Backend Message Flow

Every WebSocket message that crosses the wire during a `look_for_opponent` search, in temporal order, with full JSON payloads.

This doc is for implementers (FE and BE) who need to know *exactly* what to send and what to expect at each step. Pairs with `docs/matchmaking_system_explained.md` (concepts) and `docs/matchmaking_redesign.md` (design).

> **Scope**: app version >= 4.4.0 only. The legacy `random_invite` / `assign_opponent` flow used by < 4.4.0 clients is not documented here — see the existing code in `mlb/match_mode_consumer.py`.

---

## Table of contents

1. [Connection setup](#1-connection-setup)
2. [Action catalog (FE → Backend)](#2-action-catalog-fe--backend)
3. [Message catalog (Backend → FE)](#3-message-catalog-backend--fe)
4. [Push notification payload (FCM `data`)](#4-push-notification-payload-fcm-data)
5. [Serialized payload shapes](#5-serialized-payload-shapes)
6. [Scenarios with full timelines](#6-scenarios-with-full-timelines)

---

## 1. Connection setup

The user has TWO concurrent WS connections to the backend:

### 1.1 AppConsumer (long-lived, opens on app launch)

```
URL:    ws://<host>/ws/app/?token=<JWT>&Backend=<SSC|...>
Lifetime: app foreground (persistent across screens)
Purpose: receive invites, friend events, screen tracking, out-of-app match invites
```

On successful connect, the backend has marked the user `online=True` and added them to the group `user_{user_data_id}`. **No payload is sent on connect.**

### 1.2 MatchModeConsumer (per-quiz, opens when entering match flow)

```
URL:    ws://<host>/ws/match-mode/{quiz_id}/?token=<JWT>&Backend=<SSC|...>
Lifetime: while the user is on the matchmaking screen / lobby for this quiz
Purpose: drive the search, receive search_state and match_found, lobby coordination
```

On successful connect, backend immediately pushes (and the FE should expect):

```json
{
  "type": "match_mode_opponents",
  "recent_opponents": [<serialized CredentialData>, ...],
  "recommended_opponents": [<serialized CredentialData>, ...]
}
```

These power the legacy "Live Matches" list. The new "Find Match" UI doesn't render them but they still arrive — the FE can ignore them or use them for an "or pick a specific person" sub-UI.

---

## 2. Action catalog (FE → Backend)

These are the only outbound action types the FE sends in the new flow.

### 2.1 `look_for_opponent` (MatchModeConsumer)

Trigger: user taps the "Find Match" button.

```json
{ "action": "look_for_opponent" }
```

No body fields. Backend infers `quiz_id` from the WS URL.

### 2.2 `stop_looking_for_opponent` (MatchModeConsumer)

Trigger: user taps Cancel; screen unmounts mid-search; app backgrounds.

```json
{ "action": "stop_looking_for_opponent" }
```

No body fields.

### 2.3 `screen_change` (AppConsumer)

Trigger: user navigates between top-level screens. Send *after* the screen mounts, not on navigation intent.

```json
{ "action": "screen_change", "screen": "matchmaking" }
```

| `screen` value | Send when |
|---|---|
| `home` | Home / dashboard mounted |
| `syllabus` | Syllabus / topics browser mounted |
| `solo_practice` | Solo practice quiz mounted |
| `solo_report` | Solo practice result screen mounted |
| `matchmaking` | Find Match screen mounted |
| `live_matches` | Live matches list mounted |
| `inside_match` | Live match in progress (user is playing) |
| `live_match_result` | Live match result screen mounted |
| `growth` | Growth / progress screen mounted |
| `mock_test` | Mock test list / pre-test screen mounted |
| `inside_mock_test` | Mock test in progress (user is taking it) |
| `profile` | Profile / settings mounted |
| `payment` | Mid-payment flow (in-app purchase, checkout, etc.) |

`inside_match` / `inside_mock_test` / `payment` are **DND** screens — backend will not invite users on these screens. Send the *next* `screen_change` immediately on exit so the user becomes invitable again.

### 2.4 `invite_response` (AppConsumer — invitee side)

Trigger: invitee taps Accept or Decline on an `invite_received` modal.

```json
{
  "action": "invite_response",
  "user_data_id": 12345,
  "quiz_id": 67890,
  "response": "accept_invite"
}
```

| Field | Type | Source |
|---|---|---|
| `user_data_id` | int | The **inviter's** user_data id (echoed from `invite_received.user_data_id`) |
| `quiz_id` | int | The **inviter's** quiz_id (echoed from `invite_received.quiz_id`) |
| `response` | string | `"accept_invite"` or `"decline_invite"` |

### 2.5 `ready_up` / `unready` / `leave_lobby` (AppConsumer or MatchModeConsumer)

Once paired and in the lobby:

```json
{ "action": "ready_up" }
{ "action": "unready" }
{ "action": "leave_lobby" }
```

No body fields. Existing protocol — unchanged from legacy.

### 2.6 `start_match` (MatchModeConsumer)

Once both users are ready:

```json
{ "action": "start_match", "opponent_id": 12345 }
```

| Field | Type | Description |
|---|---|---|
| `opponent_id` | int | The other user's `user_data_id` |

Existing protocol — unchanged from legacy.

---

## 3. Message catalog (Backend → FE)

### 3.1 `match_mode_opponents` (MatchModeConsumer, on connect)

Sent once immediately after WS connect. Used by the legacy live-matches sub-UI; new "Find Match" can ignore.

```json
{
  "type": "match_mode_opponents",
  "recent_opponents": [<serialized CredentialData>, ...],
  "recommended_opponents": [<serialized CredentialData>, ...]
}
```

### 3.2 `search_state: QUEUED` (MatchModeConsumer)

Sent immediately after `look_for_opponent` is processed — confirms the search has started.

```json
{
  "type": "search_state",
  "state": "QUEUED",
  "search_id": "5f3b1c4e-9c5e-4a8a-9d8a-7e6c5d4b3a21",
  "budget_ms": 15000
}
```

| Field | Type | Description |
|---|---|---|
| `state` | string | Always `"QUEUED"` for this message |
| `search_id` | string (UUID v4) | Unique id for this search; the FE can ignore but it's useful for log correlation |
| `budget_ms` | int | Total search budget in milliseconds (default 15 000); FE renders a countdown ring of this duration |

### 3.3 `search_state: INVITING` (MatchModeConsumer)

Sent each time the WS-invite loop starts ringing a candidate. Drives the "Asking {name}…" UI per §7.1 of the design doc.

```json
{
  "type": "search_state",
  "state": "INVITING",
  "candidate_full_name": "Ankit Sharma"
}
```

| Field | Type | Description |
|---|---|---|
| `state` | string | Always `"INVITING"` for this message |
| `candidate_full_name` | string \| null | The candidate's name (no PII like ID); fall back to a generic "Asking someone…" if null |

### 3.4 `search_state: CANCELLED` (MatchModeConsumer)

Sent in response to user-initiated `stop_looking_for_opponent`.

```json
{ "type": "search_state", "state": "CANCELLED" }
```

> Not sent on socket disconnect — there's no live socket to send to in that case.

### 3.5 `match_found` (MatchModeConsumer)

The terminal "search succeeded" message. Both real-user pairs and bot fallbacks send this.

```json
{
  "type": "match_found",
  "opponent": <serialized CredentialData>,
  "is_bot": false,
  "quiz_id": 67890
}
```

| Field | Type | Description |
|---|---|---|
| `opponent` | object | Full serialized opponent — name, avatar, user_data, etc. (see §5 for shape) |
| `is_bot` | bool | `true` if the 15-second budget elapsed and a bot was assigned; `false` for any real pair (queue or WS) |
| `quiz_id` | int | The quiz_id the FE should treat as canonical for the lobby/match. **Always equals `self.quiz_id`** — i.e., the quiz the FE's WS is connected on |

> The FE never sees `match_found_dispatch` — that's an internal channel-layer message between consumers; the recipient consumer reformats it as `match_found` before sending to its client.

### 3.6 `lobby_event` (MatchModeConsumer / AppConsumer)

Existing protocol — unchanged from legacy. Sent on ready_up, unready, leave_lobby actions from either side, and synthetically from `_finalize_match_with_bot` to mark the bot as ready.

```json
{
  "type": "lobby_event",
  "event": "ready_up",
  "opponent": <serialized CredentialData> | null,
  "user": <serialized CredentialData> | null
}
```

| `event` value | Meaning |
|---|---|
| `ready_up` | The named user readied |
| `unready` | The named user un-readied |
| `leave_lobby` | The named user left |

### 3.7 `start_match` (MatchModeConsumer)

Sent after both users readied and one side fired the `start_match` action.

```json
{
  "type": "start_match",
  "quiz_id": 67890,
  "friendship_status": "<status>",
  "topic": <serialized topic>
}
```

Existing protocol.

### 3.8 `opponent_joined` (MatchModeConsumer)

Sent to the inviter when the invitee joins the quiz lobby.

```json
{
  "type": "opponent_joined",
  "opponent": <serialized CredentialData>
}
```

Existing protocol.

### 3.9 `invite_received` (AppConsumer — sent to candidate)

The invitee's modal-trigger. Delivered when a searcher's WS-invite loop picks them.

```json
{
  "type": "invite_received",
  "user_data_id": 12345,
  "profile_picture": "https://cdn.example.com/avatars/12345.jpg",
  "full_name": "Ankit Sharma",
  "quiz_id": 67890,
  "topic": <serialized topic>,
  "opponent": <serialized CredentialData (the invitee themselves)>
}
```

| Field | Type | Description |
|---|---|---|
| `user_data_id` | int | The **inviter's** user_data id |
| `profile_picture` | string (URL) | Inviter's avatar |
| `full_name` | string | Inviter's name |
| `quiz_id` | int | The **inviter's** quiz_id (the invitee echoes this back in `invite_response`) |
| `topic` | object | Serialized topic detail (`AllTopicDetailV3Serializer`) |
| `opponent` | object | The **invitee's** own serialized profile — sent so the FE doesn't refetch it for the lobby UI |

> **Note (current limitation)**: the design doc §4.5 calls for `search_id` and `expires_at_ms` on this payload so the FE can render a server-clock countdown. The MatchModeConsumer side passes them in (see `mlb/match_mode_consumer.py`), but `AppConsumer.receive_invite` (`users/app_consumer.py`) drops them when forwarding to the client. If the FE needs the countdown ring, the AppConsumer handler needs a one-line fix to pass these through. Flagging — not blocking.

### 3.10 `invite_expired` (AppConsumer)

Sent to the invitee when the inviter's invite times out (5s ring elapsed) or the inviter cancels mid-ring. FE should silently dismiss the modal.

```json
{
  "type": "invite_expired",
  "user_data_id": 12345,
  "profile_picture": "https://cdn.example.com/avatars/12345.jpg",
  "full_name": "Ankit Sharma",
  "quiz_id": 67890
}
```

### 3.11 `friendship_status` (AppConsumer / MatchModeConsumer)

Existing protocol. Sent after pair (so the FE knows whether to show "Add friend" buttons in the lobby).

```json
{ "type": "friendship_status", "status": "<status>" }
```

### 3.12 Other AppConsumer messages

These exist but are unrelated to the matchmaking flow — listed for completeness.

```
live_matches            (legacy live-match broadcast pool)
friend_request          (someone sent you a friend request)
friend_request_response (someone responded to yours)
friend_request_error    (your request failed)
friend_removed          (you unfriended someone)
message                 (in-app DM)
match_invalid / match_unavailable / match_started / match_full
                        (out-of-app invite link errors)
rejoin_match / review_match
                        (resume / review previous match)
```

Existing protocol — see `users/app_consumer.py` for the exact shapes.

---

## 4. Push notification payload (FCM `data`)

Pushes are sent **outside** the WS by the push lane (`_send_push_invites`). They arrive via FCM as a `data` payload (NOT a notification payload — the FE renders the OS notification itself from these fields):

```json
{
  "title": "Quick match available",
  "body": "A Polity match is starting — tap to play",
  "type": "match_request_v2",
  "deep_link": "npc://matchmaking/topic/4321",
  "tree_node_id": 4321,
  "topic_name": "Polity",
  "recency_bucket": 0
}
```

| Field | Type | Description |
|---|---|---|
| `title` | string | OS notification title; tier-specific copy from `PUSH_COPY_TEMPLATES` |
| `body` | string | OS notification body; `{topic_name}` placeholder filled in |
| `type` | string | Always `"match_request_v2"` — FE listener routes on this |
| `deep_link` | string | `npc://matchmaking/topic/{tree_node_id}` (scheme is a placeholder pending production decision) |
| `tree_node_id` | int | Topic id — FE should read **this field directly**, not parse the deep_link |
| `topic_name` | string | Topic display name |
| `recency_bucket` | int | 0 / 1 / 2 — for analytics only, FE doesn't act on it |

| `recency_bucket` | Last active | Title (default) | Body (default) |
|---|---|---|---|
| 0 | < 1 day | "Quick match available" | "A {topic_name} match is starting — tap to play" |
| 1 | 1–3 days | "Want a quick match?" | "Up for a quick {topic_name} match? It only takes 5 minutes" |
| 2 | 4–10 days | "We miss you" | "Come back for a quick {topic_name} match" |

**FE responsibilities on tap (already detailed in `matchmaking_system_explained.md` Diagram 7):**
1. Read `tree_node_id` from `notification.data` (not URL parse)
2. Navigate to topic page with `?autoFindMatch=1`
3. Lazy-create UserQuiz via `GET /api/mlb/v3/topical-quiz/create/?topic-id={tree_node_id}`
4. Open `ws/match-mode/{quizId}/`
5. Send `{action: "look_for_opponent"}` — the same wire as an organic search

---

## 5. Serialized payload shapes

### 5.1 `<serialized CredentialData>`

Output of `users.apiV3.serializers.CredentialDataV3Serializer`. Approximate shape (full field list at `users/apiV3/serializers.py:259`):

```json
{
  "id": 12345,
  "user_goal": { "id": 99, "goal": { ... }, "is_active": true, ... },
  "archived_goals": [...],
  "user_data": {
    "id": 67890,
    "full_name": "Ankit Sharma",
    "username": "ankit",
    "profile_picture": "https://cdn.example.com/avatars/12345.jpg",
    "avatar_url": "...",
    "user_type": "USER",
    ...
  },
  "email": "ankit@example.com",
  "user_settings": {...},
  "phone": "+91...",
  "topics_completed": 12,
  "notification_settings": {...},
  "quiz_data": {...},
  "total_coins": 350,
  "quizzes_completed": 47,
  "longest_streak": 5,
  "is_registered": true,
  "registered_at": "...",
  "avatars_list": [...],
  "days_joined": 88,
  "online": true,
  "last_login": "..."
}
```

The most-needed fields for matchmaking UI: `user_data.full_name`, `user_data.profile_picture` / `user_data.avatar_url`, `online`, `last_login`.

### 5.2 `<serialized topic>`

Output of `syllabus.apiV3.serializers.AllTopicDetailV3Serializer`. Topic detail with section/unit context. The new flow does not require any field beyond what the existing matchmaking lobby UI already consumes — same shape as today's `invite_received.topic`.

---

## 6. Scenarios with full timelines

Each scenario shows the full message sequence between FE and Backend (and across two FEs where relevant). Time flows top-to-bottom.

Notation:
- `Searcher FE` / `Searcher BE` — the consumer for the user who tapped Find Match
- `Other FE` / `Other BE` — the consumer for the paired user (where applicable)
- `Backend` for context-sharing diagrams

### Scenario A — Solo search → bot fallback

User taps Find Match. No other user is searching the same topic. No online candidate accepts within the budget. Bot is assigned at 15s.

```
Searcher FE                                          Searcher BE
───────────                                          ───────────

(WS already connected to ws/match-mode/{quiz_id}/)
                       ◄──── { "type": "match_mode_opponents",
                                "recent_opponents": [...],
                                "recommended_opponents": [...] }
{ "action": "look_for_opponent" } ────►
                       ◄──── { "type": "search_state",
                                "state": "QUEUED",
                                "search_id": "5f3b1c4e-9c5e-...",
                                "budget_ms": 15000 }

   ─── Backend's _run_search_task starts looping ───
   ─── (no peer in queue; picks online candidate Alice) ───

                       ◄──── { "type": "search_state",
                                "state": "INVITING",
                                "candidate_full_name": "Alice" }

   ─── (Alice declines; loop continues, picks Bob) ───

                       ◄──── { "type": "search_state",
                                "state": "INVITING",
                                "candidate_full_name": "Bob" }

   ─── (Bob doesn't respond; 5s timeout; loop continues) ───
   ─── (15s budget elapses) ───

                       ◄──── { "type": "match_found",
                                "opponent": <serialized bot>,
                                "is_bot": true,
                                "quiz_id": 67890 }
                       ◄──── { "type": "lobby_event",
                                "event": "ready_up",
                                "opponent": <serialized bot> }
```

> The FE should treat `match_found` as the canonical "search ended successfully" signal regardless of `is_bot`. The auto-fired `lobby_event: ready_up` signals the bot is already ready — so the user only needs to ready themselves to start.

### Scenario B — Mutual queue pair (two users, same topic, simultaneous)

User A and User B both tap Find Match for topic Polity within the same second. The mutual short-circuit pairs them instantly.

```
A FE                A BE                     B BE                B FE
────                ────                     ────                ────

(both WS already connected to /ws/match-mode/{their_quiz_id}/)
                ◄── match_mode_opponents     match_mode_opponents ──►

{action:                                                           {action:
 look_for_opponent}                                                 look_for_opponent}
   ───►                                                                  ◄───
                A._look_for_opponent runs    B._look_for_opponent runs
                queue empty for A's topic    queue has [A] (A enqueued
                A enqueues                   first by 5ms)
                                              B's _claim_queue_peer →
                                              ZREM A from queue → succeeds
                                              B's _finalize_match_with_peer:
                                                acquires pair_lock:{A,B}
                                                creates UserQuizMatch
                ◄── match_found_dispatch     ──► self.send match_found
                    (channel-layer to
                     match_mode_{A})
                ◄── join_pair_group
                A.match_found_dispatch runs:
                  cancels A's search task,
                  cleans up
{type: search_state,                                          {type: match_found,
 state: QUEUED}                                                opponent: <A>,
   ◄── (sent moments before pair)                              is_bot: false,
                                                               quiz_id: <B's quiz_id>}
                                                                    ───►
{type: match_found,
 opponent: <B>,
 is_bot: false,
 quiz_id: <A's quiz_id>}
   ◄───
```

**Key point**: A's `quiz_id` in the `match_found` payload to A is A's **own** quiz_id (not B's). Each side gets their own quiz_id — they don't have to switch sockets. The shared `pair_match_{lo}_{hi}` group bridges lobby events.

### Scenario C — WS-invite accept (paired with a specific online user)

User A taps Find Match. No queue peer available. A's loop picks online user B (who is on home screen, not searching). A's invite rings B; B accepts.

```
A FE                A BE                B AppConsumer            B FE
────                ────                ─────────────            ────

{action:                                                         (B is on home
 look_for_opponent}                                               screen; B's
   ───►                                                          AppConsumer is
                A._look_for_opponent                              connected via
                spawns _run_search_task                           /ws/app/)
                spawns _send_push_invites
{type: search_state,
 state: QUEUED, search_id: ...,
 budget_ms: 15000}
   ◄───
                Loop iteration:
                _claim_queue_peer → None
                _pick_next_candidate → B
                _send_invite_and_wait(B):
                  SET NX invite_lock:{B}
                  INCR invite_count_min/hr:{B}
                  HINCRBY user_invite_stats:{B}.sent
                  group_send → user_{B}:
                                            ◄── { "type": "invite_received",
                                                  "user_data_id": <A>,
                                                  "profile_picture": "...",
                                                  "full_name": "Ankit",
                                                  "quiz_id": <A's quiz_id>,
                                                  "topic": <topic>,
                                                  "opponent": <B serialized> }
{type: search_state,                        AppConsumer.receive_invite reformats
 state: INVITING,                           and sends to B's FE:
 candidate_full_name: "B"}                  ──────────────────────────────────►
   ◄───                                                              (modal
                                                                      shown,
                                                                      5s ring)
                Awaits future, 5s timeout
                                                                  User taps
                                                                  Accept
                                                                  ◄────
                                            { "action": "invite_response",
                                              "user_data_id": <A>,
                                              "quiz_id": <A's quiz_id>,
                                              "response": "accept_invite" }
                                            ───►
                                            AppConsumer.invite_response:
                                              update_user_quiz_match
                                              group_add quiz_{A's quiz_id}
                                              group_send →
                                                match_mode_{A}:
                                                  invite_response handler
                MM.invite_response handler:
                  resolves _pending_invite future
                  with "accept_invite", returns
                  (skips legacy lobby code)
                _send_invite_and_wait returns "accept_invite"
                Loop: _wait_for_quiz_socket(B, 5s)
                  polls quiz_socket_joined:{A's quiz_id}:{B}

                                            (B's FE navigates to lobby,
                                             opens /ws/match-mode/{A's quiz_id}/)
                                            B's MM.connect detects state
                                            already exists with a different
                                            user_id, writes the marker.
                _wait_for_quiz_socket → True
                _finalize_match_with_peer(B, lane="ws"):
                  acquires pair_lock
                  creates UserQuizMatch
                  group_send match_mode_{B}: match_found_dispatch
                  group_send match_mode_{B}: join_pair_group
{type: match_found,
 opponent: <B>,
 is_bot: false,
 quiz_id: <A's quiz_id>}                                          {type: match_found,
   ◄───                                                            opponent: <A>,
                                                                   is_bot: false,
                                                                   quiz_id: <A's quiz_id>}
                                                                  ───►
```

**Note**: In the WS-invite-accept case, both ends of the pair end up using A's quiz_id as the canonical lobby. B's MatchModeConsumer connects to `/ws/match-mode/{A's quiz_id}/`, not B's own.

### Scenario D — WS-invite decline → continue → bot

A's loop rings Alice → decline → rings Bob → timeout → 15s budget exhausts → bot.

Showing only the messages to A's FE; the rest (B-side modal handling) is symmetrical to Scenario C.

```
A FE                                              A BE
────                                              ────

{action: look_for_opponent}  ───►
                       ◄──── { "type": "search_state",
                                "state": "QUEUED",
                                "search_id": "...",
                                "budget_ms": 15000 }

   ─── ring Alice ───
                       ◄──── { "type": "search_state",
                                "state": "INVITING",
                                "candidate_full_name": "Alice" }
   ─── (Alice declines; pair_cooldown 300s set on A↔Alice;
        user_invite_stats:{Alice}.declined +=1) ───

   ─── ring Bob ───
                       ◄──── { "type": "search_state",
                                "state": "INVITING",
                                "candidate_full_name": "Bob" }
   ─── (5s timeout; pair_cooldown set; group_send invite_expired
        to Bob's AppConsumer) ───

   ─── ring Carol ───
                       ◄──── { "type": "search_state",
                                "state": "INVITING",
                                "candidate_full_name": "Carol" }
   ─── (Carol declines) ───

   ─── deadline at 15s ───
                       ◄──── { "type": "match_found",
                                "opponent": <bot>,
                                "is_bot": true,
                                "quiz_id": 67890 }
                       ◄──── { "type": "lobby_event",
                                "event": "ready_up",
                                "opponent": <bot> }
```

The FE's UI just rotates the "Asking …" text on each `INVITING` event; from the user's POV they see "Looking for opponent…" (with possibly the candidate name flashing) for 15s, then the opponent appears.

### Scenario E — User cancels mid-search

```
FE                                                   BE
──                                                   ──

{action: look_for_opponent}  ───►
                       ◄──── { "type": "search_state",
                                "state": "QUEUED",
                                "search_id": "...",
                                "budget_ms": 15000 }

   ─── (loop running, ringing candidates) ───

                       ◄──── { "type": "search_state",
                                "state": "INVITING",
                                "candidate_full_name": "Bob" }

User taps Cancel
{action: stop_looking_for_opponent}  ───►
                              _stop_looking_for_opponent →
                              _cleanup_search_state:
                                cancel _search_task
                                ZREM match_queue
                                DEL match_search:{user_id}
                                resolve _pending_invite future
                                DEL invite_lock:{Bob}  (if held)
                                INSERT search_cancelled event

                       ◄──── { "type": "search_state",
                                "state": "CANCELLED" }
```

After CANCELLED, the FE returns to idle; the user can tap Find Match again whenever they want. **No cooldowns are applied to the searcher** for cancelling — only `pair_cooldown:{searcher}:{candidate}` rows that were already set during decline / timeout events earlier in the search remain.

### Scenario F — Push receive → tap → auto-search

User C is offline (last_login 2 hours ago). User A starts a search; the push lane fires a tier-0 push to C. C taps the notification.

```
   A's BE push lane                 C's device                     C's BE
   ────────────────                 ──────────                     ──────

   FCM dispatch with data:
   { "title": "Quick match available",
     "body": "A Polity match is starting — tap to play",
     "type": "match_request_v2",
     "deep_link": "npc://matchmaking/topic/4321",
     "tree_node_id": 4321,
     "topic_name": "Polity",
     "recency_bucket": 0 }
                        ─────►  OS shows notification.
                                 push_attribution:{C}=0 set in Redis
                                 (TTL 600s).
                                 push_count_day:{C}+=1.
                                 pair_cooldown:{A}:{C} set 30 min.
                                 INSERT push_sent event.

                                 (User taps notification 30s later)

                                 FE's notificationActionPerformed
                                 listener fires:
                                   reads data.tree_node_id (4321)
                                   navigates to topic page
                                   with ?autoFindMatch=1

                                 TopicBottomSheet mounts:
                                   topicData.quizId is null
                                   ─►  GET /api/mlb/v3/topical-quiz/create/
                                          ?topic-id=4321
                                                                   ───────►
                                                                   View runs
                                                                   create_topical_quiz
                                                                   → reuses existing
                                                                     WAITING quiz
                                                                     OR creates a new
                                                                     UserQuiz row
                                                                   ◄───────
                                   ◄── { "quiz_id": 99999,
                                         "topic_id": 4321, ... }
                                   redux dispatch setQuizIdForTopic
                                   bottom sheet re-renders with quizId=99999

                                 autoFindMatch effect fires:
                                   handleFindAnOpponent()
                                     ─► opens /ws/match-mode/99999/
                                     ─► sends { "action": "look_for_opponent" }

                                                                   _look_for_opponent:
                                                                   GET push_attribution:{C}
                                                                   → 0 (tier 0)
                                                                   search_state stamped:
                                                                     was_push_conversion=True
                                                                     recency_bucket=0
                                                                   QUEUED → looks for peer

                                   ◄── { "type": "search_state",
                                         "state": "QUEUED", ... }

                                 (User A may or may not still be searching;
                                  if A is, queue pairing succeeds; if not,
                                  C's own search task starts and may
                                  pair with someone else)
```

**Push conversion attribution** is server-side only — the FE sends the same `look_for_opponent` whether organic or push-driven. The eventual terminal event for C's search will carry `metadata.was_push_conversion=true` and `metadata.recency_bucket=0`.

### Scenario G — Lobby ready-up → start match

After `match_found` (any path), both users are in the shared lobby (legacy protocol — unchanged). Showing for completeness:

```
A FE              A BE                            B BE                  B FE
────              ────                            ────                  ────

(both ends paired; both consumers in pair_match_{lo}_{hi})

{action: ready_up} ───►
                  group_send pair_match_{lo}_{hi}:
                  lobby_event(ready_up, opponent=<A>)
                  ◄── lobby_event                lobby_event ──►
                                                                       {type: lobby_event,
                                                                        event: "ready_up",
                                                                        opponent: <A>}
                                                                       ───►
                                                                  {action: ready_up}
                                                                       ◄───
                                                  group_send: lobby_event(ready_up, opponent=<B>)
                  ◄── lobby_event                lobby_event ──►
{type: lobby_event,
 event: "ready_up",
 opponent: <B>}
   ◄───

(both users now ready; either side fires start_match)

{action: start_match,
 opponent_id: <B's user_data_id>}
   ───►
                  group_send pair_match: start_match
                  ◄── start_match                 start_match ──►
{type: start_match,                                                    {type: start_match,
 quiz_id: <quiz_id>,                                                    quiz_id: <quiz_id>,
 friendship_status: ...,                                                friendship_status: ...,
 topic: <topic>}                                                        topic: <topic>}
   ◄───                                                                ───►

(both FEs transition to the in-quiz screen; existing legacy protocol takes over)
```

### Scenario H — Disconnect mid-search

User starts a search, then closes the app / loses network without sending Cancel.

```
FE                                          BE
──                                          ──

{action: look_for_opponent}  ───►
                       ◄──── { "type": "search_state",
                                "state": "QUEUED", ... }

   ─── (search loop running) ───

WS connection drops (TCP close / heartbeat timeout)
                                          MatchModeConsumer.disconnect:
                                            _cancel_assign_task (legacy)
                                            _cleanup_search_state(
                                              emit_cancelled_event=True,
                                              send_to_client=False
                                            ):
                                              cancel _search_task
                                              ZREM match_queue
                                              DEL match_search:{uid}
                                              resolve _pending_invite future
                                              DEL invite_lock if held
                                              INSERT search_cancelled event
                                              (NOT sending to client — socket gone)
                                            stop_random_lookup (legacy)
                                            user_socket_active=false on match state

                                          AppConsumer.disconnect (separately):
                                            mark user offline, update last_login
                                            DEL user_screen:{uid}

                                          (Note: `disconnect` runs only once per
                                           consumer — i.e., the MatchModeConsumer's
                                           cleanup is independent of the AppConsumer's)
```

**No `search_state: CANCELLED` is sent on disconnect** — there's no live socket to send to. Telemetry still records `search_cancelled` though, so dashboards see the abandoned search.

If the user reconnects shortly after (within 120s, the `match_search:{uid}` TTL), the stale state will already be cleaned up by `disconnect`, so they can call `look_for_opponent` fresh without conflict.

---

## Edge cases / FAQ

**Q: What if `look_for_opponent` is sent twice in a row before the first finishes?**
A: The second is ignored. `_look_for_opponent` checks `if self._search_task and not self._search_task.done(): return` and `if await redis_get(f"match_search:{uid}"): return`.

**Q: What if I send `stop_looking_for_opponent` when there's no active search?**
A: It's a no-op. `_cleanup_search_state` operates on whatever state is set; if nothing is set, nothing happens. The `search_state: CANCELLED` is still sent to the client (FE can ignore if not in searching state).

**Q: Does `screen_change` require a response?**
A: No. Fire-and-forget. Backend writes `user_screen:{uid}` and that's it.

**Q: Is the WS-invite ring countdown driven by the server or client?**
A: Should be server (`expires_at_ms` on `invite_received`) per the design — but the AppConsumer handler currently strips that field before forwarding to the client (see §3.9 note). Client-side 5-second timer works as a fallback today.

**Q: Can a user be both invitee and searcher simultaneously?**
A: Yes — they could open MatchModeConsumer for one quiz and have AppConsumer open. If they're searching on quiz A and someone else's loop picks them as a candidate for quiz B, they'd receive an `invite_received` for B while their own search runs on A. The new flow doesn't explicitly block this — but their `MATCHMAKING_PRIORITY_SCREENS` would put them at front of others' candidate pools.

**Q: Why does `match_found` always carry the FE's own `quiz_id`?**
A: Because each FE is connected to `/ws/match-mode/{their_quiz_id}/` and shouldn't have to reconnect to a different URL on pair. The shared `pair_match_{lo}_{hi}` group abstracts the join. The `UserQuizMatch` row links both UserQuiz rows for downstream queries.

**Q: What's the difference between `lobby_event` from `MatchModeConsumer` vs `AppConsumer`?**
A: Same payload shape; different destination groups. AppConsumer handles `lobby_event` for invitees who haven't yet opened their match-mode socket. MatchModeConsumer handles it for both ends post-pair via the shared pair group.

---

## Pointer to other docs

- `docs/matchmaking_redesign.md` — the full design spec with rationale
- `docs/matchmaking_system_explained.md` — concepts + 9 diagrams + method reference
- This doc — wire-level message flow (you are here)
