import { baseApi } from './baseApi';

export type GradeOutcome = 'ready' | 'scholarship' | 'full_price';
export type DeliveryZone = 'on_time' | 'grace' | 'refused';
export type RequirementStatus = 'met' | 'partial' | 'missing' | 'unverifiable';
export type DimensionScore = 'Excellent' | 'Good' | 'Needs work' | 'Weak';

export interface GradeRequirementItem {
  requirement_id: string;
  status: RequirementStatus;
  reason: string;
}

export interface GradeDimension {
  score: DimensionScore;
  notes: string[];
}

export interface GradeData {
  grade_id: string;
  submission_id: string;
  brief_title: string;
  persona_name: string;
  persona_role: string;
  score: number;
  outcome: GradeOutcome;
  verdict: string;
  capped_by_late: boolean;
  delivery_zone: DeliveryZone;
  hours_late: number;
  on_time: boolean;
  requirements_met: number;
  requirements_partial: number;
  requirements_missing: number;
  items: GradeRequirementItem[];
  biggest_gap: { requirement_id: string; reason: string };
  extraction: GradeDimension;
  communication: GradeDimension;
  scholarship_pct: number;
  price: number;
  full_price: number;
  summary: string;
  section3_complete_missing?: boolean;
}

export interface GradeStatusResponse {
  status: 'grading';
}

export const gradeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getGrade: build.query<GradeData | GradeStatusResponse, string>({
      query: (submission_id) => `/grade/${submission_id}`,
      providesTags: ['Grade'],
    }),
  }),
});

export const { useGetGradeQuery } = gradeApi;
