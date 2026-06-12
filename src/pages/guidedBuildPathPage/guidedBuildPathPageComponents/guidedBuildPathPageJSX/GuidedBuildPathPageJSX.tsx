import React, { useState, useCallback } from 'react';

/* ===== Types ===== */
type ModuleStatus = 'done' | 'current' | 'up' | 'locked';

interface ModuleData {
  title: string;
  desc: string;
  time: string;
  type: string;
}

interface LessonData {
  title: string;
  desc: string;
  done: boolean;
  type: string;
}

import type { BuildPathData } from '@/store/api/buildPathApi';

export interface GuidedBuildPathPageJSXProps {
  buildPath?: BuildPathData | null;
  isLoading?: boolean;
  onBack: () => void;
  onPractice: () => void;
  onModuleDone?: (moduleId: string) => void;
  onReassessment: () => void;
}

/* ===== Data ===== */
const MODULES: ModuleData[] = [
  { title: 'Start here', desc: 'How the path works and what re-assessment expects.', time: '5 min', type: 'Read' },
  { title: 'Gather requirements', desc: 'Ask the questions that surface what a client really needs.', time: '18 min', type: 'Video + task' },
  { title: 'Scope a project', desc: 'Turn a fuzzy ask into a clear, buildable plan.', time: '15 min', type: 'Video + task' },
  { title: 'Handle client comms', desc: 'Stay clear, timely and professional under pressure.', time: '12 min', type: 'Video' },
  { title: 'Build and deploy', desc: 'Ship a working web app using AI tools.', time: '40 min', type: 'Project' },
  { title: 'Document your work', desc: 'Write a README and notes a client can actually follow.', time: '10 min', type: 'Read + task' },
  { title: 'Test and polish', desc: 'Catch the gaps before the client does.', time: '14 min', type: 'Video + task' },
  { title: 'Prep for re-assessment', desc: 'A dry run, then you\'re ready to retake.', time: '8 min', type: 'Checklist' },
];

const DONE_COUNT = 3;

function getStatus(index: number): ModuleStatus {
  if (index < DONE_COUNT) return 'done';
  if (index === DONE_COUNT) return 'current';
  if (index === DONE_COUNT + 1) return 'up';
  return 'locked';
}

function getLessons(index: number, status: ModuleStatus): LessonData[] {
  const m = MODULES[index];
  const isDone = status === 'done';
  return [
    {
      title: 'Watch: the core idea',
      desc: m.type.includes('Video') ? 'A short walkthrough with real examples.' : 'Key concepts, explained simply.',
      done: true,
      type: '6 min',
    },
    {
      title: 'Read: the playbook',
      desc: 'A checklist you can reuse on every project.',
      done: isDone,
      type: 'Read',
    },
    {
      title: 'Your task',
      desc: 'Apply it to a sample brief and submit for auto-feedback.',
      done: isDone,
      type: 'Task',
    },
  ];
}

function getStatusLabel(status: ModuleStatus): string {
  if (status === 'done') return 'Completed';
  if (status === 'current') return 'Continue here';
  return 'Up next';
}

function getCtaLabel(status: ModuleStatus): string {
  if (status === 'done') return 'Review again';
  if (status === 'current') return 'Continue module';
  return 'Start module';
}

/* ===== Icons ===== */
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const SignalIcon = () => (
  <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
    <rect x="0" y="7" width="3" height="4" rx="1" />
    <rect x="4.5" y="5" width="3" height="6" rx="1" />
    <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
    <rect x="13.5" y="0" width="3" height="11" rx="1" />
  </svg>
);

const WifiIcon = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
    <path d="M8 2.6c2.1 0 4 .82 5.43 2.16l1.2-1.3A9.4 9.4 0 0 0 8 .9 9.4 9.4 0 0 0 1.37 3.46l1.2 1.3A7.86 7.86 0 0 1 8 2.6Z" fill="currentColor" />
    <path d="M8 6.1c1.16 0 2.21.46 2.98 1.2l1.2-1.3A6.06 6.06 0 0 0 8 4.35c-1.6 0-3.05.62-4.13 1.65l1.2 1.3A4.27 4.27 0 0 1 8 6.1Z" fill="currentColor" />
    <path d="M8 9.6 9.9 7.5A2.7 2.7 0 0 0 8 6.7a2.7 2.7 0 0 0-1.9.8L8 9.6Z" fill="currentColor" />
  </svg>
);

const BatteryIcon = () => (
  <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
    <rect x="1" y="1" width="20" height="10" rx="2.6" stroke="currentColor" strokeOpacity=".5" strokeWidth="1" />
    <rect x="2.6" y="2.6" width="15" height="6.8" rx="1.4" fill="currentColor" />
    <rect x="22.4" y="4" width="1.6" height="4" rx=".8" fill="currentColor" fillOpacity=".5" />
  </svg>
);

const CheckIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const ClockIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.1a8.38 8.38 0 0 1-.9-3.9 8.5 8.5 0 0 1 8.4-8.5h.5A8.48 8.48 0 0 1 21 11v.5Z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const BookIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
);

/* ===== Pane content sub-component ===== */
const PaneContent = ({ index, status }: { index: number; status: ModuleStatus }) => {
  const m = MODULES[index];
  const lessons = getLessons(index, status);

  return (
    <div className="gbp-panein">
      <span className="gbp-eyebrow">Module {index + 1} · {getStatusLabel(status)}</span>
      <h2>{m.title}</h2>
      <p className="gbp-plead">{m.desc}</p>

      <div className="gbp-video">
        <span className="gbp-play"><PlayIcon /></span>
        <span className="gbp-vlen">{m.time}</span>
      </div>

      <div className="gbp-lessons">
        <h3>In this module</h3>
        {lessons.map((l, i) => (
          <div key={i} className={`gbp-lesson${l.done ? ' gbp-lesson--done' : ''}`}>
            <span className="gbp-lc">
              {l.done && <CheckIcon size={13} />}
            </span>
            <div className="gbp-lt">
              <b>{l.title}</b>
              <span>{l.desc}</span>
            </div>
            <span className="gbp-ltype">{l.type}</span>
          </div>
        ))}
      </div>

      <div className="gbp-panecta">
        <button className="gbp-cta">
          {getCtaLabel(status)} <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

/* ===== Main component ===== */
const GuidedBuildPathPageJSX: React.FC<GuidedBuildPathPageJSXProps> = ({
  onBack,
  onPractice,
  onReassessment,
}) => {
  const [selected, setSelected] = useState<number | null>(DONE_COUNT);
  const [showDetail, setShowDetail] = useState(false);

  const doneCount = DONE_COUNT;
  const totalCount = MODULES.length;
  const allDone = doneCount === totalCount;
  const progressPct = (doneCount / totalCount) * 100;

  const handleModuleClick = useCallback((index: number) => {
    setSelected(index);
    setShowDetail(true);
  }, []);

  const handleDetailClose = useCallback(() => {
    setShowDetail(false);
  }, []);

  return (
    <div className="gbp-shell">
      {/* Mobile status bar */}
      <div className="gbp-statusbar">
        <span>9:41</span>
        <div className="gbp-sb-icons">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </div>
      </div>

      {/* Progress header */}
      <div className="gbp-phead">
        <div className="gbp-pwrap">
          <button className="gbp-backbtn" onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
          <div className="gbp-ptitle">
            <div className="gbp-brandrow">
              <div className="gbp-brand">
                <span className="gbp-brand-logo"><span /></span>
                NetPractice
              </div>
            </div>
            <h1>Your path to placement-ready</h1>
            <div className="gbp-pmeta">
              {allDone ? "You're ready. Take your re-assessment" : 'Built around your gap report · keep going'}
            </div>
          </div>
          <div className="gbp-pcount">
            <span className="gbp-pc">{doneCount}/{totalCount}</span>
            <span className="gbp-pl">Steps done</span>
          </div>
        </div>
        <div className="gbp-pbar">
          <i className="gbp-pbar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Body */}
      <div className="gbp-body">
        <div className="gbp-panes">
          {/* Module list */}
          <div className="gbp-list">
            <div className="gbp-list-hd">
              {allDone ? 'All modules complete' : 'Your modules'}
            </div>

            {MODULES.map((m, i) => {
              const status = getStatus(i);
              const isLocked = status === 'locked';
              const isSelected = selected === i;

              let modClass = 'gbp-mod';
              if (status === 'done') modClass += ' gbp-mod--done';
              else if (status === 'current') modClass += ' gbp-mod--current';
              else if (isLocked) modClass += ' gbp-mod--locked';
              if (isSelected && !isLocked) modClass += ' gbp-mod--selected';

              return (
                <button
                  key={i}
                  className={modClass}
                  onClick={isLocked ? undefined : () => handleModuleClick(i)}
                  disabled={isLocked}
                >
                  <span className="gbp-mnum">
                    {status === 'done' ? <CheckIcon size={16} /> : i + 1}
                  </span>
                  <span className="gbp-mbody">
                    <span className="gbp-mtop">
                      <span className="gbp-mtitle">{m.title}</span>
                    </span>
                    <span className="gbp-mdesc">{m.desc}</span>
                    <span className="gbp-mfoot">
                      {status === 'done' && <span className="gbp-chip gbp-chip--done">Done</span>}
                      {status === 'current' && <span className="gbp-chip gbp-chip--prog">In progress</span>}
                      {(status === 'up' || status === 'locked') && <span className="gbp-chip gbp-chip--up">Upcoming</span>}
                      <span className="gbp-mtime"><ClockIcon />{m.time}</span>
                    </span>
                  </span>
                  <span className="gbp-mgo"><ChevronRightIcon /></span>
                  <span className="gbp-lockico"><LockIcon /></span>
                </button>
              );
            })}

            <button className="gbp-practice" onClick={onPractice}>
              <span className="gbp-pic"><ChatIcon /></span>
              <span className="gbp-pt">
                <b>Practice with a client</b>
                <span>Rehearse requirement-gathering anytime</span>
              </span>
              <span className="gbp-pgo"><ChevronRightIcon /></span>
            </button>

            {allDone && (
              <button className="gbp-reassess" onClick={onReassessment}>
                Take your re-assessment <ArrowRightIcon />
              </button>
            )}
          </div>

          {/* Desktop content pane */}
          <div className="gbp-pane">
            {selected !== null ? (
              <PaneContent index={selected} status={getStatus(selected)} />
            ) : (
              <div className="gbp-paneempty">
                <BookIcon />
                <b>Pick a module</b>
                <span>Select a step on the left to see its lessons and tasks.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile detail overlay */}
      <div className={`gbp-detail${showDetail ? ' gbp-detail--show' : ''}`}>
        <div className="gbp-dbar">
          <button className="gbp-dbar-back" onClick={handleDetailClose} aria-label="Back">
            <BackIcon />
          </button>
          <span className="gbp-dt">{selected !== null ? MODULES[selected].title : ''}</span>
        </div>
        <div className="gbp-dscroll">
          {selected !== null && (
            <PaneContent index={selected} status={getStatus(selected)} />
          )}
        </div>
      </div>

      <div className="gbp-homebar"><i /></div>
    </div>
  );
};

export default GuidedBuildPathPageJSX;
