import { type FC, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/storeHooks';
import { setStudentStateKey } from '@/store/slices/homeSlice/homeSlice';
import { StudentStateKey } from '@/enums/global';
import { useGetHomeQuery } from '@/store/api/homeApi';
import type { HomeStage } from '@/store/api/homeApi';
import HomePageJSX from './homePageComponents/homePageJSX/HomePageJSX';
import './homePage.css';

const stageToStudentStateKey = (stage: HomeStage): StudentStateKey => {
  switch (stage) {
    case 'in_paid_path': return StudentStateKey.learningPath;
    case 'assessment_pending': return StudentStateKey.new;
    case 'pool':
    case 'matched':
    case 'interview_scheduled':
    case 'confirmed': return StudentStateKey.inPool;
    case 'gate_incomplete':
    case 'ready_pending_profile':
    default: return StudentStateKey.passedProfileGate;
  }
};

const HomePage: FC = () => {
  const dispatch = useAppDispatch();
  const { studentStateKey } = useAppSelector((state) => state.homeSlice);
  const { data: homeData } = useGetHomeQuery();

  // Use API stage when available; fall back to local slice for dev tab switching
  const activeKey: StudentStateKey = homeData
    ? stageToStudentStateKey(homeData.stage)
    : studentStateKey;

  const handleStateChange = useCallback((key: StudentStateKey) => {
    dispatch(setStudentStateKey(key));
  }, [dispatch]);

  return (
    <HomePageJSX
      studentStateKey={activeKey}
      onStateChange={handleStateChange}
    />
  );
};

export default HomePage;
