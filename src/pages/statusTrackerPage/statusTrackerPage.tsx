import { type FC } from 'react';
import { useGetPlacementStatusQuery } from '@/store/api/placementApi';
import StatusTrackerPageJSX from './statusTrackerPageComponents/statusTrackerPageJSX/StatusTrackerPageJSX';
import './statusTrackerPage.css';

const StatusTrackerPage: FC = () => {
  const { data, isLoading } = useGetPlacementStatusQuery();

  return (
    <StatusTrackerPageJSX
      stage={data?.stage ?? null}
      interviewAt={data?.interview_at ?? null}
      interviewWith={data?.interview_with ?? null}
      history={data?.history ?? []}
      isLoading={isLoading}
    />
  );
};

export default StatusTrackerPage;
