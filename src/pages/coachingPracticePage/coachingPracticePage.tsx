import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/storeHooks';
import { setCoachingAttempt } from '@/store/slices/coachingSlice/coachingSlice';
import { useStartCoachingMutation, useSendCoachingMessageMutation } from '@/store/api/coachingApi';
import type { CoachingFeedback } from '@/store/api/coachingApi';
import CoachingPracticePageJSX from './coachingPracticePageComponents/coachingPracticePageJSX/CoachingPracticePageJSX';
import './coachingPracticePage.css';

const CoachingPracticePage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { attemptId, personaName, personaRole, openingMessage } = useAppSelector((s) => s.coaching);

  const [startCoaching, { isLoading: isStarting }] = useStartCoachingMutation();
  const [sendCoachingMessage] = useSendCoachingMessageMutation();

  const handleStart = useCallback(async () => {
    try {
      const result = await startCoaching().unwrap();
      dispatch(setCoachingAttempt({
        attemptId: result.attempt_id,
        personaName: result.persona_name,
        personaRole: result.persona_role,
        openingMessage: result.opening_message,
      }));
    } catch {
      // error handled
    }
  }, [startCoaching, dispatch]);

  const handleSend = useCallback(
    async (text: string): Promise<{ reply: string; coaching_feedback: CoachingFeedback | null }> => {
      if (!attemptId) return { reply: '', coaching_feedback: null };
      return sendCoachingMessage({ attempt_id: attemptId, text }).unwrap();
    },
    [attemptId, sendCoachingMessage],
  );

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <CoachingPracticePageJSX
      attemptId={attemptId}
      personaName={personaName}
      personaRole={personaRole}
      openingMessage={openingMessage}
      isStarting={isStarting}
      onBack={handleBack}
      onStart={handleStart}
      onSend={handleSend}
    />
  );
};

export default CoachingPracticePage;
