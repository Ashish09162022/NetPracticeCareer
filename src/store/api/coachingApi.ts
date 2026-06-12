import { baseApi } from './baseApi';

export interface CoachingFeedback {
  good: string;
  miss: string;
  tip: string;
}

export interface StartCoachingResponse {
  attempt_id: string;
  persona_name: string;
  persona_role: string;
  opening_message: string;
}

export interface SendCoachingMessageRequest {
  attempt_id: string;
  text: string;
}

export interface SendCoachingMessageResponse {
  reply: string;
  coaching_feedback: CoachingFeedback | null;
}

export const coachingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    startCoaching: build.mutation<StartCoachingResponse, void>({
      query: () => ({ url: '/coaching/start', method: 'POST' }),
    }),
    sendCoachingMessage: build.mutation<SendCoachingMessageResponse, SendCoachingMessageRequest>({
      query: ({ attempt_id, text }) => ({
        url: `/coaching/${attempt_id}/message`,
        method: 'POST',
        body: { text },
      }),
    }),
  }),
});

export const { useStartCoachingMutation, useSendCoachingMessageMutation } = coachingApi;
