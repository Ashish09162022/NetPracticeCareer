import { baseApi } from './baseApi';
import type { AssessmentBrief } from '../slices/assessmentSlice/assessmentSlice';

export interface StartAssessmentRequest {
  is_reassessment?: boolean;
}

export interface StartAssessmentResponse {
  attempt_id: string;
  brief: AssessmentBrief;
  turn_seconds: number;
}

export interface SendMessageRequest {
  attempt_id: string;
  text: string;
  response_seconds: number | null;
  paste_attempts: number | null;
}

export interface SendMessageResponse {
  reply: string;
}

export interface FinishConversationResponse {
  build_clock_start: string;
  deadline_soft: string;
  deadline_hard: string;
}

export interface SubmitBuildRequest {
  attempt_id: string;
  repo_url: string;
  deploy_url: string;
  notes: string;
}

export interface SubmitBuildResponse {
  submission_id: string;
  status: 'grading';
}

export const assessmentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    startAssessment: build.mutation<StartAssessmentResponse, StartAssessmentRequest>({
      query: (body) => ({ url: '/assessment/start', method: 'POST', body }),
    }),
    getCurrentAssessment: build.query<StartAssessmentResponse, void>({
      query: () => '/assessment/current',
      providesTags: ['Assessment'],
    }),
    sendMessage: build.mutation<SendMessageResponse, SendMessageRequest>({
      query: ({ attempt_id, ...body }) => ({
        url: `/assessment/${attempt_id}/message`,
        method: 'POST',
        body,
      }),
    }),
    finishConversation: build.mutation<FinishConversationResponse, string>({
      query: (attempt_id) => ({
        url: `/assessment/${attempt_id}/finish`,
        method: 'POST',
      }),
    }),
    submitBuild: build.mutation<SubmitBuildResponse, SubmitBuildRequest>({
      query: ({ attempt_id, ...body }) => ({
        url: `/assessment/${attempt_id}/submit`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useStartAssessmentMutation,
  useGetCurrentAssessmentQuery,
  useSendMessageMutation,
  useFinishConversationMutation,
  useSubmitBuildMutation,
} = assessmentApi;
