# Plan: Handle `topicId` + `lookForOpponent` URL Params → Open Topic Bottom Sheet in Match Mode

## Context

Notification/action URLs can carry `?topicId=<id>&lookForOpponent=true`. When a user taps such a URL, the app should:
1. Fetch topic data for that ID from the backend
2. Open the topic bottom sheet in the same state as if the user had tapped "Play Live"
3. Automatically trigger the `look_for_opponent` WebSocket action

Currently `AppUrlListener` only handles `topicMatchId` param. `topicId` and `lookForOpponent` are not handled at all.

---

## Files to Create

### 1. `src/store/slices/unitwiseTopicsSlice/thunks/loadTopicData/interfaces/backend.ts`
```ts
import { TopicDataResponse } from "@/interfaces/contentInterfaces";
export type LoadTopicDataFulfilledResponse = TopicDataResponse;
export interface LoadTopicDataRejectedResponse { detail: string; }
```

### 2. `src/store/slices/unitwiseTopicsSlice/thunks/loadTopicData/interfaces/frontend.ts`
```ts
import { TopicData } from "@/interfaces/contentInterfaces";
export type LoadTopicDataFulfilledResponseData = TopicData;
export interface LoadTopicDataRejectedResponseData { detail: string; }
```

### 3. `src/store/slices/unitwiseTopicsSlice/thunks/loadTopicData/loadTopicData.ts`
- `createAsyncThunk("unitwiseTopicsSlice/loadTopicData", ...)`
- Args: `{ topicId: string }`
- Fetch: `GET ${SERVER_DOMAIN}/api/syllabus/v3/topic/${topicId}/` with JWT header (same pattern as `loadUnlockedTopicsData`)
- On success: map with `getTopicDataFromResponse(response.json())`, return `{ loadTopicDataFulfilledResponseData: TopicData }`
- On error: `rejectWithValue(customError)`

---

## Files to Modify

### 4. `src/store/slices/unitwiseTopicsSlice/unitwiseTopicsSlice.ts`
- Import `loadTopicData` from the new thunk file
- Add to `extraReducers`:
  ```ts
  builder.addCase(loadTopicData.pending, (state) => {});
  builder.addCase(loadTopicData.fulfilled, (state, action) => {
    const { loadTopicDataFulfilledResponseData: topicData } = action.payload;
    if (state.topicRecord === null) state.topicRecord = {};
    state.topicRecord[topicData.topicId] = topicData;
  });
  builder.addCase(loadTopicData.rejected, (state) => {});
  ```

### 5. `src/store/slices/topicBottomSheetSlice/topicBottomSheetSlice.ts`
- Add `autoLookForOpponent: boolean` to `TopicBottomSheetSlice` interface (default `false` in `initialTopicBottomSheetSlice`)
- Extend `OpenTopicBottomSheetArgs` with `autoLookForOpponent?: boolean`
- In `openTopicBottomSheet` reducer, spread `autoLookForOpponent: autoLookForOpponent ?? false` into the returned state

### 6. `src/components/topicBottomSheet/TopicBottomSheet.tsx`
- Select `autoLookForOpponent` from `topicBottomSheetSlice`
- Add a `useEffect` that calls `handleLookForOpponent()` when `autoLookForOpponent` is `true`:
  ```ts
  useEffect(() => {
    if (autoLookForOpponent) handleLookForOpponent();
  }, [autoLookForOpponent]);
  ```

### 7. `src/wrapperComponents/AppUrlListener.tsx`
- **Remove** the `topicMatchId` block entirely (lines 34–41: `const topicMatchId`, `if (topicMatchId)` and the `sendAppSocketJsonMessage` call)
- **Remove** the `useAppSocket` hook and `sendAppSocketJsonMessage` (no longer needed)
- **Remove** the `getOutAppMatchInviteActionData` import
- Import `useAppDispatch`, `loadTopicData`, `openTopicBottomSheet`, `setTopicMode`, `setTopicBottomSheetContentState`, `setTopicBottomSheetFooterState`, `TopicBottomSheetContentState`, `TopicBottomSheetFooterState`, `TopicMode`
- Add `dispatch` via `useAppDispatch()`
- Extract params:
  ```ts
  const topicId = url.searchParams.get("topicId");
  const lookForOpponent = url.searchParams.get("lookForOpponent") === "true";
  ```
- If `topicId` is present:
  1. `await dispatch(loadTopicData({ topicId })).unwrap()` — ensure topic is in store before opening sheet
  2. `dispatch(openTopicBottomSheet({ topicId, withTopicInfo: true, autoLookForOpponent: lookForOpponent }))`
  3. `dispatch(setTopicMode({ topicMode: TopicMode.matchMode }))` — switch to live/match tab
  4. `dispatch(setTopicBottomSheetContentState({ topicBottomSheetContentState: TopicBottomSheetContentState.lookingForOpponent }))` — mirrors `handlePlayLive`
  5. `dispatch(setTopicBottomSheetFooterState({ topicBottomSheetFooterState: TopicBottomSheetFooterState.default }))` — mirrors `handlePlayLive`
- Make the callback `async` to support `await`

---

## Flow Summary

```
URL opens with ?topicId=123&lookForOpponent=true
  → AppUrlListener extracts params
  → loadTopicData thunk fetches /api/syllabus/v3/topic/123/
  → topic stored in unitwiseTopicsSlice.topicRecord
  → openTopicBottomSheet({ topicId: "123", autoLookForOpponent: true })
  → setTopicMode(matchMode)
  → setTopicBottomSheetContentState(lookingForOpponent)   ← same as "Play Live" click
  → setTopicBottomSheetFooterState(default)              ← same as "Play Live" click
  → TopicBottomSheet mounts, useEffect fires
  → handleLookForOpponent() → sendTopicModeSocketJsonMessage({ action: "look_for_opponent" })
```

---

## Verification
1. Build the app and send a push notification with `actionUrl` containing `?topicId=<valid_id>&lookForOpponent=true`
2. Confirm: topic bottom sheet opens, shows match mode UI, and automatically begins searching for an opponent (footer shows `inviteSent` state)
3. Test without `lookForOpponent` param: sheet opens in "play live" state but does NOT auto-trigger opponent search
4. Test with an invalid `topicId`: thunk rejects gracefully, bottom sheet does not open
