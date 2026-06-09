import { StudentStateKey } from '@/enums/global';

export interface StudentStateData {
  key: StudentStateKey;
  current: number;
  locked: boolean;
}

export interface ActionFunnelData {
  eyebrow: string;
  body: string;
  ctaLabel: string;
  ctaPath: string;
}

export interface StepperContextData {
  type: 'lead' | 'branch' | 'gate';
  text?: string;
}

export interface LearningModule {
  title: string;
  done: boolean;
  current: boolean;
}
