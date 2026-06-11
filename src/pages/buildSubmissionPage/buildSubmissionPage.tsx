import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BuildSubmissionPageJSX from './buildSubmissionPageComponents/buildSubmissionPageJSX/BuildSubmissionPageJSX';
import './buildSubmissionPage.css';

interface BuildSubmissionPageProps {}

const BuildSubmissionPage: FC<BuildSubmissionPageProps> = () => {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSubmit = useCallback((_repo: string, _live: string, _notes: string) => {
    // dispatch to store when wired up
  }, []);

  return <BuildSubmissionPageJSX onBack={handleBack} onSubmit={handleSubmit} />;
};

export default BuildSubmissionPage;
