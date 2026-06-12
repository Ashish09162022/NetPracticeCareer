import { baseApi } from './baseApi';

export type HomeStage =
  | 'gate_incomplete'
  | 'assessment_pending'
  | 'in_paid_path'
  | 'ready_pending_profile'
  | 'pool'
  | 'matched'
  | 'interview_scheduled'
  | 'confirmed';

export type HomeRoute =
  | 'profile_gate'
  | 'assessment_intro'
  | 'assessment_current'
  | 'build_submission'
  | 'grading_in_progress'
  | 'paywall'
  | 'buildpath'
  | 'profile_section3'
  | 'status_tracker'
  | 'companies';

export interface HomeData {
  stage: HomeStage;
  next_action: { label: string; route: HomeRoute };
  is_available: boolean;
  section3_complete: boolean;
  completeness_pct: number;
  path_state: {
    current: 'assessment' | 'paid_path' | 'placement';
    passed: boolean;
    in_paid_path: boolean;
  };
}

export const homeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHome: build.query<HomeData, void>({
      query: () => '/home',
      providesTags: ['Home'],
    }),
  }),
});

export const { useGetHomeQuery } = homeApi;
