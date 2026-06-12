import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppSelector } from '@/hooks/storeHooks';
import { useGetGradeQuery } from '@/store/api/gradeApi';
import GradingPageJSX from './gradingPageComponents/gradingPageJSX/GradingPageJSX';
import './gradingPage.css';

const GradingPage: FC = () => {
  const navigate = useNavigate();
  const submissionId = useAppSelector((s) => s.assessment.submissionId);

  const { data } = useGetGradeQuery(submissionId ?? '', {
    skip: !submissionId,
    pollingInterval: 2500,
  });

  useEffect(() => {
    if (data && !('status' in data)) {
      navigate(PathFor.gapReportPage);
    }
  }, [data, navigate]);

  return <GradingPageJSX onBack={() => navigate(-1)} />;
};

export default GradingPage;
