import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import ReAssessmentIntroPageJSX from './reAssessmentIntroPageComponents/reAssessmentIntroPageJSX/ReAssessmentIntroPageJSX';
import './reAssessmentIntroPage.css';

interface ReAssessmentIntroPageProps {}

const ReAssessmentIntroPage: FC<ReAssessmentIntroPageProps> = () => {
  const navigate = useNavigate();

  const handleCTAClick = useCallback(() => {
    navigate(PathFor.clientConversationPage);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <ReAssessmentIntroPageJSX
      onCTAClick={handleCTAClick}
      onBack={handleBack}
    />
  );
};

export default ReAssessmentIntroPage;
