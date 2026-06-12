import { type FC, useCallback } from 'react';
import {
  useGetReviewQueueQuery,
  useConfirmGradeMutation,
  useCreateCompanyInterestMutation,
} from '@/store/api/adminApi';
import type { AdminQueueItem } from '@/store/api/adminApi';
import type { GradeOutcome } from '@/store/api/gradeApi';
import type { Submission } from './adminReviewQueuePageComponents/adminReviewQueuePageData';
import AdminReviewQueuePageJSX from './adminReviewQueuePageComponents/adminReviewQueuePageJSX/AdminReviewQueuePageJSX';
import './adminReviewQueuePage.css';

const mapToSubmission = (item: AdminQueueItem, idx: number): Submission => {
  const initials = item.student_name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const reco = item.outcome === 'ready' || item.outcome === 'scholarship'
    ? 'pass' as const
    : item.score >= 60 ? 'border' as const : 'fail' as const;

  const recoLabel = reco === 'pass' ? 'Ready' : reco === 'border' ? 'Almost there' : 'Not ready';

  return {
    id: idx + 1,
    grade_id: item.grade_id,
    name: item.student_name,
    init: initials,
    avail: item.is_available,
    brief: item.brief_title,
    reco,
    recoLabel,
    score: item.score,
    time: new Date(item.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    delivery: item.on_time ? 'ontime' : 'late',
    deliveryLabel: item.on_time ? 'On time' : `${item.hours_late}h late`,
    summary: item.summary,
    build: {
      score: `${item.score}/100`,
      cls: item.score >= 80 ? 'good' : item.score >= 60 ? 'warn' : 'bad',
      reqs: [],
    },
    gather: { score: '—', cls: 'warn', notes: [] },
    comm: { score: '—', cls: 'warn', notes: [] },
  };
};

const AdminReviewQueuePage: FC = () => {
  const { data: queueData } = useGetReviewQueueQuery();
  const [confirmGrade] = useConfirmGradeMutation();
  const [_createCompanyInterest] = useCreateCompanyInterestMutation();

  const submissions: Submission[] | undefined = queueData?.queue.map(mapToSubmission);

  const handleConfirmApi = useCallback(
    async (gradeId: string, override: { outcome: string; note: string } | null) => {
      try {
        await confirmGrade({
          id: gradeId,
          override: override ? { outcome: override.outcome as GradeOutcome, note: override.note } : null,
        }).unwrap();
      } catch {
        // JSX shows toast; API error is silently absorbed here
      }
    },
    [confirmGrade],
  );

  return (
    <AdminReviewQueuePageJSX
      submissions={submissions}
      onConfirmApi={handleConfirmApi}
    />
  );
};

export default AdminReviewQueuePage;
