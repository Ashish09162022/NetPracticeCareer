import { type FC } from 'react';
import StatusTrackerPageJSX from './statusTrackerPageComponents/statusTrackerPageJSX/StatusTrackerPageJSX';
import './statusTrackerPage.css';

interface StatusTrackerPageProps {}

const StatusTrackerPage: FC<StatusTrackerPageProps> = () => {
  return <StatusTrackerPageJSX />;
};

export default StatusTrackerPage;
