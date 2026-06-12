import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppDispatch } from '@/hooks/storeHooks';
import { setAttempt } from '@/store/slices/assessmentSlice/assessmentSlice';
import { useStartAssessmentMutation } from '@/store/api/assessmentApi';
import AssessmentIntroPageJSX from './assessmentIntroPageComponents/assessmentIntroPageJSX/AssessmentIntroPageJSX';
import './assessmentIntroPage.css';

const AssessmentIntroPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [startAssessment, { isLoading }] = useStartAssessmentMutation();

  const handleCTAClick = useCallback(async () => {
    try {
      const result = await startAssessment({}).unwrap();
      dispatch(setAttempt({
        attemptId: result.attempt_id,
        brief: result.brief,
        turnSeconds: result.turn_seconds,
        isReassessment: false,
      }));
      navigate(PathFor.clientConversationPage);
    } catch (err: unknown) {
      const code = (err as { data?: { error?: { code?: string } } })?.data?.error?.code;
      if (code === 'attempt_in_progress') {
        navigate(PathFor.clientConversationPage);
      }
    }
  }, [startAssessment, dispatch, navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <AssessmentIntroPageJSX
      onCTAClick={handleCTAClick}
      onBack={handleBack}
      isLoading={isLoading}
    />
  );
};

export default AssessmentIntroPage;
