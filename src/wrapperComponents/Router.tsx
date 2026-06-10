import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import HomePage from '@/pages/homePage/homePage';
import ProfileIntakePage from '@/pages/profileIntakePage/profileIntakePage';
import AssessmentIntroPage from '@/pages/assessmentIntroPage/assessmentIntroPage';
import CompaniesWantYouPage from '@/pages/companiesWantYouPage/companiesWantYouPage';
import StatusTrackerPage from '@/pages/statusTrackerPage/statusTrackerPage';
import PaywallPage from '@/pages/paywallPage/paywallPage';
import GapReportPage from '@/pages/gapReportPage/gapReportPage';

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
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
