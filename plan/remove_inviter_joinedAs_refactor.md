# Refactor: Remove Inviter/JoinedAs Concept + Use userSlice for Current User Data

## Goal

Remove the `inviter` / `TopicMatchJoinedAs` concept entirely. The backend no longer sends `you_are`.  
- `user_*` fields from backend = **current user's** data  
- `opponent_*` fields = **the other person's** data (always)  

Current user identity/profile is read from **`userSlice`** directly — not passed as `inviterData` props.  
No component should receive `inviterData` as a prop. Smart components use `useAppSelector` on `userSlice`.  
Pure JSX components receive simple named props: `myFullName`, `myProfilePictureUrl`, `myUserDataId`.

---

## Naming Convention After Refactor

| Before (inviter-side)         | After                                  |
|-------------------------------|----------------------------------------|
| `inviterData`                 | removed — read from `userSlice`        |
| `inviterUserDataId`           | `userSlice.entity.userData.userDataId` |
| `inviterFullName`             | `userSlice.entity.userData.userFullName` |
| `inviterProfilePictureUrl`    | `userSlice.entity.userData.userProfilePictureUrl` |
| `isInviterOnline`             | removed — current user is always online by definition |
| `inviterSelectedOptionId`     | `mySelectedOptionId`                   |
| `totalPointsGainedByInviter`  | `myTotalPointsGained`                  |
| `inviterScore`                | `myScore`                              |
| `inviterThisTopicScore`       | `myThisTopicScore`                     |
| `inviterOverallScore`         | `myOverallScore`                       |
| `inviterTotalWins`            | `myTotalWins`                          |
| `inviterThisTopicTotalWins`   | `myThisTopicTotalWins`                 |
| `inviterTopicData`            | `myTopicData`                          |
| `topicMatchJoinedAs`          | removed                                |

**userSlice selector shorthand** (used throughout):
```ts
const { userFullName, userProfilePictureUrl, userDataId } =
  useAppSelector((state) => state.user.entity.userData);
```

---

## Execution Order

1. `src/enums.ts`
2. `src/interfaces/topicMatchInterfaces.ts`
3. `src/interfaces/botMatchMakingInterfaces.ts`
4. `src/interfaces/growthInterfaces.ts`
5. `src/hooks/webSockets/topicMatchSocket/messages.ts`
6. `src/hooks/webSockets/topicMatchModeSocket/messages.ts`
7. `src/hooks/webSockets/appSocket/messages.ts`
8. `src/hooks/webSockets/appSocket/actions.ts`
9. `src/hooks/webSockets/botMatchmakingSocket/messages.ts`
10. `src/hooks/webSockets/botMatchmakingSocket/actions.ts`
11. `src/store/slices/topicBottomSheetSlice/topicBottomSheetSlice.ts`
12. `src/store/slices/topicMatchSlice/topicMatchSlice.ts`
13. `src/store/slices/topicMatchSlice/thunks/loadCompletedTopicMatchData/`
14. `src/utils/getDataFromResponse/getEventsDataFromResponse.ts`
15. `src/wrapperComponents/AppSocketWrapper.tsx`
16. `src/wrapperComponents/PushNotificationsManager.tsx`
17. `src/utils/toasts/`
18. `src/components/topicBottomSheet/`
19. `src/pages/topicMatchPage/`
20. `src/pages/matchStartTimerPage/`
21. `src/pages/topicMatchResultPage/`
22. `src/pages/topicMatchReviewPage/`
23. `src/components/liveTopicMatchCard/`
24. `src/components/topicEventHistoryCards/`
25. `src/components/botMatchCard/`
26. `src/pages/liveMatchesAndFriendsPage/`
27. Several `openTopicBottomSheet` call sites

Run `tsc --noEmit` after each phase.

---

## Files to Change

---

### 1. `src/enums.ts` — lines 257–260

**Delete** the entire `TopicMatchJoinedAs` enum:
```ts
// DELETE:
export enum TopicMatchJoinedAs {
  inviter = "user",
  opponent = "opponent",
}
```

---

### 2. `src/interfaces/topicMatchInterfaces.ts`

**A. `TopicMatchResultData`** (lines 11–30)
- Remove `topicMatchJoinedAs: TopicMatchJoinedAs`
- Rename all `inviter*` score fields → `my*` per table above
- Remove `TopicMatchJoinedAs` from imports

```ts
// AFTER:
export interface TopicMatchResultData {
  totalNewQuestions: number;
  totalOldQuestions: number;
  matchResultStatus: MatchResultStatus;
  winnerBonus: number;
  loserBonus: number;
  myTopicData: TopicData;
  opponentTopicData: TopicData | null;
  opponentScore: number;
  opponentThisTopicScore: number;
  opponentOverallScore: number;
  opponentTotalWins: number;
  opponentThisTopicTotalWins: number;
  myScore: number;
  myThisTopicScore: number;
  myOverallScore: number;
  myTotalWins: number;
  myThisTopicTotalWins: number;
}
```

**B. `TopicMatchData`** (lines 32–37)
- Remove `inviterData: InviterData`
- Keep only `opponentData: OpponentData`

```ts
// AFTER:
export interface TopicMatchData {
  topicMatchId: string;
  opponentData: OpponentData;
  topicData: TopicData;
}
```

**C. `InviterData`** (lines 45–50) — **Delete entirely**

**D. `TopicMatchQuestionData`** (lines 52–64)
- Rename `inviterSelectedOptionId` → `mySelectedOptionId`
- Rename `totalPointsGainedByInviter` → `myTotalPointsGained`

**E. `LiveTopicMatchData`** (lines 66–72)
- The person who sent the invite is the opponent from the receiver's perspective
- Rename fields: `inviterFullName` → `opponentFullName`, `inviterProfilePictureUrl` → `opponentProfilePictureUrl`, `inviterUserDataId` → `opponentUserDataId`

---

### 3. `src/interfaces/botMatchMakingInterfaces.ts`

- **Delete** `InviterData` interface (lines 10–15)
- In `BotMatchData` (line 19): remove `inviterData: InviterData` field
- Keep `opponentData: OpponentData` unchanged

---

### 3b. `src/interfaces/growthInterfaces.ts` + `src/utils/getDataFromResponse/getEventsDataFromResponse.ts`

**`growthInterfaces.ts`**:
- Removed `you_are: TopicMatchJoinedAs` from `TopicalMatchEventDataResponse` (backend response interface)
- Removed `topicMatchJoinedAs: TopicMatchJoinedAs` from `TopicalMatchEventData` (frontend interface)
- Removed `TopicMatchJoinedAs` from imports

**`getEventsDataFromResponse.ts`**:
- Removed `topicMatchJoinedAs: eventDataResponse.you_are` from the `TopicalMatchEventData` mapping

---

### 4. `src/hooks/webSockets/topicMatchSocket/messages.ts`

**`PlayerStatusUpdateMessageResponse`**: backend still sends `user_online` + `opponent_online`.  
**`PlayerStatusUpdateMessageData`**: remove `isInviterOnline`. Keep only `isOpponentOnline`.  
**`getPlayerStatusUpdateMessageDataFromResponse`**: remove `isInviterOnline: user_online` from return.

**`NewMessageRecievedMessageResponse` / `NewMessageRecievedMessageData`**:
- `from: TopicMatchJoinedAs` → `fromOpponent: boolean`
- Mapping: `fromOpponent: from === "opponent"`

**`MatchFinishedMessageResponse`**: remove `you_are: TopicMatchJoinedAs`.

**`getMatchFinishedMessageDataFromResponse`**:
- Remove `you_are` destructuring and `topicMatchJoinedAs: you_are` in return
- Rename return fields per table: `inviterTopicData` → `myTopicData`, `inviterScore` → `myScore`, etc.

**`MatchFinishedMessageData`**:
- Remove `topicMatchJoinedAs: TopicMatchJoinedAs`
- Rename all `inviter*` → `my*`

**`getCorrectAnswerMessageDataFromResponse`**:
- `inviterSelectedOptionId: user_answer` → `mySelectedOptionId: user_answer`
- `totalPointsGainedByInviter: user_score` → `myTotalPointsGained: user_score`

**`CorrectAnswerMessageData`**:
- Rename `inviterSelectedOptionId` → `mySelectedOptionId`
- Rename `totalPointsGainedByInviter` → `myTotalPointsGained`

**`StartMatchMessageResponse`**: remove `you_are: TopicMatchJoinedAs`.

**`getStartMatchMessageDataFromResponse`**:
- Remove `you_are` destructuring
- In `questionsData` mapping: rename `inviterSelectedOptionId` → `mySelectedOptionId`, `totalPointsGainedByInviter` → `myTotalPointsGained`
- In `topicMatchData`: **delete** entire `inviterData` block (lines 382–387)
- Remove `topicMatchJoinedAs: you_are` from return

**`StartMatchMessageData`**: remove `topicMatchJoinedAs: TopicMatchJoinedAs`.

Remove `TopicMatchJoinedAs` from imports (line 5).

---

### 5. `src/hooks/webSockets/topicMatchModeSocket/messages.ts`

**`getOpponentJoinedMessageDataFromResponse`**:
- Remove `inviterUserDataId: user_id` from return

**`GetOpponentJoinedMessageDataReturnType`**:
- Remove `inviterUserDataId: string`

---

### 6. `src/hooks/webSockets/appSocket/messages.ts` + `actions.ts`

**`actions.ts`**:
- Renamed `inviterUserDataId` → `opponentUserDataId` in `GetInviteResponseActionDataArgs` and in `getInviteResponseActionData` (the field passed as `user_data_id` to the server is the opponent's id, not the inviter's)
- Removed inviter-centric JSDoc comments from `getReadyUpActionData`, `getLeaveLobbyActionData`, `getInviteResponseActionData`

**`getInviteRecievedMessageDataFromResponse`**:
- Remove `inviterUserDataId`, `inviterProfilePictureUrl`, `inviterFullName` from return
- The inviter IS the opponent from the receiver's perspective — their data is already in `opponentData`

**`GetInviteRecievedMessageData`**: remove `inviterFullName`, `inviterProfilePictureUrl`, `inviterUserDataId`.

**`getInviteExpiredMessageDataFromResponse`**:
- Remove `inviterUserDataId`, `inviterProfilePictureUrl`, `inviterFullName` from return
- Identify expired invite by `topicMatchId` (quiz_id) only

**`GetInviteExpiredMessageData`**: remove `inviterFullName`, `inviterProfilePictureUrl`, `inviterUserDataId`.

---

### 6b. `src/hooks/webSockets/botMatchmakingSocket/messages.ts` + `actions.ts`

**`messages.ts`**:
- Removed the comment block that described "bot as inviter" — bot is not an inviter, it just creates the match
- In `getNewBotMatchAvailableMessageDataFromResponse`, `getBotMatchesMessageDataFromResponse`, `getBotMatchJoinedMessageDataFromResponse`: removed the entire `inviterData` block (was pulling `bot.id`, `bot.name`, `bot.profile_picture` into inviter-named fields); bot data is no longer surfaced as inviter
- Removed destructuring of `bot` from the `getBotMatchesMessageDataFromResponse` mapping where only `inviterData` was using it

**`actions.ts`**:
- Removed inviter-centric JSDoc comment from `getJoinBotMatchActionData`

---

### 7. `src/store/slices/topicBottomSheetSlice/topicBottomSheetSlice.ts`

**State interface `TopicBottomSheetSlice`**:
- Remove `inviterUserData: InviterUserData | null`
- Remove `topicMatchJoinedAs: TopicMatchJoinedAs`
- Remove `// used by inviter` and `// used by opponent` comments

**`InviterUserData` interface** — **delete entirely**

**`initialTopicBottomSheetSlice`**:
- Remove `inviterUserData: null`
- Remove `topicMatchJoinedAs: TopicMatchJoinedAs.inviter`

**Reducers**: remove `setInviterUserData` reducer entirely.

**Exports**: remove `setInviterUserData`.

**`OpenTopicBottomSheetArgs` interface**: remove `topicMatchJoinedAs: TopicMatchJoinedAs`.

**`SetInviterUserDataArgs` interface** — **delete entirely**

Remove `TopicMatchJoinedAs` from imports.

---

### 8. `src/store/slices/topicMatchSlice/topicMatchSlice.ts`

**State interface `TopicMatchSlice`**: remove `topicMatchJoinedAs: TopicMatchJoinedAs | null`.

**`initialTopicMatchSlice`**: remove `topicMatchJoinedAs: null`.

**Reducers**:
- Remove `setTopicMatchJoinedAs`
- Remove `setInviterIsOnline` (current user is always online)
- In `attemptedQuestion` reducer: rename `inviterSelectedOptionId` → `mySelectedOptionId`, `totalPointsGainedByInviter` → `myTotalPointsGained`
- In `updateQuestionData` reducer: same renames

**Extra reducers**: remove `state.topicMatchJoinedAs = topicMatchResultData?.topicMatchJoinedAs`.

**Exports**: remove `setTopicMatchJoinedAs`, `setInviterIsOnline`.

**Interfaces**:
- Delete `SetTopicMatchJoinedAsArgs`
- Delete `SetInviterIsOnlineArgs`
- In `AttemptedQuestionArgs`: rename `inviterSelectedOptionId` → `mySelectedOptionId`, `totalPointsGainedByInviter` → `myTotalPointsGained`
- In `UpdateQuestionDataArgs`: same renames

Remove `TopicMatchJoinedAs` from imports.

---

### 9. `src/store/slices/topicMatchSlice/thunks/loadCompletedTopicMatchData/`

**`interfaces/frontend.ts`**:
- Rename `inviter*` score/data fields → `my*`
- Remove `topicMatchJoinedAs` field

**`loadCompletedTopicMatchData.ts`**:
- Update field mappings: rename `inviter_*` server fields → `my*`
- Remove `topicMatchJoinedAs` mapping
- Remove `inviterData` from `TopicMatchData` construction (no `match.user` block)

---

### 10. `src/wrapperComponents/AppSocketWrapper.tsx`

**Invite received handler**:
- Remove `setInviterUserData` dispatch
- Remove `topicMatchJoinedAs` from `openTopicBottomSheet` dispatch args

**Invite expired handler**:
- Remove references to `inviterFullName`, `inviterUserDataId`, `inviterProfilePictureUrl`

**Player status update handler**:
- Remove `setInviterIsOnline` dispatch entirely
- Keep only `setOpponentIsOnline` dispatch

**Any `openTopicBottomSheet` dispatch**: remove `topicMatchJoinedAs` from the argument object.

---

### 11. `src/utils/toasts/showMatchInviteToast.tsx`

- Replace `inviterFullName`, `inviterProfilePictureUrl`, `inviterUserDataId` with opponent equivalents
- The person who sent the invite is the opponent from the receiver's view — use `opponentData` fields

---

### 12. `src/utils/toasts/showRejoinMatchToast.tsx`

- Use `opponentFullName`, `opponentProfilePictureUrl` from `LiveTopicMatchData` (renamed in step 2E)

---

### 13. `src/components/topicBottomSheet/TopicBottomSheet.tsx`

- Remove `topicMatchJoinedAs` from `openTopicBottomSheet` dispatch args
- Remove `TopicMatchJoinedAs` import

---

### 14. `src/components/topicBottomSheet/topicBottomSheetComponents/topicBottomSheetFooter/TopicBottomSheetFooter.tsx`

- Remove `inviterUserData` from Redux selector
- Remove `inviterUserData` prop passed to `TopicBottomSheetFooterJSX`
- Add `useAppSelector` for `userSlice.entity.userData` to get `userFullName`, `userProfilePictureUrl`
- Pass as `myFullName`, `myProfilePictureUrl` to JSX component

---

### 15. `src/components/topicBottomSheet/topicBottomSheetComponents/topicBottomSheetFooter/TopicBottomSheetFooterJSX.tsx`

- Remove `inviterUserData` prop from interface
- Add `myFullName: string`, `myProfilePictureUrl: string | null` to props interface
- Remove the opponent-role rendering branch that showed inviter's info
- Bottom sheet always shows: current user on one side using `myFullName`/`myProfilePictureUrl`, opponent on the other using `opponentData`

---

### 16. `src/pages/topicMatchPage/TopicMatchPage.tsx`

- Remove dispatch of `setTopicMatchJoinedAs`
- Remove dispatch of `setInviterIsOnline`
- Remove all `inviterData` and `topicMatchJoinedAs` prop drilling

---

### 17. `src/pages/topicMatchPage/topicMatchPageComponents/topicMatchPageHeader/TopicMatchPageHeader.tsx`

- Remove `inviterData` destructuring from `topicMatchData`
- Add `useAppSelector` to read `userFullName`, `userProfilePictureUrl` from `userSlice.entity.userData`
- Remove `inviterData` prop passed to `TopicMatchPageHeaderJSX`
- Pass `myFullName`, `myProfilePictureUrl` as explicit props instead

---

### 18. `src/pages/topicMatchPage/topicMatchPageComponents/topicMatchPageHeader/TopicMatchPageHeaderJSX.tsx`

- Remove `inviterData: InviterData` from props interface
- Add `myFullName: string | null`, `myProfilePictureUrl: string | null` to props interface
- Replace all `inviterData.inviterFullName` → `myFullName`, `inviterData.inviterProfilePictureUrl` → `myProfilePictureUrl`
- Remove role-conditional `order` / alignment logic — left side is always current user, right side always opponent

---

### 19. `src/pages/topicMatchPage/topicMatchPageComponents/topicMatchPageContent/TopicMatchPageContent.tsx` + `...ContentJSX.tsx`

**Smart component (`TopicMatchPageContent.tsx`)**:
- Add `useAppSelector` for `userSlice.entity.userData` to read `userProfilePictureUrl`
- Pass `myProfilePictureUrl` as an explicit prop to JSX

**JSX component (`TopicMatchPageContentJSX.tsx`)**:
- Remove `inviterData` destructuring from `topicMatchData` prop
- Rename `inviterSelectedOptionId` → `mySelectedOptionId`, `totalPointsGainedByInviter` → `myTotalPointsGained`
- Receive `myProfilePictureUrl` as a direct prop from smart component

---

### 20. `src/pages/matchStartTimerPage/matchStartTimerPageComponents/matchStartTimerPageContent/MatchStartTimerPageContent.tsx` + `...ContentJSX.tsx`

**Smart component (`MatchStartTimerPageContent.tsx`)**:
- Add `useAppSelector` for `userSlice.entity.userData` to read `userFullName`, `userProfilePictureUrl`
- Pass `myFullName`, `myProfilePictureUrl` as explicit props to JSX

**JSX component (`MatchStartTimerPageContentJSX.tsx`)**:
- Remove `inviterData` destructuring from `topicMatchData`
- Add `myFullName: string | null`, `myProfilePictureUrl: string | null` to props interface
- Replace `inviterFullName` → `myFullName`, `inviterProfilePictureUrl` → `myProfilePictureUrl`

---

### 21. `src/pages/topicMatchResultPage/TopicMatchResultPage.tsx` + `...PageJSX.tsx` + `...SocketContextProvider.tsx`

**`TopicMatchResultPage.tsx`**:
- Remove `topicMatchJoinedAs` from selector and all usage
- Remove prop drilling of anything `inviter`-related

**`TopicMatchResultPageJSX.tsx`**:
- Removed `readyState: ReadyState` prop (no longer needed now that footer doesn't conditionally gate rematch by socket state)
- Removed `readyState` from `TopicMatchResultPageFooter` props

**`TopicMatchResultPageSocketContextProvider.tsx`**:
- Removed `readyState` from `topicMatchSocketContext` destructuring
- Removed `readyState` from props passed to `TopicMatchResultPage`

---

### 22. `src/pages/topicMatchResultPage/topicMatchResultPageComponents/topicMatchResultPageContent/TopicMatchResultPageContent.tsx`

- Remove `topicMatchJoinedAs` from selector
- Remove role-conditional logic for `rivalUserDataId`, `rivalFullName`, `rivalProfilePictureUrl` — opponent is always the rival, so use `opponentData` directly
- Add selector for `userSlice.entity.userData` to get `userDataId`, `userFullName`, `userProfilePictureUrl` for current user display
- Pass `myFullName`, `myProfilePictureUrl`, `myUserDataId` as explicit props to JSX component

---

### 23. `src/pages/topicMatchResultPage/topicMatchResultPageComponents/topicMatchResultPageContent/TopicMatchResultPageContentJSX.tsx`

- Remove `inviterData` destructuring from `topicMatchData`
- Add `myFullName: string | null`, `myProfilePictureUrl: string | null` to props interface
- Replace all `inviterData.*` usages with `my*` props
- Remove `isInviterOnline` (current user is always online)
- Rename `inviter*` score fields → `my*` throughout
- Remove role-conditional display branching — left = me, right = opponent, always

---

### 24. `src/pages/topicMatchResultPage/topicMatchResultPageComponents/topicMatchResultPageFooter/TopicMatchResultPageFooter.tsx` + `...FooterJSX.tsx`

**Smart component (`TopicMatchResultPageFooter.tsx`)**:
- Remove `topicMatchJoinedAs` from selector
- Remove role-conditional logic for `userProfilePictureUrl`, `userFullName`
- Add selector for `userSlice.entity.userData` → pass `myFullName`, `myProfilePictureUrl`
- `rivalProfilePictureUrl` is always `opponentData.opponentProfilePictureUrl`
- Remove `inviterData` destructuring entirely
- Removed `readyState` prop (socket state no longer gates rematch UI)

**JSX component (`TopicMatchResultPageFooterJSX.tsx`)**:
- Renamed `rivalFullName` → `opponentFullName`, `rivalProfilePictureUrl` → `opponentProfilePictureUrl` in props interface and throughout
- Renamed internal variable `rivalAvatarUrl` → `opponentAvatarUrl`
- Updated all display references accordingly

---

### 25. `src/pages/topicMatchResultPage/topicMatchResultPageComponents/rematchRequestBottomSheet/RematchRequestBottomSheet.tsx` + `...BottomSheetJSX.tsx`

**Smart component (`RematchRequestBottomSheet.tsx`)**:
- Remove `topicMatchJoinedAs`-dependent logic

**JSX component (`RematchRequestBottomSheetJSX.tsx`)**:
- Renamed `rivalFullName` → `opponentFullName`, `rivalProfilePictureUrl` → `opponentProfilePictureUrl` in props interface and throughout

---

### 26. `src/pages/topicMatchReviewPage/topicMatchReviewPageComponents/topicMatchReviewPageHeader/TopicMatchReviewPageHeader.tsx`

- Remove `inviterData` destructuring from `topicMatchData`
- Add selector for `userSlice.entity.userData`
- Replace `{...inviterData}` spread → pass `myFullName`, `myProfilePictureUrl` as named props
- Remove `topicMatchJoinedAs`-conditional branches

---

### 27. `src/pages/topicMatchReviewPage/topicMatchReviewPageComponents/topicMatchReviewPageHeader/TopicMatchReviewPageHeaderJSX.tsx`

- Remove spread `inviter*` props (`inviterUserDataId`, `inviterFullName`, `inviterProfilePictureUrl`, `isInviterOnline`)
- Add `myFullName: string | null`, `myProfilePictureUrl: string | null` to props interface
- Replace usages accordingly
- Remove `topicMatchJoinedAs`-conditional display branches

---

### 28. `src/pages/topicMatchReviewPage/topicMatchReviewPageComponents/topicMatchReviewPageContent/TopicMatchReviewPageContent.tsx` + `...ContentJSX.tsx`

**Smart component (`TopicMatchReviewPageContent.tsx`)**:
- Add `useAppSelector` for `userSlice.entity.userData` to read `userProfilePictureUrl`
- Pass `myProfilePictureUrl` as explicit prop to JSX

**JSX component (`TopicMatchReviewPageContentJSX.tsx`)**:
- Remove `inviterData` destructuring from `topicMatchData`
- Add `myProfilePictureUrl: string | null` to props interface (parent passes from `userSlice`)
- Rename `inviterSelectedOptionId` → `mySelectedOptionId`, `totalPointsGainedByInviter` → `myTotalPointsGained`

---

### 29. `src/pages/topicMatchReviewPage/topicMatchReviewPageComponents/topicMatchReviewPageFooter/TopicMatchReviewPageFooter.tsx` + `...FooterJSX.tsx`

**Smart component (`TopicMatchReviewPageFooter.tsx`)**:
- Add `useAppSelector` for `userSlice.entity.userData`
- Remove `topicMatchJoinedAs`-dependent logic
- Pass relevant user fields to JSX

**JSX component (`TopicMatchReviewPageFooterJSX.tsx`)**:
- Remove `topicMatchJoinedAs`-based branching

---

### 30. `src/components/liveTopicMatchCard/LiveTopicMatchCard.tsx` + `...CardJSX.tsx`

- After step 2E, `inviterFullName` → `opponentFullName`, etc.
- Update field references in both files

---

### 31. `src/components/topicEventHistoryCards/topicalMatchCompletedEvent/TopicalMatchCompletedEvent.tsx`

- Remove `inviterData`-based branching
- The "other person" is always `opponentData`
- Current user info: use `useAppSelector` on `userSlice.entity.userData`

---

### 32. `src/components/botMatchCard/BotMatchCard.tsx` + `...CardJSX.tsx`

- Remove `inviterData` / `inviterFullName` references
- Current user info: use `useAppSelector` on `userSlice.entity.userData` in the smart component, pass as `myFullName`, `myProfilePictureUrl`

---

### 33. `src/pages/liveMatchesAndFriendsPage/LiveMatchesAndFriendsPage.tsx`

- Remove `inviterData` prop drilling

---

### 34. All `openTopicBottomSheet` call sites

Every call to `openTopicBottomSheet` previously passed `topicMatchJoinedAs: TopicMatchJoinedAs.inviter` — remove that field from all dispatch args:

- `src/pages/goalSelectionPage/goalSelectionPageComponents/goalSelectionPageContent/GoalSelectionPageContent.tsx`
- `src/pages/guestUserTopicSelectionPage/guestUserTopicSelectionPageComponents/guestUserTopicSelectionPageContent/GuestUserTopicSelectionPageContent.tsx`
- `src/pages/homePage/homePageComponents/homePageContent/homePageContentComponents/onGoingTopics/OngoingTopics.tsx`
- `src/pages/quizResultPage/quizResultPageComponents/quizResultPageFooter/QuizResultPageFooter.tsx`
- `src/components/ongoingTopicCard/OngoingTopicCard.tsx`
- `src/components/unitwiseAllTopics/UnitwiseAllTopics.tsx`
- `src/pages/topicPage/topicPageComponents/topicPageContent/topicPageContentComponents/overview/Overview.tsx`

---

### 35. `src/wrapperComponents/PushNotificationsManager.tsx`

Unrelated to the inviter/joinedAs refactor but committed in the same batch:
- Fixed push notification navigation: `click_action` from the server can arrive as a full URL (e.g. `https://app.netpractice.in/some/path`). Now strips `PRODUCTION_WEB_APP_URL` prefix before calling `navigate()` so React Router receives an in-app relative path instead of a full URL.

---

## Summary of Pattern for Smart → JSX Components

**Before:**
```tsx
// Smart component
const { topicMatchData } = useAppSelector(...);
const { inviterData, opponentData } = topicMatchData;
return <SomeJSX inviterData={inviterData} opponentData={opponentData} />;

// JSX component
const SomeJSX = ({ inviterData, opponentData }: Props) => {
  const { inviterFullName, inviterProfilePictureUrl } = inviterData;
  ...
};
```

**After:**
```tsx
// Smart component
const { topicMatchData } = useAppSelector(...);
const { opponentData } = topicMatchData;
const { userFullName, userProfilePictureUrl } = useAppSelector(
  (state) => state.user.entity.userData
);
return (
  <SomeJSX
    myFullName={userFullName}
    myProfilePictureUrl={userProfilePictureUrl}
    opponentData={opponentData}
  />
);

// JSX component
interface SomeJSXProps {
  myFullName: string | null;
  myProfilePictureUrl: string | null;
  opponentData: OpponentData;
}
const SomeJSX = ({ myFullName, myProfilePictureUrl, opponentData }: SomeJSXProps) => {
  ...
};
```
