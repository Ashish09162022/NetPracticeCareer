import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { StudentStateKey } from '@/enums/global';

export enum HomeSliceStatus {
  idle = 'idle',
  loading = 'loading',
  loaded = 'loaded',
}

export interface HomeSlice {
  status: HomeSliceStatus;
  studentStateKey: StudentStateKey;
}

const initialHomeSlice: HomeSlice = {
  status: HomeSliceStatus.idle,
  studentStateKey: StudentStateKey.new,
};

const homeSlice = createSlice({
  name: 'homeSlice',
  initialState: initialHomeSlice,
  reducers: {
    setStudentStateKey(state, action: PayloadAction<StudentStateKey>) {
      state.studentStateKey = action.payload;
    },
  },
});

export default homeSlice.reducer;
export const { setStudentStateKey } = homeSlice.actions;
