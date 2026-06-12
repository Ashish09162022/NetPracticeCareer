import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useSetAvailabilityMutation } from '@/store/api/profileApi';
import MarkAvailablePageJSX from './markAvailablePageComponents/markAvailablePageJSX/MarkAvailablePageJSX';
import './markAvailablePage.css';

const MarkAvailablePage: FC = () => {
  const navigate = useNavigate();
  const [setAvailability, { isLoading }] = useSetAvailabilityMutation();

  const handleConfirm = useCallback(async () => {
    try {
      await setAvailability({ is_available: true }).unwrap();
    } catch {
      // proceed even on failure -- server will handle state consistency
    }
    navigate(PathFor.assessmentIntroPage);
  }, [setAvailability, navigate]);

  const handleNotNow = useCallback(() => navigate(PathFor.homePage), [navigate]);

  return (
    <MarkAvailablePageJSX
      onConfirm={handleConfirm}
      onNotNow={handleNotNow}
      isSaving={isLoading}
    />
  );
};

export default MarkAvailablePage;
