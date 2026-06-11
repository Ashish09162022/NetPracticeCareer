import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import HomePage from '@/pages/homePage/homePage';
import ProfileIntakePage from '@/pages/profileIntakePage/profileIntakePage';
import AssessmentIntroPage from '@/pages/assessmentIntroPage/assessmentIntroPage';
import CompaniesWantYouPage from '@/pages/companiesWantYouPage/companiesWantYouPage';
import StatusTrackerPage from '@/pages/statusTrackerPage/statusTrackerPage';
import PaywallPage from '@/pages/paywallPage/paywallPage';
import GapReportPage from '@/pages/gapReportPage/gapReportPage';
import MarkAvailablePage from '@/pages/markAvailablePage/markAvailablePage';
import AdminReviewQueuePage from '@/pages/adminReviewQueuePage/adminReviewQueuePage';
import CoachingPracticePage from '@/pages/coachingPracticePage/coachingPracticePage';
import GuidedBuildPathPage from '@/pages/guidedBuildPathPage/guidedBuildPathPage';
import ReAssessmentIntroPage from '@/pages/reAssessmentIntroPage/reAssessmentIntroPage';
import LoginPage from '@/pages/loginPage/loginPage';
import GradingPage from '@/pages/gradingPage/gradingPage';
import BuildSubmissionPage from '@/pages/buildSubmissionPage/buildSubmissionPage';
import ClientConversationPage from '@/pages/clientConversationPage/clientConversationPage';

const router = createBrowserRouter([
  {
    path: PathFor.homePage,
    element: <HomePage />,
  },
  {
    path: PathFor.profileIntakePage,
    element: <ProfileIntakePage />,
  },
  {
    path: PathFor.assessmentIntroPage,
    element: <AssessmentIntroPage />,
  },
  {
    path: PathFor.companiesWantYouPage,
    element: <CompaniesWantYouPage />,
  },
  {
    path: PathFor.statusTrackerPage,
    element: <StatusTrackerPage />,
  },
  {
    path: PathFor.paywallPage,
    element: <PaywallPage />,
  },
  {
    path: PathFor.gapReportPage,
    element: <GapReportPage />,
  },
  {
    path: PathFor.markAvailablePage,
    element: <MarkAvailablePage />,
  },
  {
    path: PathFor.adminReviewQueuePage,
    element: <AdminReviewQueuePage />,
  },
  {
    path: PathFor.guidedBuildPathPage,
    element: <GuidedBuildPathPage />,
  },
  {
    path: PathFor.coachingPracticePage,
    element: <CoachingPracticePage />,
  },
  {
    path: PathFor.reAssessmentIntroPage,
    element: <ReAssessmentIntroPage />,
  },
  {
    path: PathFor.loginPage,
    element: <LoginPage />,
  },
  {
    path: PathFor.gradingPage,
    element: <GradingPage />,
  },
  {
    path: PathFor.buildSubmissionPage,
    element: <BuildSubmissionPage />,
  },
  {
    path: PathFor.clientConversationPage,
    element: <ClientConversationPage />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
