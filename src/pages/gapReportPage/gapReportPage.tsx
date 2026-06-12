import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppSelector } from '@/hooks/storeHooks';
import { useGetGradeQuery } from '@/store/api/gradeApi';
import GapReportPageJSX from './gapReportPageComponents/gapReportPageJSX/GapReportPageJSX';
import { getTier } from './gapReportPageComponents/gapReportPageData';
import './gapReportPage.css';

const GapReportPage: FC = () => {
  const navigate = useNavigate();
  const submissionId = useAppSelector((s) => s.assessment.submissionId);

  const { data } = useGetGradeQuery(submissionId ?? '', {
    skip: !submissionId,
  });

  // Fall back to a sensible default while loading or if no data
  const isGrading = !data || 'status' in data;
  const grade = isGrading ? null : data;

  const score = grade?.score ?? 78;
  const scenario = grade?.capped_by_late ? 'capped_by_late' : null;
  const tier = getTier(score, scenario);

  const handleJoinPool = () => {
    if (grade && !grade.section3_complete_missing) {
      navigate(PathFor.homePage);
    } else {
      navigate(PathFor.profileIntakePage);
    }
  };

  const handleStartPath = () => navigate(PathFor.paywallPage);

  return (
    <GapReportPageJSX
      score={score}
      tier={tier}
      onJoinPool={handleJoinPool}
      onStartPath={handleStartPath}
      onBack={() => navigate(-1)}
    />
  );
};

export default GapReportPage;
