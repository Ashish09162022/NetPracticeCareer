import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppDispatch } from '@/hooks/storeHooks';
import { setAttempt } from '@/store/slices/assessmentSlice/assessmentSlice';
import { useStartAssessmentMutation } from '@/store/api/assessmentApi';
import { useGetBuildPathQuery, useUpdateModuleStatusMutation } from '@/store/api/buildPathApi';
import GuidedBuildPathPageJSX from './guidedBuildPathPageComponents/guidedBuildPathPageJSX/GuidedBuildPathPageJSX';
import './guidedBuildPathPage.css';

const GuidedBuildPathPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: buildPath, isLoading } = useGetBuildPathQuery();
  const [updateModuleStatus] = useUpdateModuleStatusMutation();
  const [startAssessment] = useStartAssessmentMutation();

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handlePractice = useCallback(() => navigate(PathFor.coachingPracticePage), [navigate]);

  const handleModuleDone = useCallback(async (moduleId: string) => {
    try {
      await updateModuleStatus({ module_id: moduleId, status: 'done' }).unwrap();
    } catch {
      // locked module or error -- JSX handles display
    }
  }, [updateModuleStatus]);

  const handleReassessment = useCallback(async () => {
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
      if (code === 'no_unseen_brief') {
        // Show a message -- handled via toast or inline in JSX
      } else if (code === 'attempt_in_progress') {
        navigate(PathFor.clientConversationPage);
      }
    }
  }, [startAssessment, dispatch, navigate]);

  return (
    <GuidedBuildPathPageJSX
      buildPath={buildPath ?? null}
      isLoading={isLoading}
      onBack={handleBack}
      onPractice={handlePractice}
      onModuleDone={handleModuleDone}
      onReassessment={handleReassessment}
    />
  );
};

export default GuidedBuildPathPage;
