import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppDispatch } from '@/hooks/storeHooks';
import { setAttempt } from '@/store/slices/assessmentSlice/assessmentSlice';
import { useStartAssessmentMutation } from '@/store/api/assessmentApi';
import ReAssessmentIntroPageJSX from './reAssessmentIntroPageComponents/reAssessmentIntroPageJSX/ReAssessmentIntroPageJSX';
import './reAssessmentIntroPage.css';

const ReAssessmentIntroPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [startAssessment, { isLoading }] = useStartAssessmentMutation();

  const handleCTAClick = useCallback(async () => {
    try {
      const result = await startAssessment({ is_reassessment: true }).unwrap();
      dispatch(setAttempt({
        attemptId: result.attempt_id,
        brief: result.brief,
        turnSeconds: result.turn_seconds,
        isReassessment: true,
      }));
      navigate(PathFor.clientConversationPage);
    } catch (err: unknown) {
      const code = (err as { data?: { error?: { code?: string } } })?.data?.error?.code;
      if (code === 'attempt_in_progress') {
        navigate(PathFor.clientConversationPage);
      }
      // no_unseen_brief → JSX can show an error state (pass isError prop)
    }
  }, [startAssessment, dispatch, navigate]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <ReAssessmentIntroPageJSX
      onCTAClick={handleCTAClick}
      onBack={handleBack}
      isLoading={isLoading}
    />
  );
};

export default ReAssessmentIntroPage;
