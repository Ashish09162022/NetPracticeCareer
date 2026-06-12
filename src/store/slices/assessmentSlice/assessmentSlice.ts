import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AssessmentBrief {
  persona_name: string;
  persona_role: string;
  opening_message: string;
  deadline_hours?: number;
}

interface AssessmentState {
  attemptId: string | null;
  brief: AssessmentBrief | null;
  turnSeconds: number;
  buildClockStart: string | null;
  deadlineSoft: string | null;
  deadlineHard: string | null;
  submissionId: string | null;
  isReassessment: boolean;
}

const initialState: AssessmentState = {
  attemptId: null,
  brief: null,
  turnSeconds: 90,
  buildClockStart: null,
  deadlineSoft: null,
  deadlineHard: null,
  submissionId: null,
  isReassessment: false,
};

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    setAttempt(
      state,
      action: PayloadAction<{
        attemptId: string;
        brief: AssessmentBrief;
        turnSeconds: number;
        isReassessment: boolean;
      }>,
    ) {
      state.attemptId = action.payload.attemptId;
      state.brief = action.payload.brief;
      state.turnSeconds = action.payload.turnSeconds;
      state.isReassessment = action.payload.isReassessment;
    },
    setBuildClocks(
      state,
      action: PayloadAction<{
        buildClockStart: string;
        deadlineSoft: string;
        deadlineHard: string;
      }>,
    ) {
      state.buildClockStart = action.payload.buildClockStart;
      state.deadlineSoft = action.payload.deadlineSoft;
      state.deadlineHard = action.payload.deadlineHard;
    },
    setSubmissionId(state, action: PayloadAction<string>) {
      state.submissionId = action.payload;
    },
    clearAssessment(state) {
      state.attemptId = null;
      state.brief = null;
      state.turnSeconds = 90;
      state.buildClockStart = null;
      state.deadlineSoft = null;
      state.deadlineHard = null;
      state.submissionId = null;
      state.isReassessment = false;
    },
  },
});

export const { setAttempt, setBuildClocks, setSubmissionId, clearAssessment } = assessmentSlice.actions;
export default assessmentSlice.reducer;
