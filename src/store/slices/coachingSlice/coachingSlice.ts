import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface CoachingState {
  attemptId: string | null;
  personaName: string | null;
  personaRole: string | null;
  openingMessage: string | null;
}

const initialState: CoachingState = {
  attemptId: null,
  personaName: null,
  personaRole: null,
  openingMessage: null,
};

const coachingSlice = createSlice({
  name: 'coaching',
  initialState,
  reducers: {
    setCoachingAttempt(
      state,
      action: PayloadAction<{
        attemptId: string;
        personaName: string;
        personaRole: string;
        openingMessage: string;
      }>,
    ) {
      state.attemptId = action.payload.attemptId;
      state.personaName = action.payload.personaName;
      state.personaRole = action.payload.personaRole;
      state.openingMessage = action.payload.openingMessage;
    },
    clearCoaching(state) {
      state.attemptId = null;
      state.personaName = null;
      state.personaRole = null;
      state.openingMessage = null;
    },
  },
});

export const { setCoachingAttempt, clearCoaching } = coachingSlice.actions;
export default coachingSlice.reducer;
