import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppDispatch, useAppSelector } from '@/hooks/storeHooks';
import { setSubmissionId } from '@/store/slices/assessmentSlice/assessmentSlice';
import { useSubmitBuildMutation } from '@/store/api/assessmentApi';
import BuildSubmissionPageJSX from './buildSubmissionPageComponents/buildSubmissionPageJSX/BuildSubmissionPageJSX';
import './buildSubmissionPage.css';

const BuildSubmissionPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { attemptId, deadlineSoft, deadlineHard } = useAppSelector((s) => s.assessment);
  const [submitBuild, { isLoading }] = useSubmitBuildMutation();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSubmit = useCallback(async (repo: string, live: string, notes: string) => {
    if (!attemptId) return;
    try {
      const result = await submitBuild({
        attempt_id: attemptId,
        repo_url: repo,
        deploy_url: live,
        notes,
      }).unwrap();
      dispatch(setSubmissionId(result.submission_id));
      navigate(PathFor.gradingPage);
    } catch {
      // error handled by JSX submitted state
    }
  }, [attemptId, submitBuild, dispatch, navigate]);

  return (
    <BuildSubmissionPageJSX
      deadlineSoft={deadlineSoft}
      deadlineHard={deadlineHard}
      isSubmitting={isLoading}
      onBack={handleBack}
      onSubmit={handleSubmit}
    />
  );
};

export default BuildSubmissionPage;
