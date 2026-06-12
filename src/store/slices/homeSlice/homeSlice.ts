import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { StudentStateKey } from '@/enums/global';

interface HomeSliceState {
  studentStateKey: StudentStateKey;
}

const initialState: HomeSliceState = {
  studentStateKey: StudentStateKey.new,
};

const homeSlice = createSlice({
  name: 'homeSlice',
  initialState,
  reducers: {
    setStudentStateKey(state, action: PayloadAction<StudentStateKey>) {
      state.studentStateKey = action.payload;
    },
  },
});

export const { setStudentStateKey } = homeSlice.actions;
export default homeSlice.reducer;
