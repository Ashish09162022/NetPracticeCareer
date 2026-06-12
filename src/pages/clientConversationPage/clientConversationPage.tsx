import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppDispatch, useAppSelector } from '@/hooks/storeHooks';
import { setBuildClocks } from '@/store/slices/assessmentSlice/assessmentSlice';
import { useSendMessageMutation, useFinishConversationMutation } from '@/store/api/assessmentApi';
import ClientConversationPageJSX from './clientConversationPageComponents/clientConversationPageJSX/ClientConversationPageJSX';
import './clientConversationPage.css';

const ClientConversationPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { attemptId, brief, turnSeconds } = useAppSelector((s) => s.assessment);

  const [sendMessage] = useSendMessageMutation();
  const [finishConversation] = useFinishConversationMutation();

  const handleSend = useCallback(
    async (text: string, responseSecs: number, pasteAttempts: number): Promise<string> => {
      if (!attemptId) return '';
      try {
        const result = await sendMessage({
          attempt_id: attemptId,
          text,
          response_seconds: responseSecs,
          paste_attempts: pasteAttempts,
        }).unwrap();
        return result.reply;
      } catch (err: unknown) {
        const code = (err as { data?: { error?: { code?: string; build_clock_start?: string; deadline_soft?: string; deadline_hard?: string } } })?.data?.error;
        if (code?.code === 'conversation_ended' && code.build_clock_start) {
          dispatch(setBuildClocks({
            buildClockStart: code.build_clock_start,
            deadlineSoft: code.deadline_soft ?? '',
            deadlineHard: code.deadline_hard ?? '',
          }));
        }
        throw err;
      }
    },
    [attemptId, sendMessage, dispatch],
  );

  const handleFinish = useCallback(async () => {
    if (!attemptId) {
      navigate(PathFor.buildSubmissionPage);
      return;
    }
    try {
      const result = await finishConversation(attemptId).unwrap();
      dispatch(setBuildClocks({
        buildClockStart: result.build_clock_start,
        deadlineSoft: result.deadline_soft,
        deadlineHard: result.deadline_hard,
      }));
    } finally {
      navigate(PathFor.buildSubmissionPage);
    }
  }, [attemptId, finishConversation, dispatch, navigate]);

  const handleConversationEnded = useCallback(
    (buildClockStart: string, deadlineSoft: string, deadlineHard: string) => {
      dispatch(setBuildClocks({ buildClockStart, deadlineSoft, deadlineHard }));
      navigate(PathFor.buildSubmissionPage);
    },
    [dispatch, navigate],
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <ClientConversationPageJSX
      openingMessage={brief?.openingMessage ?? null}
      personaName={brief?.persona_name ?? 'Client'}
      personaRole={brief?.persona_role ?? ''}
      turnSeconds={turnSeconds}
      onBack={handleBack}
      onSend={handleSend}
      onGoToBuild={handleFinish}
      onConversationEnded={handleConversationEnded}
    />
  );
};

export default ClientConversationPage;
