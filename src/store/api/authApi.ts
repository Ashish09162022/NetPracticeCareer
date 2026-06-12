import { baseApi } from './baseApi';

export interface RequestOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
  is_new: boolean;
  profile_gate_complete: boolean;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    requestOtp: build.mutation<void, RequestOtpRequest>({
      query: (body) => ({ url: '/auth/otp/request', method: 'POST', body }),
    }),
    verifyOtp: build.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({ url: '/auth/otp/verify', method: 'POST', body }),
    }),
  }),
});

export const { useRequestOtpMutation, useVerifyOtpMutation } = authApi;
