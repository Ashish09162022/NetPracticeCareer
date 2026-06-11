import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GradingPageJSX from './gradingPageComponents/gradingPageJSX/GradingPageJSX';
import './gradingPage.css';

interface GradingPageProps {}

const GradingPage: FC<GradingPageProps> = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return <GradingPageJSX onBack={handleBack} />;
};

export default GradingPage;
