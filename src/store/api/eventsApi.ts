import { baseApi } from './baseApi';

export type EventType = 'paywall_shown' | 'company_interest_shown';

export interface LogEventRequest {
  type: EventType;
  payload: Record<string, unknown>;
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    logEvent: build.mutation<void, LogEventRequest>({
      query: (body) => ({ url: '/events', method: 'POST', body }),
    }),
  }),
});

export const { useLogEventMutation } = eventsApi;
