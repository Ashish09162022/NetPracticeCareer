# Matchmaking Redesign — Frontend Implementation Plan (v4.4.0)

## Overview

Replace the current multi-click matchmaking flow with a single **Find Match** button. The server handles candidate selection, invitations, push fallback, and bot assignment automatically based on a configurable time budget.

---

## Task 1 — Add new message types

**File:** `src/hooks/webSockets/topicMatchModeSocket/messages.ts`

Add incoming message types:

- `search_state` with `state: "QUEUED" | "INVITING" | "CANCELLED"` and optional `candidate_full_name: string`
- `match_found` with `opponent`, `is_bot: boolean`, `quiz_id: number`

---

## Task 2 — Add new action helpers

**File:** `src/hooks/webSockets/topicMatchModeSocket/actions.ts`

- Add `getLookForOpponentActionData` returning `{ action: "look_for_opponent" }`.
- Add `getStopLookingForOpponentActionData` returning `{ action: "stop_looking_for_opponent" }`.
- Delete `getAssignOpponentActionData` and its type.

---

## Task 3 — Rewrite `TopicBottomSheet.tsx` matchmaking UI

**File:** `src/components/topicBottomSheet/TopicBottomSheet.tsx`

### 3a. Remove `assign_opponent` logic
- Delete the `useEffect` that calls `handleAssignOpponent` after a 1s delay (lines ~445–457).
- Delete `handleAssignOpponent` function (lines ~388–394).
- Remove `getAssignOpponentActionData` import.

### 3b. Update `handleFindAnOpponent`
```ts
sendJsonMessage(getLookForOpponentActionData());
```

### 3c. Handle `search_state` messages
In the `lastJsonMessage` processing `useEffect`:

| `state` | UI update |
|---|---|
| `QUEUED` | "Looking for opponent…" |
| `INVITING` | "Asking {candidate_full_name}…" |
| `CANCELLED` | Return to idle |

### 3d. Handle `match_found`
`match_found` is the canonical "search ended successfully" signal. On receipt, transition to lobby/quiz UI. Existing `lobby_event` and `start_match` handlers are unchanged.

### 3e. Cancel button and unmount cleanup
- Cancel button sends `getStopLookingForOpponentActionData()`.
- On unmount, send `stop_looking_for_opponent` if a search is in progress.

---

## Task 4 — Update `FindingAnOpponent.tsx`

**File:** `src/components/topicBottomSheet/.../findingAnOpponent/FindingAnOpponent.tsx`

Line ~57 sends the match search action — update to use `getLookForOpponentActionData()`.

---

## Task 5 — Screen tracking via AppConsumer

### 5a. Add `getScreenChangeActionData`

**File:** `src/hooks/webSockets/appSocket/actions.ts`

```ts
export const getScreenChangeActionData = (screen: string) => ({
  action: "screen_change",
  screen,
});
```

### 5b. Wire `screen_change` to navigation events

Send on mount in each screen. Fire-and-forget — no response handling.

| `screen` value | Component to update | Notes |
|---|---|---|
| `home` | Home page | |
| `syllabus` | Syllabus/topics browser | |
| `solo_practice` | Solo practice quiz | |
| `solo_report` | Solo practice result | |
| `matchmaking` | `TopicBottomSheet.tsx` on find-opponent enter | |
| `live_matches` | Live matches list | |
| `inside_match` | Live match in-progress | **DND — send immediately on enter and exit** |
| `live_match_result` | Live match result | |
| `growth` | Growth/progress screen | |
| `mock_test` | Mock test list | |
| `inside_mock_test` | Mock test in-progress | **DND — send immediately on enter and exit** |
| `profile` | Profile/settings | |
| `payment` | Payment/checkout flow | **DND — send immediately on enter and exit** |

For DND screens (`inside_match`, `inside_mock_test`, `payment`): send immediately on enter AND send the next screen on exit so the user becomes invitable again without waiting for Redis TTL.

---

## Task 6 — Push notification listener

**File:** `src/wrapperComponents/PushNotificationsManager.tsx`

The listener already exists in `PushNotificationsManager`. The `notificationActionPerformed` handler reads `notificationData.click_action`, which the server populates with a full production URL containing `topicId` and `openTopicBottomSheet=true`:

```
https://app.netpractice.app/<path>?topicId=<id>&openTopicBottomSheet=true
```

Update the handler to strip the `PRODUCTION_WEB_APP_URL` prefix before navigating — identical to how `AppUrlListener` handles deep links — so both entry points produce the same in-app path:

```ts
import { PRODUCTION_WEB_APP_URL } from "../constants";

// inside notificationActionPerformed callback:
const clickAction = notificationData.click_action;
if (clickAction.startsWith(PRODUCTION_WEB_APP_URL)) {
  const inAppPath = clickAction.split(PRODUCTION_WEB_APP_URL)[1];
  navigate(inAppPath);
} else {
  navigate(clickAction);
}
```

- No `tree_node_id` or `type` check needed — the URL itself carries all required data (`topicId`, `openTopicBottomSheet=true`).
- Task 7 reads `topicId` and `openTopicBottomSheet` from search params to open the bottom sheet and auto-trigger find-opponent.

---

## Task 7 — Auto-find-match on push tap

**File:** `src/components/topicBottomSheet/TopicBottomSheet.tsx`

### 7a. Quiz-id bootstrap

When landing via push the user may not have a `UserQuiz` for that topic. Eagerly create one:

```tsx
const handleCreateQuiz = useCreateTopicalQuizAndUpdateTopic();

useEffect(() => {
  if (!autoFindMatch) return;
  if (topicData == null) return;
  if (topicData.quizId != null) return;
  handleCreateQuiz({ topicData }); // dispatches setQuizIdForTopic to redux
}, [autoFindMatch, topicData]);
```

### 7b. Auto-trigger find-opponent

Fires once `quizId` is available:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const autoFindMatch = searchParams.get("autoFindMatch") === "1";

useEffect(() => {
  if (!autoFindMatch) return;
  if (topicData?.quizId == null) return;
  handleFindAnOpponent();
  searchParams.delete("autoFindMatch");
  setSearchParams(searchParams, { replace: true }); // strip flag so back-nav doesn't re-trigger
}, [autoFindMatch, topicData?.quizId]);
```

### 7c. Second push tap while search is active

The existing `resetTopicMatchSlice` useEffect (lines ~437–439) resets state on `topicId` change. Verify `useTopicMatchModeSocket` closes the previous WS cleanly on `topicMatchId` change — confirm in QA.

### 7d. Unavailable topic error

If `useCreateTopicalQuizAndUpdateTopic` returns null or a 400:
- Show toast: "This topic isn't available for matches right now"
- Navigate back to home

---

## Task 8 — Invitee countdown UI

**File:** `src/wrapperComponents/AppSocketWrapper.tsx` — `handleInviteRecieved` (~line 186)

- Forward the new `expires_at_ms` field from `invite_received` to the invite modal.
- Render a countdown ring using `expires_at_ms - Date.now()` (default **5 seconds**). Use the server's wall-clock target — not a client-computed duration — so a slow network doesn't shrink the user's window.
- On countdown reaching 0: dismiss modal silently. Do **not** auto-send `decline_invite` — the server tracks no-response and explicit decline separately.
- If `invite_received` arrives while the user is on a DND screen, drop it silently.
- `invite_expired` event: dismiss the modal silently (inviter cancelled mid-ring).

---

## Execution Order

| # | Task | Depends on | Notes |
|---|---|---|---|
| 1 | Add message types | — | Pure types, safe anytime |
| 2 | Add action helpers | — | |
| 3a | Remove `assign_opponent` effect | — | Core behavior change |
| 3b | `handleFindAnOpponent` sends `look_for_opponent` | — | |
| 4 | Update `FindingAnOpponent.tsx` | — | |
| 3c–3e | Handle `search_state` + `match_found` + cancel | Backend deployed | Inert until server sends new types |
| 5 | Screen tracking | — | Fire-and-forget, no UI impact |
| 6 | Push notification listener | Push payload confirmed | |
| 7 | Auto-find-match on push tap | Task 6 | |
| 8 | Invitee countdown UI | Backend sends `expires_at_ms` | Existing modal unchanged in shape |

Tasks 1–5 can ship before the backend is ready.
