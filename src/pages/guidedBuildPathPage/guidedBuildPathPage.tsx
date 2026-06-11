import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import GuidedBuildPathPageJSX from './guidedBuildPathPageComponents/guidedBuildPathPageJSX/GuidedBuildPathPageJSX';
import './guidedBuildPathPage.css';

const GuidedBuildPathPage: FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handlePractice = useCallback(() => {
    navigate(PathFor.coachingPracticePage);
  }, [navigate]);

  const handleReassessment = useCallback(() => {
    navigate(PathFor.reAssessmentIntroPage);
  }, [navigate]);

  return (
    <GuidedBuildPathPageJSX
      onBack={handleBack}
      onPractice={handlePractice}
      onReassessment={handleReassessment}
    />
  );
};

export default GuidedBuildPathPage;
