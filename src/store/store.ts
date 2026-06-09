import { configureStore } from '@reduxjs/toolkit';
import homeSliceReducer from './slices/homeSlice/homeSlice';

export const store = configureStore({
  reducer: {
    homeSlice: homeSliceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
