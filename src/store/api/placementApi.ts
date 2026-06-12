import { baseApi } from './baseApi';

export type PlacementStage = 'pool' | 'matched' | 'interview_scheduled' | 'confirmed';

export interface PlacementStatusData {
  stage: PlacementStage;
  interview_at: string | null;
  interview_with: {
    id: string;
    company_name: string;
    role: string;
    mode: string;
    stipend: string;
    duration: string;
    area: string;
  } | null;
  history: { stage: PlacementStage; at: string }[];
}

export interface CompanyInterest {
  id: string;
  company_name: string;
  role: string;
  mode: string;
  stipend: string;
  duration: string;
  description: string;
  pitch: string;
  area: string;
  picked: string;
  picked_at: string;
  lat: number | null;
  lng: number | null;
}

export interface CompaniesResponse {
  interests: CompanyInterest[];
  more_count: number;
}

export const placementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPlacementStatus: build.query<PlacementStatusData, void>({
      query: () => '/status',
      providesTags: ['Placement'],
    }),
    getCompanies: build.query<CompaniesResponse, void>({
      query: () => '/companies',
      providesTags: ['Companies'],
    }),
    acceptCompany: build.mutation<{ state: string; interview_at: string | null }, string>({
      query: (id) => ({ url: `/companies/${id}/accept`, method: 'POST' }),
      invalidatesTags: ['Companies', 'Placement'],
    }),
    passCompany: build.mutation<{ state: string }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/companies/${id}/pass`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Companies'],
    }),
  }),
});

export const {
  useGetPlacementStatusQuery,
  useGetCompaniesQuery,
  useAcceptCompanyMutation,
  usePassCompanyMutation,
} = placementApi;
