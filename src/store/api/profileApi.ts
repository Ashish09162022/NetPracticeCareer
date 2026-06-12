import { baseApi } from './baseApi';

export interface ProfileData {
  name: string;
  email: string;
  college: string;
  graduation_year: number;
  stream: string;
  start_date: string;
  duration: string;
  current_city: string;
  internship_city: string;
  internship_field: string;
  ready_to_relocate: boolean;
  resume_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  project_links: string[];
  section3_complete: boolean;
  completeness_pct: number;
  is_available: boolean;
}

export interface Section1Request {
  name: string;
  email: string;
  college: string;
  graduation_year: number;
  stream: string;
}

export interface Section2Request {
  start_date: string;
  duration: string;
  current_city: string;
  ready_to_relocate: boolean;
}

export interface Section2Response {
  section2_complete: boolean;
  is_available: boolean;
  gate_complete: boolean;
}

export interface Section3Request {
  resume_url?: string;
  github_url?: string;
  linkedin_url?: string;
  project_links?: string[];
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<ProfileData, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    updateSection1: build.mutation<{ section1_complete: boolean }, Section1Request>({
      query: (body) => ({ url: '/profile/section1', method: 'PUT', body }),
      invalidatesTags: ['Profile', 'Home'],
    }),
    updateSection2: build.mutation<Section2Response, Section2Request>({
      query: (body) => ({ url: '/profile/section2', method: 'PUT', body }),
      invalidatesTags: ['Profile', 'Home'],
    }),
    uploadResume: build.mutation<{ resume_url: string }, FormData>({
      query: (body) => ({ url: '/profile/resume', method: 'POST', body }),
    }),
    updateSection3: build.mutation<{ section3_complete: boolean }, Section3Request>({
      query: (body) => ({ url: '/profile/section3', method: 'PUT', body }),
      invalidatesTags: ['Profile', 'Home'],
    }),
    setAvailability: build.mutation<{ is_available: boolean }, { is_available: boolean }>({
      query: (body) => ({ url: '/availability', method: 'PUT', body }),
      invalidatesTags: ['Home'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateSection1Mutation,
  useUpdateSection2Mutation,
  useUploadResumeMutation,
  useUpdateSection3Mutation,
  useSetAvailabilityMutation,
} = profileApi;
