import { type FC, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/storeHooks';
import { setStudentStateKey } from '@/store/slices/homeSlice/homeSlice';
import { StudentStateKey } from '@/enums/global';
import HomePageJSX from './homePageComponents/homePageJSX/HomePageJSX';
import './homePage.css';

interface HomePageProps {}

const HomePage: FC<HomePageProps> = () => {
  const dispatch = useAppDispatch();
  const { studentStateKey } = useAppSelector((state) => state.homeSlice);

  const handleStateChange = useCallback((key: StudentStateKey) => {
    dispatch(setStudentStateKey(key));
  }, [dispatch]);

  return (
    <HomePageJSX
      studentStateKey={studentStateKey}
      onStateChange={handleStateChange}
    />
  );
};

export default HomePage;
