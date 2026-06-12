import { baseApi } from './baseApi';

export interface CreateOrderRequest {
  grade_id: string;
}

export interface CreateOrderResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  status: 'paid';
  paid_path_unlocked: boolean;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({ url: '/payment/order', method: 'POST', body }),
    }),
    verifyPayment: build.mutation<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: (body) => ({ url: '/payment/verify', method: 'POST', body }),
      invalidatesTags: ['Home'],
    }),
  }),
});

export const { useCreateOrderMutation, useVerifyPaymentMutation } = paymentApi;
