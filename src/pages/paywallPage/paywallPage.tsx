import { type FC, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppSelector } from '@/hooks/storeHooks';
import { useGetGradeQuery } from '@/store/api/gradeApi';
import { useCreateOrderMutation, useVerifyPaymentMutation } from '@/store/api/paymentApi';
import { useLogEventMutation } from '@/store/api/eventsApi';
import PaywallPageJSX from './paywallPageComponents/paywallPageJSX/PaywallPageJSX';
import './paywallPage.css';

const PaywallPage: FC = () => {
  const navigate = useNavigate();
  const submissionId = useAppSelector((s) => s.assessment.submissionId);

  const { data: gradeResponse } = useGetGradeQuery(submissionId ?? '', { skip: !submissionId });
  const grade = gradeResponse && !('status' in gradeResponse) ? gradeResponse : null;

  const [createOrder] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [logEvent] = useLogEventMutation();

  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [successShown, setSuccessShown] = useState(false);

  useEffect(() => {
    logEvent({ type: 'paywall_shown', payload: {} });
  }, [logEvent]);

  const price = grade?.price ?? 2500;
  const originalPrice = grade?.full_price ?? 5000;
  const hasScholarship = grade?.outcome === 'scholarship';
  const score = grade?.score ?? 78;
  const gradeId = grade?.grade_id ?? '';

  const handleUnlock = useCallback(async () => {
    if (!gradeId) return;
    try {
      const order = await createOrder({ grade_id: gradeId }).unwrap();
      // In production: open Razorpay checkout with order.razorpay_order_id
      // For now we open the mock modal
      console.log('Razorpay order created:', order);
      setRazorpayOpen(true);
    } catch {
      setRazorpayOpen(true); // open anyway for demo
    }
  }, [gradeId, createOrder]);

  const handleCloseRazorpay = useCallback(() => setRazorpayOpen(false), []);

  const handlePay = useCallback(async () => {
    // In production: called from Razorpay checkout success callback with real IDs
    // Stubbed here until Razorpay checkout is integrated
    setRazorpayOpen(false);
    setSuccessShown(true);
  }, []);

  const handleSuccessCTA = useCallback(() => navigate(PathFor.guidedBuildPathPage), [navigate]);
  const handleBack = useCallback(() => navigate(PathFor.gapReportPage), [navigate]);

  return (
    <PaywallPageJSX
      score={score}
      hasScholarship={hasScholarship}
      price={price}
      originalPrice={originalPrice}
      razorpayOpen={razorpayOpen}
      successShown={successShown}
      onUnlock={handleUnlock}
      onCloseRazorpay={handleCloseRazorpay}
      onPay={handlePay}
      onSuccessCTA={handleSuccessCTA}
      onBack={handleBack}
    />
  );
};

export default PaywallPage;
