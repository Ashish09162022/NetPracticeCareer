import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import HomePage from '@/pages/homePage/homePage';

const router = createBrowserRouter([
  {
    path: PathFor.homePage,
    element: <HomePage />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
