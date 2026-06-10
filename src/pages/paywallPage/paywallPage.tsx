import { type FC, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import PaywallPageJSX from './paywallPageComponents/paywallPageJSX/PaywallPageJSX';
import './paywallPage.css';

const CONFIG = { passMark: 90, scholarshipFloor: 70, scholarshipPct: 50, pathPrice: 5000 };

interface PaywallPageProps {}

const PaywallPage: FC<PaywallPageProps> = () => {
  const navigate = useNavigate();

  const score = useMemo(() => {
    const raw = localStorage.getItem('np-gap-score');
    const n = Number(raw);
    return raw && !isNaN(n) ? n : 78;
  }, []);

  const hasScholarship = score >= CONFIG.scholarshipFloor && score < CONFIG.passMark;
  const price = hasScholarship
    ? Math.round(CONFIG.pathPrice * (1 - CONFIG.scholarshipPct / 100))
    : CONFIG.pathPrice;

  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [successShown, setSuccessShown] = useState(false);

  const handleUnlock = useCallback(() => setRazorpayOpen(true), []);
  const handleCloseRazorpay = useCallback(() => setRazorpayOpen(false), []);
  const handlePay = useCallback(() => {
    setRazorpayOpen(false);
    setSuccessShown(true);
  }, []);
  const handleSuccessCTA = useCallback(
    () => navigate(PathFor.guidedBuildPathPage),
    [navigate],
  );
  const handleBack = useCallback(
    () => navigate(PathFor.gapReportPage),
    [navigate],
  );

  return (
    <PaywallPageJSX
      score={score}
      hasScholarship={hasScholarship}
      price={price}
      originalPrice={CONFIG.pathPrice}
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
