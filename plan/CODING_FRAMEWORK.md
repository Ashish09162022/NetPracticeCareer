# Coding Framework — npcMainApp

This document describes the exact patterns, conventions, and architectural decisions used in this codebase. Any agent or developer building new features must follow these patterns without deviation.

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [TypeScript Conventions](#2-typescript-conventions)
3. [Redux Store — Slices](#3-redux-store--slices)
4. [Redux Store — Thunks](#4-redux-store--thunks)
5. [Custom Hooks](#5-custom-hooks)
6. [API Layer](#6-api-layer)
7. [Pages](#7-pages)
8. [Components](#8-components)
9. [Constants and Enums](#9-constants-and-enums)
10. [Routing](#10-routing)
11. [Imports](#11-imports)
12. [Error Handling](#12-error-handling)
13. [Checklist — New Feature](#13-checklist--new-feature)

---

## 1. Folder Structure

```
src/
├── apis/              # API fetch functions, one file per endpoint
├── components/        # Reusable presentational components
├── enums/             # Global enums (PathFor, DataPointsEvent, etc.)
├── hooks/             # Custom React hooks (store hooks + feature hooks)
├── icons/             # SVG icon components
├── images/            # Image assets
├── interfaces/        # TypeScript interfaces for backend + frontend shapes
├── pages/             # Route-level page components
├── schemas/           # Validation schemas
├── store/
│   └── slices/
│       └── <featureName>Slice/
│           ├── <featureName>Slice.ts          # slice definition
│           └── thunks/
│               └── <thunkName>/
│                   └── <thunkName>.ts         # one file per thunk
├── types/             # TypeScript type aliases and declarations
├── utils/             # Pure utility functions
└── wrapperComponents/ # Context providers, route guards, global managers
```

**Rules:**
- Every slice lives in its own folder under `store/slices/`.
- Each thunk lives in its own file under `store/slices/<feature>Slice/thunks/<thunkName>/`.
- Every page lives in its own folder under `pages/` (e.g., `pages/homePage/`).
- Reusable components go in `components/`, never inside `pages/`.

---

## 2. TypeScript Conventions

### Naming

| What | Pattern | Example |
|------|---------|---------|
| Props interface | `<ComponentName>Props` | `CustomButtonProps` |
| Slice state interface | `<SliceName>Slice` | `DailyGoalsAndFocusSlice` |
| Backend response type | `<Name>Response` or `<Name>BackendResponse` | `CreateQuizFulfilledResponse` |
| Frontend entity type | `<Name>Data` or `<Name>Entity` | `DailyGoalsAndFocusData` |
| Thunk args | `<ThunkName>Args` | `CreateQuizArgs` |
| Thunk return | `<ThunkName>ReturnType` | `CreateQuizReturnType` |
| Hook props | `Use<HookName>Props` | `UseTopicDataProps` |

- **No `I-` or `T-` prefixes** on any interface or type.
- Use `interface` for object shapes; use `type` for unions and aliases.
- Backend fields are `snake_case`. Frontend fields are `camelCase`. Never mix them.

### Backend vs Frontend separation

Always define two interfaces: one matching the raw API response (snake_case), one for what the app uses (camelCase). Transform in the thunk or API function, never in components.

```typescript
// interfaces/myFeature.ts

// Backend (raw API response)
export interface MyFeatureResponse {
  user_id: string;
  created_at: string;
  total_count: number;
}

// Frontend (what the app uses)
export interface MyFeatureData {
  userId: string;
  createdAt: string;
  totalCount: number;
}
```

---

## 3. Redux Store — Slices

### Slice file structure

Every slice follows this exact order:

1. Import statements
2. Status enum (if async)
3. State interface
4. Initial state constant
5. `createSlice` call
6. Default export of reducer
7. Named exports of actions

```typescript
// store/slices/myFeatureSlice/myFeatureSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MyFeatureData } from "@/interfaces/myFeature";
import { loadMyFeatureData } from "./thunks/loadMyFeatureData/loadMyFeatureData";

export enum MyFeatureSliceStatus {
  idle = "idle",
  loading = "loading",
  loaded = "loaded",
}

export interface MyFeatureSlice {
  status: MyFeatureSliceStatus;
  entity: MyFeatureData | null;
}

const initialMyFeatureSlice: MyFeatureSlice = {
  status: MyFeatureSliceStatus.idle,
  entity: null,
};

const myFeatureSlice = createSlice({
  name: "myFeatureSlice",
  initialState: initialMyFeatureSlice,
  reducers: {
    setMyFeatureEntity(state, action: PayloadAction<MyFeatureData>) {
      state.entity = action.payload;
    },
    clearMyFeatureEntity(state) {
      state.entity = null;
      state.status = MyFeatureSliceStatus.idle;
    },
  },
  extraReducers(builder) {
    builder.addCase(loadMyFeatureData.pending, (state) => {
      state.status = MyFeatureSliceStatus.loading;
    });
    builder.addCase(loadMyFeatureData.fulfilled, (state, action) => {
      state.entity = action.payload.loadMyFeatureDataFulfilledResponseData;
      state.status = MyFeatureSliceStatus.loaded;
    });
    builder.addCase(loadMyFeatureData.rejected, (state) => {
      state.status = MyFeatureSliceStatus.idle;
    });
  },
});

export default myFeatureSlice.reducer;
export const { setMyFeatureEntity, clearMyFeatureEntity } = myFeatureSlice.actions;
```

### Registering a new slice

Add the reducer to `src/store/store.ts`:

```typescript
import myFeatureSliceReducer from "./slices/myFeatureSlice/myFeatureSlice";

export const store = configureStore({
  reducer: {
    // ... existing
    myFeatureSlice: myFeatureSliceReducer,
  },
});
```

### Rules

- Status enum values are always: `idle`, `loading`, `loaded`.
- `entity` is always nullable (`| null`), initialized to `null`.
- Synchronous UI state (modal open, selected tab) uses plain reducers in the slice, not thunks.
- Never put derived/computed data in the slice — compute it in hooks or selectors.

---

## 4. Redux Store — Thunks

### File location

```
store/slices/myFeatureSlice/thunks/loadMyFeatureData/loadMyFeatureData.ts
```

One thunk per file. File name and thunk name are identical.

### Thunk structure

```typescript
// store/slices/myFeatureSlice/thunks/loadMyFeatureData/loadMyFeatureData.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { myFeatureApi } from "@/apis/myFeature/myFeatureApi";
import { MyFeatureData } from "@/interfaces/myFeature";
import { CustomError, DEFAULT_ERROR_MESSSAGE } from "@/utils/errors";

interface LoadMyFeatureDataFulfilledPayload {
  loadMyFeatureDataFulfilledResponseData: MyFeatureData;
}

export const loadMyFeatureData = createAsyncThunk<
  LoadMyFeatureDataFulfilledPayload,
  void,
  { rejectValue: CustomError }
>(
  "myFeatureSlice/loadMyFeatureData",
  async function (_, thunkAPI) {
    const { getState, rejectWithValue } = thunkAPI;
    const {
      userSlice: { entity: { userJwtToken } },
    } = getState() as RootState;

    if (userJwtToken === null) {
      return rejectWithValue({
        message: "userJwtToken is null",
        functionName: "loadMyFeatureData",
        status: null,
      });
    }

    try {
      const data = await myFeatureApi({ token: userJwtToken });
      return { loadMyFeatureDataFulfilledResponseData: data };
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
```

### Fulfilled payload naming

The fulfilled payload key is always:

```
<thunkName>FulfilledResponseData
```

Example: `loadMyFeatureDataFulfilledResponseData`, `submitTopicalQuizDataFulfilledResponseData`.

### Rules

- Always pull `userJwtToken` from `userSlice.entity` — never pass the token as an argument to the thunk.
- Guard `null` token at the top of the thunk and `rejectWithValue` immediately.
- Use `localStorage` caching with a date key when data doesn't change daily (follow the `dailyGoalsAndFocusSlice` thunk pattern).
- The thunk action type string must be `"<sliceName>/<thunkName>"`.

---

## 5. Custom Hooks

### Store hooks (always use these — never raw `useSelector`/`useDispatch`)

```typescript
// hooks/storeHooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Simple selector hook

Used when a component needs derived data from the store based on a prop.

```typescript
// hooks/useMyFeatureData.ts

export interface UseMyFeatureDataProps {
  featureId: string | null;
}

const useMyFeatureData = ({ featureId }: UseMyFeatureDataProps) => {
  const { entity } = useAppSelector((state) => state.myFeatureSlice);

  if (entity === null || featureId === null) return null;
  return entity.itemsById[featureId] ?? null;
};

export default useMyFeatureData;
```

### Action hook (dispatches, side effects, async)

Used when logic involves dispatching multiple actions or calling APIs.

```typescript
// hooks/useLoadMyFeature.ts

const useLoadMyFeature = () => {
  const dispatch = useAppDispatch();
  const { entity, status } = useAppSelector((state) => state.myFeatureSlice);

  const handleLoad = useCallback(async () => {
    try {
      await dispatch(loadMyFeatureData()).unwrap();
    } catch (error: any) {
      toast.error(error.message || DEFAULT_ERROR_MESSSAGE);
    }
  }, [dispatch]);

  return { entity, status, handleLoad };
};

export default useLoadMyFeature;
```

### Rules

- All hooks are named `use<PascalCase>` and live in `src/hooks/`.
- Props interface is named `Use<HookName>Props`.
- Use `useCallback` for any function returned from a hook or passed down as a prop.
- Do not use `useEffect` inside hooks for data fetching — expose the callback and let the page call it in its own `useEffect`.
- Never read from multiple slices in a single `useAppSelector` call. Use separate calls per slice.

---

## 6. API Layer

### File location

```
apis/<featureName>/<featureName>Api.ts
```

One file per endpoint or closely related group of endpoints.

### API function structure

```typescript
// apis/myFeature/myFeatureApi.ts

import { SERVER_DOMAIN, DEFAULT_API_HEADER } from "@/constants";
import { MyFeatureData, MyFeatureResponse } from "@/interfaces/myFeature";
import { CustomError, DEFAULT_ERROR_MESSSAGE } from "@/utils/errors";

export interface MyFeatureApiArgs {
  token: string;
}

const myFeatureApi = async ({ token }: MyFeatureApiArgs): Promise<MyFeatureData> => {
  const response = await fetch(`${SERVER_DOMAIN}/api/v1/my-feature/`, {
    method: "GET",
    headers: {
      ...DEFAULT_API_HEADER,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const customError: CustomError = {
      message: DEFAULT_ERROR_MESSSAGE,
      functionName: "myFeatureApi",
      status: response.status,
    };

    if (response.headers.get("content-type")?.includes("application/json")) {
      const errorBody = await response.json();
      customError.message = errorBody.detail ?? DEFAULT_ERROR_MESSSAGE;
    }

    throw customError;
  }

  const body: MyFeatureResponse = await response.json();

  return {
    userId: body.user_id,
    createdAt: body.created_at,
    totalCount: body.total_count,
  };
};

export default myFeatureApi;
```

### Rules

- Always include `Authorization: Bearer ${token}` and spread `DEFAULT_API_HEADER`.
- Always throw a `CustomError` (with `message`, `functionName`, `status`) — never a plain `Error`.
- Transform the backend response (snake_case → camelCase) inside the API function before returning.
- Never return the raw backend response shape to thunks or components.
- Method must be `"GET"`, `"POST"`, or `"PATCH"` — no lowercase.

---

## 7. Pages

### Structure

A page component is a container. It:
- Reads from the store with `useAppSelector`
- Dispatches with `useAppDispatch`
- Loads data in `useEffect`
- Wraps handlers in `useCallback`
- Returns a JSX component (often a separate `<PageNameJSX />`) — no raw JSX in the page file for complex UIs

```typescript
// pages/myFeaturePage/myFeaturePage.tsx

import React, { FC, useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/storeHooks";
import { loadMyFeatureData } from "@/store/slices/myFeatureSlice/thunks/loadMyFeatureData/loadMyFeatureData";
import MyFeaturePageJSX from "./myFeaturePageComponents/myFeaturePageJSX/MyFeaturePageJSX";

interface MyFeaturePageProps {}

const MyFeaturePage: FC<MyFeaturePageProps> = () => {
  const dispatch = useAppDispatch();
  const { entity, status } = useAppSelector((state) => state.myFeatureSlice);

  const handleLoadData = useCallback(async () => {
    await dispatch(loadMyFeatureData());
  }, [dispatch]);

  useEffect(() => {
    if (entity === null) handleLoadData();
  }, [entity, handleLoadData]);

  return <MyFeaturePageJSX entity={entity} status={status} />;
};

export default MyFeaturePage;
```

### Local UI state

Use `useState` for UI-only state (modal open, active tab). Never put UI-only state in Redux.

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [activeTab, setActiveTab] = useState<"tab1" | "tab2">("tab1");
```

Use `useRef` for mutable values that must not trigger re-renders (timers, tracking flags):

```typescript
const startTimeRef = useRef(new Date());
const hasLoggedRef = useRef<Record<string, boolean>>({});
```

### Rules

- Only one `useEffect` per data-loading concern.
- All `useEffect` dependencies must be exhaustive.
- Never fetch data or call APIs directly inside JSX or event handlers — always go through a thunk.
- Avoid inline functions in JSX (`onClick={() => ...}`) for anything beyond trivial one-liners — extract to `useCallback`.

---

## 8. Components

### Structure

Components are purely presentational. They receive data and callbacks via props.

```typescript
// components/myWidget/MyWidget.tsx

import React from "react";
import { Stack, Typography } from "@mui/material";
import { globalColors } from "@/constants"; // or however colors are stored

export interface MyWidgetProps {
  title: string;
  subtitle?: string;
  isDisabled?: boolean;
  handlePress: () => void;
}

const MyWidget: React.FC<MyWidgetProps> = ({
  title,
  subtitle,
  isDisabled = false,
  handlePress,
}) => {
  return (
    <Stack
      component="button"
      onClick={(e) => {
        e.stopPropagation();
        if (isDisabled) return;
        handlePress();
      }}
    >
      <Typography variant="body1">{title}</Typography>
      {subtitle && <Typography variant="caption">{subtitle}</Typography>}
    </Stack>
  );
};

export default MyWidget;
```

### Rules

- Props interface is named `<ComponentName>Props`, exported from the same file.
- Optional props have `?` and provide a default value in destructuring.
- Click handlers always call `event.stopPropagation()` first, then guard disabled state.
- Components that render math content call `mathJaxRender()` in a `useEffect`.
- Animated components use Framer Motion via `motion(Stack)` pattern; use `BASIC_ANIMATION` from constants for standard entrance animations.
- A component may read from the store only for global settings (e.g., `userSlice.entity.userSettingsData`) — never for feature-specific data.

---

## 9. Constants and Enums

### constants.ts

All magic strings, numbers, and config values live here. Add new entries at the end of the relevant group.

```typescript
// src/constants.ts

export const MY_FEATURE_LIMIT = 20;
export const MY_FEATURE_CACHE_KEY = "myFeatureData_v1";
```

Bump the cache key version suffix (e.g., `_v1` → `_v2`) whenever the cached data shape changes.

### Enums

All enums live in `src/enums/global.ts`.

```typescript
// src/enums/global.ts

export enum MyFeatureStatus {
  active = "active",
  inactive = "inactive",
  pending = "pending",
}
```

Route paths go in the `PathFor` enum:

```typescript
export enum PathFor {
  // ... existing
  myFeaturePage = "/my-feature",
  myFeatureDetailPage = "/my-feature/:featureId",
}
```

### Rules

- No hardcoded strings for route paths, API endpoints, or statuses anywhere in the app — always use an enum or constant.
- Enum values are always lowercase strings matching their key name where possible.
- Never import from constants inside a slice or thunk — slices may only import from interfaces, other slices, and utils.

---

## 10. Routing

### Adding a new route

1. Add the path to `PathFor` enum in `src/enums/global.ts`.
2. Import the page component in `src/wrapperComponents/Router.tsx`.
3. Add a route entry inside the `children` array.
4. Wrap with `RequiresOnboarding` if the user must be logged in.

```typescript
// In Router.tsx children array:
{
  path: PathFor.myFeaturePage,
  element: (
    <RequiresOnboarding>
      <MyFeaturePage />
    </RequiresOnboarding>
  ),
},
```

### Navigation

Use `useNavigate` from `react-router`. Always navigate to a `PathFor` value.

```typescript
const navigate = useNavigate();
navigate(PathFor.myFeaturePage);

// With params:
navigate(`/my-feature/${featureId}`);
```

Use `useParams` to read URL params:

```typescript
const { featureId } = useParams<{ featureId: string }>();
```

---

## 11. Imports

### Always use absolute imports with the `@/` alias

```typescript
// Correct
import { useAppSelector } from "@/hooks/storeHooks";
import { loadMyFeatureData } from "@/store/slices/myFeatureSlice/thunks/loadMyFeatureData/loadMyFeatureData";
import { PathFor } from "@/enums/global";
import { MyFeatureData } from "@/interfaces/myFeature";
```

Relative imports are only acceptable for files in the same folder (e.g., JSX subcomponent in the same page folder).

### Import order (implicit convention)

1. React and React hooks
2. Third-party libraries (MUI, react-router, framer-motion, react-hot-toast)
3. Store and hooks (`@/store/...`, `@/hooks/...`)
4. Interfaces and types (`@/interfaces/...`, `@/types/...`)
5. Enums and constants (`@/enums/...`, `@/constants`)
6. APIs (`@/apis/...`)
7. Utils (`@/utils/...`)
8. Components (`@/components/...`)
9. Local relative imports

---

## 12. Error Handling

### CustomError interface

All thrown errors in API functions and thunks must use this shape:

```typescript
interface CustomError {
  message: string;
  functionName: string;
  status: number | null;
}
```

### In API functions

```typescript
const customError: CustomError = {
  message: DEFAULT_ERROR_MESSSAGE,
  functionName: "myFeatureApi",
  status: response.status,
};

if (response.headers.get("content-type")?.includes("application/json")) {
  const body = await response.json();
  customError.message = body.detail ?? DEFAULT_ERROR_MESSSAGE;
}

throw customError;
```

### In thunks

Use `.unwrap()` when calling thunks from hooks or pages — errors propagate to the `catch` block.

```typescript
try {
  await dispatch(loadMyFeatureData()).unwrap();
} catch (error: any) {
  toast.error(error.message || DEFAULT_ERROR_MESSSAGE);
}
```

### Rules

- Never `console.error` as a substitute for user-facing error handling.
- Always show `toast.error(error.message || DEFAULT_ERROR_MESSSAGE)` for user-visible failures.
- `rejectWithValue` in thunks, `throw customError` in API functions.

---

## 13. Checklist — New Feature

Use this checklist when building any new feature end-to-end.

### Interfaces
- [ ] Backend response interface defined (snake_case fields)
- [ ] Frontend data interface defined (camelCase fields)
- [ ] Both exported from `src/interfaces/<featureName>.ts`

### API
- [ ] API function created in `src/apis/<featureName>/<featureName>Api.ts`
- [ ] Transforms backend → frontend shape
- [ ] Throws `CustomError` on failure
- [ ] Uses `DEFAULT_API_HEADER` and `Bearer` token

### Store — Slice
- [ ] Status enum defined (`idle`, `loading`, `loaded`)
- [ ] Slice state interface defined with `status` and `entity: ... | null`
- [ ] Slice created with `createSlice`
- [ ] Synchronous actions for any UI-driven state mutations
- [ ] `extraReducers` handles `pending`, `fulfilled`, `rejected` for all thunks
- [ ] Reducer registered in `store.ts`

### Store — Thunk
- [ ] One thunk per file under `thunks/<thunkName>/`
- [ ] Reads `userJwtToken` from store; guards null at top
- [ ] Fulfilled payload key follows `<thunkName>FulfilledResponseData` pattern
- [ ] Returns typed fulfilled payload

### Hooks
- [ ] Selector hook created if components need derived data
- [ ] Action hook created if complex dispatch sequences are needed
- [ ] All returned functions wrapped in `useCallback`

### Constants / Enums
- [ ] Route path added to `PathFor` enum
- [ ] Any status enums added to `src/enums/global.ts`
- [ ] Any config values / limits added to `src/constants.ts`

### Routing
- [ ] Route added to `Router.tsx` with appropriate guard wrapper
- [ ] Page navigates using `PathFor` values only

### Page
- [ ] Page reads from store; dispatches to load data in `useEffect`
- [ ] Local UI state uses `useState`; mutable non-reactive values use `useRef`
- [ ] Delegates rendering to a JSX subcomponent for complex UIs

### Component
- [ ] Props interface exported from the same file
- [ ] No direct store access except global settings
- [ ] Click handlers call `stopPropagation()` first
