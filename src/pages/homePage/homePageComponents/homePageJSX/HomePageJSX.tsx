import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentStateKey } from '@/enums/global';
import HomeAppBar from '@/components/homeAppBar/HomeAppBar';
import MapThumbnail from '@/components/mapThumbnail/MapThumbnail';
import {
  STEPPER_NODES,
  STUDENT_CONFIGS,
  FUNNEL,
  CTX_CONFIGS,
  LEARNING_MODULES,
  DONE_MODULE_COUNT,
  TOTAL_MODULE_COUNT,
} from '../homePageData';

export interface HomePageJSXProps {
  studentStateKey: StudentStateKey;
  onStateChange: (key: StudentStateKey) => void;
}

/* ===== Icons ===== */
const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const CheckIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);
const SparkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
  </svg>
);
const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.1 8.6 22 9.3 17 14.1 18.2 21 12 17.6 5.8 21 7 14.1 2 9.3 8.9 8.6 12 2" />
  </svg>
);
const FlagIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 21V5a1 1 0 0 1 1-1h9l-1.5 3L15 10H6" />
    <path d="M5 21h4" />
  </svg>
);

/* stage glyphs for upcoming nodes */
const STAGE_GLYPHS: Record<number, React.ReactNode> = {
  0: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" />
    </svg>
  ),
  1: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22V4M4 4h11l-1.5 3.5L15 11H4" />
    </svg>
  ),
  2: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  ),
  3: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  4: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12h8M12 8v8" /><circle cx="12" cy="12" r="9" />
    </svg>
  ),
  5: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
};

/* ===== Contextual card ===== */
const CtxCard: React.FC<{ stateKey: StudentStateKey }> = ({ stateKey }) => {
  const ctx = CTX_CONFIGS[stateKey];

  if (ctx.type === 'lead') {
    const Icon = stateKey === StudentStateKey.inPool ? SparkIcon : InfoIcon;
    return (
      <div className="scard">
        <p className="scnote lead">
          <Icon />
          {ctx.text}
        </p>
      </div>
    );
  }

  if (ctx.type === 'gate') {
    return (
      <div className="scard">
        <div className="gate">
          <LockIcon />
          <p>{ctx.text}</p>
        </div>
      </div>
    );
  }

  if (ctx.type === 'branch') {
    const done = DONE_MODULE_COUNT;
    const total = TOTAL_MODULE_COUNT;
    return (
      <div className="branch">
        <div className="bhead">
          <span className="bh">Guided learning path</span>
          <span className="bp">{done} of {total} done</span>
        </div>
        <div className="modules">
          {LEARNING_MODULES.map((mod, i) => {
            const cls = mod.done ? 'mod mdone' : mod.current ? 'mod mcur' : 'mod';
            return (
              <div key={i} className={cls}>
                <span className="mmk">
                  {mod.done ? <CheckIcon /> : mod.current ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'block' }} /> : null}
                </span>
                <span className="mt">{mod.title}</span>
                {mod.current && <span className="mtag">Resume</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

/* ===== Stepper node ===== */
const StepperNodeComponent: React.FC<{
  node: typeof STEPPER_NODES[0];
  status: 'done' | 'active' | 'locked' | 'upcoming';
  stateKey: StudentStateKey;
  isLast: boolean;
}> = ({ node, status, stateKey, isLast }) => {
  const labelMap = { done: 'Done', active: 'In progress', locked: 'Unlock next', upcoming: 'Upcoming' };

  const markerContent = () => {
    if (node.isDest) return <FlagIcon />;
    if (status === 'done') return <CheckIcon />;
    if (status === 'locked') return <LockIcon />;
    return STAGE_GLYPHS[node.stage] ?? null;
  };

  const nodeClass = ['hp-snode', status, node.isDest ? 'dest' : ''].filter(Boolean).join(' ');

  return (
    <div className={nodeClass} data-stage={node.stage}>
      <div className="rail">
        <span className="mk">{markerContent()}</span>
        {!isLast && <span className="line" />}
      </div>
      <div className="scontent">
        {node.isDest ? (
          <span className="goalflag"><StarIcon />The goal</span>
        ) : (
          <span className="youhere"><span className="yd" />You are here</span>
        )}
        <div className="slab">{labelMap[status]}</div>
        <div className="stitle">{node.title}</div>
        <div className="sdesc">{node.description}</div>

        {/* destination box (phone only) */}
        {node.isDest && (
          <div className="destbox ctxslot">
            <div className="dbpay">
              <span className="amt">₹10,000</span>
              <span className="per">/ month</span>
            </div>
            <p className="dbnote">Build something real for a business in your city, and get paid for it.</p>
            <div className="dbtags">
              <span className="t">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" /></svg>
                Local business
              </span>
              <span className="t">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                Real project
              </span>
              <span className="t">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                Paid work
              </span>
            </div>
          </div>
        )}

        {/* ctx slot (phone only) */}
        {(status === 'active' || status === 'locked') && !node.isDest && (
          <div className="ctxslot">
            <CtxCard stateKey={stateKey} />
          </div>
        )}
      </div>
    </div>
  );
};

/* ===== Main JSX ===== */
const HomePageJSX: React.FC<HomePageJSXProps> = ({ studentStateKey, onStateChange }) => {
  const navigate = useNavigate();
  const config = STUDENT_CONFIGS[studentStateKey];
  const funnel = FUNNEL[studentStateKey];

  const getNodeStatus = (stage: number): 'done' | 'active' | 'locked' | 'upcoming' => {
    if (stage < config.current) return 'done';
    if (stage === config.current) return config.locked ? 'locked' : 'active';
    return 'upcoming';
  };

  const stateLabels: Record<StudentStateKey, string> = {
    [StudentStateKey.new]: 'New',
    [StudentStateKey.learningPath]: 'Learning path',
    [StudentStateKey.passedProfileGate]: 'Profile gate',
    [StudentStateKey.inPool]: 'In the pool',
  };

  return (
    <div className="hp-shell">
      {/* mobile status bar */}
      <div className="hp-statusbar">
        <span>9:41</span>
        <span className="icons">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" />
            <rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" />
          </svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <path d="M8 2.6c2.1 0 4 .82 5.43 2.16l1.2-1.3A9.4 9.4 0 0 0 8 .9 9.4 9.4 0 0 0 1.37 3.46l1.2 1.3A7.86 7.86 0 0 1 8 2.6Z" fill="currentColor" />
            <path d="M8 6.1c1.16 0 2.21.46 2.98 1.2l1.2-1.3A6.06 6.06 0 0 0 8 4.35c-1.6 0-3.05.62-4.13 1.65l1.2 1.3A4.27 4.27 0 0 1 8 6.1Z" fill="currentColor" />
            <path d="M8 9.6 9.9 7.5A2.7 2.7 0 0 0 8 6.7a2.7 2.7 0 0 0-1.9.8L8 9.6Z" fill="currentColor" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="1" y="1" width="20" height="10" rx="2.6" stroke="currentColor" strokeOpacity=".5" strokeWidth="1" />
            <rect x="2.6" y="2.6" width="15" height="6.8" rx="1.4" fill="currentColor" />
            <rect x="22.4" y="4" width="1.6" height="4" rx=".8" fill="currentColor" fillOpacity=".5" />
          </svg>
        </span>
      </div>

      <HomeAppBar />

      <div className="hp-scroll">
        <div className="hp-layout">

          {/* hero row */}
          <div className="hp-herorow">
            <section className="hp-action">
              <h1>Real work. <span className="pay">Real pay.</span></h1>
              <p className="abody">{funnel.body}</p>
              <a
                className="cta pcta"
                onClick={(e) => { e.preventDefault(); navigate(funnel.ctaPath); }}
                href={funnel.ctaPath}
              >
                {funnel.ctaLabel} <ArrowIcon />
              </a>
            </section>

            <MapThumbnail />
          </div>

          {/* roadmap */}
          <div className="hp-roadmap">
            <div className="hp-rmhead">
              <h2>Your path to an internship</h2>
              <span className="rmcount">Step {config.current + 1} of 7</span>
            </div>
            <p className="hp-rmsub">Seven steps from sign-up to your first paid project.</p>

            <div className="hp-stepper">
              {STEPPER_NODES.map((node, i) => (
                <StepperNodeComponent
                  key={node.stage}
                  node={node}
                  status={getNodeStatus(node.stage)}
                  stateKey={studentStateKey}
                  isLast={i === STEPPER_NODES.length - 1}
                />
              ))}
            </div>

            {/* desktop context card */}
            <div className="hp-deskcard">
              <CtxCard stateKey={studentStateKey} />
            </div>
          </div>

        </div>
      </div>

      <div className="hp-homebar"><i /></div>

      {/* debug state toggle */}
      <div className="hp-debug">
        {(Object.values(StudentStateKey) as StudentStateKey[]).map(key => (
          <button
            key={key}
            className={studentStateKey === key ? 'active' : ''}
            onClick={() => { onStateChange(key); }}
          >
            {stateLabels[key]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePageJSX;
