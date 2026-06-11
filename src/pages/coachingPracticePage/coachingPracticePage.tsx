import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CoachingPracticePageJSX from './coachingPracticePageComponents/coachingPracticePageJSX/CoachingPracticePageJSX';
import './coachingPracticePage.css';

const CoachingPracticePage: FC = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return <CoachingPracticePageJSX onBack={handleBack} />;
};

export default CoachingPracticePage;
