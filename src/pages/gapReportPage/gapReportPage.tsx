import { type FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import GapReportPageJSX from './gapReportPageComponents/gapReportPageJSX/GapReportPageJSX';
import { getTier } from './gapReportPageComponents/gapReportPageData';
import './gapReportPage.css';

const SCORE_KEY = 'np-gap-score';

const GapReportPage: FC = () => {
  const navigate = useNavigate();

  const score = useMemo(() => {
    const raw = localStorage.getItem(SCORE_KEY);
    const n = Number(raw);
    return raw && !isNaN(n) ? n : 78;
  }, []);

  const tier = getTier(score);

  return (
    <GapReportPageJSX
      score={score}
      tier={tier}
      onJoinPool={() => navigate(PathFor.profileIntakePage)}
      onStartPath={() => navigate(PathFor.paywallPage)}
      onBack={() => navigate(-1)}
    />
  );
};

export default GapReportPage;
