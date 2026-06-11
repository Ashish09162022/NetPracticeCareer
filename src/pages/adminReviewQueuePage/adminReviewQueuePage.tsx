import { type FC } from 'react';
import AdminReviewQueuePageJSX from './adminReviewQueuePageComponents/adminReviewQueuePageJSX/AdminReviewQueuePageJSX';
import './adminReviewQueuePage.css';

interface AdminReviewQueuePageProps {}

const AdminReviewQueuePage: FC<AdminReviewQueuePageProps> = () => {
  return <AdminReviewQueuePageJSX />;
};

export default AdminReviewQueuePage;
