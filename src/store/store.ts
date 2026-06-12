import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import homeSliceReducer from './slices/homeSlice/homeSlice';
import authSliceReducer from './slices/authSlice/authSlice';
import assessmentSliceReducer from './slices/assessmentSlice/assessmentSlice';
import coachingSliceReducer from './slices/coachingSlice/coachingSlice';

export const store = configureStore({
  reducer: {
    homeSlice: homeSliceReducer,
    auth: authSliceReducer,
    assessment: assessmentSliceReducer,
    coaching: coachingSliceReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
