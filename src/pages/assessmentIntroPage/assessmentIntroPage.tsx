import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import AssessmentIntroPageJSX from './assessmentIntroPageComponents/assessmentIntroPageJSX/AssessmentIntroPageJSX';
import './assessmentIntroPage.css';

interface AssessmentIntroPageProps {}

const AssessmentIntroPage: FC<AssessmentIntroPageProps> = () => {
  const navigate = useNavigate();

  const handleCTAClick = useCallback(() => {
    navigate(PathFor.clientConversationPage);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <AssessmentIntroPageJSX
      onCTAClick={handleCTAClick}
      onBack={handleBack}
    />
  );
};

export default AssessmentIntroPage;
