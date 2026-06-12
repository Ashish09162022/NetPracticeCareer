import { baseApi } from './baseApi';

export interface BuildModule {
  id: string;
  order: number;
  title: string;
  description: string;
  est_minutes: number;
  type: 'read' | 'video_task' | 'project' | 'checklist';
  resource_url: string | null;
  status: 'not_started' | 'in_progress' | 'done';
  locked: boolean;
}

export interface BuildPathData {
  completeness_pct: number;
  steps_done: number;
  steps_total: number;
  modules: BuildModule[];
}

export interface UpdateModuleStatusRequest {
  module_id: string;
  status: 'done';
}

export const buildPathApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBuildPath: build.query<BuildPathData, void>({
      query: () => '/buildpath',
      providesTags: ['BuildPath'],
    }),
    updateModuleStatus: build.mutation<BuildModule, UpdateModuleStatusRequest>({
      query: ({ module_id, status }) => ({
        url: `/buildpath/${module_id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['BuildPath'],
    }),
  }),
});

export const { useGetBuildPathQuery, useUpdateModuleStatusMutation } = buildPathApi;
