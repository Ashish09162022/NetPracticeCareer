import { baseApi } from './baseApi';
import type { GradeOutcome, DeliveryZone } from './gradeApi';

export interface AdminQueueItem {
  grade_id: string;
  student_id: string;
  student_name: string;
  brief_title: string;
  is_reassessment: boolean;
  score: number;
  outcome: GradeOutcome;
  capped_by_late: boolean;
  delivery_zone: DeliveryZone;
  hours_late: number;
  on_time: boolean;
  deploy_check: 'ok' | 'failed' | 'unreachable' | 'skipped';
  needs_review: boolean;
  is_available: boolean;
  submitted_at: string;
  decided_at: string | null;
  summary: string;
}

export interface AdminQueueResponse {
  queue: AdminQueueItem[];
}

export interface ConfirmGradeRequest {
  id: string;
  override: { outcome: GradeOutcome; note: string } | null;
}

export interface CreateCompanyInterestRequest {
  student_id: string;
  company_name: string;
  role: string;
  mode: 'onsite' | 'remote' | 'hybrid';
  stipend?: string;
  duration?: string;
  description?: string;
  pitch?: string;
  area?: string;
  lat?: number;
  lng?: number;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReviewQueue: build.query<AdminQueueResponse, { status?: 'all' } | void>({
      query: (params) => ({
        url: '/admin/review-queue',
        params: params ?? {},
      }),
      providesTags: ['AdminQueue'],
    }),
    confirmGrade: build.mutation<void, ConfirmGradeRequest>({
      query: ({ id, override }) => ({
        url: `/admin/grade/${id}/confirm`,
        method: 'POST',
        body: { override },
      }),
      invalidatesTags: ['AdminQueue'],
    }),
    createCompanyInterest: build.mutation<void, CreateCompanyInterestRequest>({
      query: (body) => ({
        url: '/admin/company-interest',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminQueue'],
    }),
  }),
});

export const {
  useGetReviewQueueQuery,
  useConfirmGradeMutation,
  useCreateCompanyInterestMutation,
} = adminApi;
