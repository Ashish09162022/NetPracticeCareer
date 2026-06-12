import { StudentStateKey } from '@/enums/global';
import { PathFor } from '@/enums/global';
import type { ActionFunnelData, LearningModule } from '@/interfaces/student';

/* ===== Stepper nodes ===== */
export interface StepperNode {
  stage: number;
  title: string;
  description: string;
  isDest?: boolean;
}

export const STEPPER_NODES: StepperNode[] = [
  { stage: 0, title: 'Create your account', description: 'Sign up with your phone number to get started.' },
  { stage: 1, title: 'Set your goal', description: 'Tell us your city and the kind of work you want.' },
  { stage: 2, title: 'Get placement-ready', description: 'Pass the skills assessment by building a real project from a client brief.' },
  { stage: 3, title: 'Join the placement pool', description: 'Profile complete, visible to hiring companies.' },
  { stage: 4, title: 'Get matched', description: 'A local company picks you for their project.' },
  { stage: 5, title: 'Interview', description: 'Meet the company and talk through your work.' },
  { stage: 6, title: 'Start your internship', description: 'A paid project with a real local business.', isDest: true },
];

/* ===== Student state config ===== */
export interface StudentConfig {
  current: number;
  locked: boolean;
}

export const STUDENT_CONFIGS: Record<StudentStateKey, StudentConfig> = {
  [StudentStateKey.new]:              { current: 2, locked: false },
  [StudentStateKey.learningPath]:     { current: 2, locked: false },
  [StudentStateKey.passedProfileGate]:{ current: 3, locked: true },
  [StudentStateKey.inPool]:           { current: 4, locked: false },
};

/* ===== Action funnel per state ===== */
export const FUNNEL: Record<StudentStateKey, ActionFunnelData> = {
  [StudentStateKey.new]: {
    eyebrow: 'Do this next',
    body: "You're available to start. Now pass the assessment by building a real project from a client brief -- that puts you in the pool.",
    ctaLabel: 'Take your assessment',
    ctaPath: PathFor.assessmentIntroPage,
  },
  [StudentStateKey.learningPath]: {
    eyebrow: 'Continue',
    body: "You're available to start. Finish your learning path, then retake the assessment to become placement-ready.",
    ctaLabel: 'Resume your path',
    ctaPath: PathFor.guidedBuildPathPage,
  },
  [StudentStateKey.passedProfileGate]: {
    eyebrow: 'One step left',
    body: "You passed and you're placement-ready. Complete your profile so local companies can pick you.",
    ctaLabel: 'Finish my profile',
    ctaPath: PathFor.profileIntakePage,
  },
  [StudentStateKey.inPool]: {
    eyebrow: "You're in the pool",
    body: "You're available and placement-ready. We're introducing you to Raipur businesses right now.",
    ctaLabel: 'View placement status',
    ctaPath: PathFor.statusTrackerPage,
  },
};

/* ===== Context card per state ===== */
export type CtxType = 'lead' | 'branch' | 'gate';

export interface CtxConfig {
  type: CtxType;
  text?: string;
}

export const CTX_CONFIGS: Record<StudentStateKey, CtxConfig> = {
  [StudentStateKey.new]: {
    type: 'lead',
    text: "You'll get a brief from a local client, build a small project, and submit it. There's no wrong start. Most students learn a lot just from trying.",
  },
  [StudentStateKey.learningPath]: { type: 'branch' },
  [StudentStateKey.passedProfileGate]: {
    type: 'gate',
    text: "Joining the pool needs a complete profile. It's how companies decide who to pick. It's the only thing left before you're matched.",
  },
  [StudentStateKey.inPool]: {
    type: 'lead',
    text: "Nothing to do right now. Keep an eye on your notifications. Want to stay sharp? Try a quick practice round while you wait.",
  },
};

/* ===== Learning modules (state b) ===== */
export const LEARNING_MODULES: LearningModule[] = [
  { title: 'Reading a client brief', done: true, current: false },
  { title: 'Asking the right questions', done: true, current: false },
  { title: 'Scoping a small build', done: true, current: false },
  { title: 'Layout & structure', done: false, current: true },
  { title: 'Making it responsive', done: false, current: false },
  { title: 'Forms & validation', done: false, current: false },
  { title: 'Polish & handoff', done: false, current: false },
  { title: 'Mock client re-run', done: false, current: false },
];

export const DONE_MODULE_COUNT = LEARNING_MODULES.filter(m => m.done).length;
export const TOTAL_MODULE_COUNT = LEARNING_MODULES.length;
