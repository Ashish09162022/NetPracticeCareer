import React from 'react';
import {
  GAP_CONFIG,
  BREAKDOWN_NOT_PASS,
  BREAKDOWN_PASS,
  ScoreTier,
  Req,
  Note,
  BreakdownData,
  ReqStatus,
} from '../gapReportPageData';

/* ── Icons ── */
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CheckIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const MinusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
);

const XIcon = ({ size = 11 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const MedalIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5" />
  </svg>
);

const ClockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const TipIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 17v.01M12 13.5a2.5 2.5 0 1 0-2.5-3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ── Brand mark ── */
const BrandMark = () => (
  <span className="gr-brand-mark"><span /></span>
);

/* ── Status bar (mobile) ── */
const StatusBar = () => (
  <div className="gr-statusbar">
    <span>9:41</span>
    <span className="gr-sb-icons">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
        <rect x="0" y="7" width="3" height="4" rx="1" />
        <rect x="4.5" y="5" width="3" height="6" rx="1" />
        <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
        <rect x="13.5" y="0" width="3" height="11" rx="1" />
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
);

/* ── App bar ── */
const AppBar = ({ onBack }: { onBack: () => void }) => (
  <header className="gr-appbar">
    <button className="gr-iconbtn gr-nav-m" aria-label="Back" onClick={onBack}>
      <BackIcon />
    </button>
    <span className="gr-title gr-nav-m">Assessment result</span>
    <span className="gr-spacer gr-nav-m" />

    <div className="gr-nav-d">
      <div className="gr-brand"><BrandMark />NetPractice</div>
      <nav className="gr-nav">
        <a href="#" className="gr-nav-link">Dashboard</a>
        <a href="#" className="gr-nav-link">Projects</a>
        <a href="#" className="gr-nav-link gr-cur">Assessment</a>
        <a href="#" className="gr-nav-link">Placements</a>
      </nav>
      <span className="gr-spacer" />
      <div className="gr-user">
        <div className="gr-user-text">
          <div className="gr-user-name">Aman Verma</div>
          <div className="gr-user-sub">Project 01 · Submitted</div>
        </div>
        <div className="gr-avatar">AV</div>
      </div>
    </div>
  </header>
);

/* ── Score card ── */
const ScoreCard = ({ score, tier }: { score: number; tier: ScoreTier }) => {
  const isPass = tier === 'pass';
  const isSchol = tier === 'scholarship';

  const verdictText = isPass ? 'Passed' : isSchol ? 'Almost there' : 'Not there yet';
  const pillClass = `gr-pill ${isPass ? 'gr-pill-good' : 'gr-pill-warn'}`;

  let h1: string;
  let body: string;
  if (isPass) {
    h1 = 'You passed!';
    body = 'You cleared the placement line — a strong, well-rounded build. You're ready for the pool.';
  } else if (isSchol) {
    h1 = 'Almost there';
    body = `Three fixable gaps stand between you and the pool. None are about talent. You scored ${score}, so your path is ${GAP_CONFIG.scholarshipPct}% off.`;
  } else {
    h1 = 'Not there yet';
    body = 'A few fixable gaps stand between you and the pool. None are about talent — the path is built to close them.';
  }

  return (
    <section className="gr-card gr-scorecard">
      <span className="gr-eyebrow">Assessment result · {GAP_CONFIG.clientName}</span>
      <div className="gr-scoretop">
        <div className="gr-scorenum">
          <span className="gr-sc">{score}</span>
          <span className="gr-of">/ 100</span>
        </div>
        <span className={pillClass}>
          <span className="gr-pdot" />
          {verdictText}
        </span>
      </div>

      <div className="gr-track">
        <div
          className="gr-track-band"
          style={{
            left: `${GAP_CONFIG.scholarshipFloor}%`,
            width: `${GAP_CONFIG.passMark - GAP_CONFIG.scholarshipFloor}%`,
          }}
        />
        <div
          className={`gr-track-fill${isPass ? ' gr-fill-ok' : ''}`}
          style={{ width: `${Math.max(4, score)}%` }}
        />
        <div className="gr-track-tick" style={{ left: `${GAP_CONFIG.passMark}%` }}>
          <span className="gr-tick-lab">Pass {GAP_CONFIG.passMark}</span>
        </div>
      </div>

      <div className="gr-verdict">
        <h1>{h1}</h1>
        <p>{body}</p>
      </div>

      {isSchol && (
        <div className="gr-scholar">
          <span className="gr-scholar-icon"><MedalIcon /></span>
          <div className="gr-scholar-text">
            <div className="gr-scholar-big">Your path is {GAP_CONFIG.scholarshipPct}% off</div>
            <div className="gr-scholar-sub">
              You scored {score} — that earns a {GAP_CONFIG.scholarshipPct}% scholarship on the guided path, applied automatically.
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ── Biggest gap / strongest work card ── */
const BigGapCard = ({ tier }: { tier: ScoreTier }) => {
  const isPass = tier === 'pass';
  return (
    <section className={`gr-card gr-biggap${isPass ? ' gr-biggap-win' : ''}`}>
      <span className={`gr-eyebrow ${isPass ? 'gr-eyebrow-ok' : 'gr-eyebrow-danger'}`}>
        {isPass ? 'Your strongest work' : 'Your biggest gap'}
      </span>
      <div className="gr-bgname">Weekly &amp; monthly subscriptions</div>
      <p className="gr-bgwhy">
        {isPass
          ? "The client’s main ask, and you nailed it. Recurring plans, pause and resume all work end to end."
          : "The client’s main ask — and recurring plans are the heart of a tiffin business. You built one-time orders only."}
      </p>
      <span className={`gr-bgtag ${isPass ? 'gr-bgtag-win' : 'gr-bgtag-miss'}`}>
        {isPass ? <CheckIcon size={12} /> : <XIcon size={11} />}
        <span>{isPass ? 'Nailed it' : 'Missing'}</span>
      </span>
    </section>
  );
};

/* ── Requirement badge ── */
const BadgeIcon = ({ status }: { status: ReqStatus }) => {
  if (status === 'met') return <CheckIcon size={13} />;
  if (status === 'partial') return <MinusIcon />;
  return <XIcon size={12} />;
};

/* ── Segment bar color map ── */
const segClass: Record<ReqStatus, string> = {
  met: 'gr-seg-met',
  partial: 'gr-seg-part',
  miss: 'gr-seg-miss',
};

/* ── Requirement row ── */
const ReqRow = ({ req }: { req: Req }) => {
  const statusLabel: Record<ReqStatus, string> = { met: 'Met', partial: 'Partial', miss: 'Missing' };
  return (
    <div className="gr-req">
      <span className={`gr-badge gr-badge-${req.status}`}>
        <BadgeIcon status={req.status} />
      </span>
      <div className="gr-req-body">
        <div className="gr-req-top">
          <span className="gr-req-name">{req.name}</span>
          <span className={`gr-statuslab gr-statuslab-${req.status}`}>{statusLabel[req.status]}</span>
        </div>
        <div className="gr-req-why">{req.why}</div>
      </div>
    </div>
  );
};

/* ── Note row ── */
const NoteRow = ({ note }: { note: Note }) => {
  const icon = note.kind === 'pos'
    ? <CheckIcon size={12} />
    : note.kind === 'neg'
    ? <XIcon size={11} />
    : <TipIcon />;

  return (
    <div className={`gr-note gr-note-${note.kind}`}>
      <span className="gr-note-icon">{icon}</span>
      <span className="gr-note-text">
        <b>{note.bold}</b> {note.text}
      </span>
    </div>
  );
};

/* ── Breakdown (collapsible) ── */
const BreakdownSection = ({ tier }: { tier: ScoreTier }) => {
  const isPass = tier === 'pass';
  const data: BreakdownData = isPass ? BREAKDOWN_PASS : BREAKDOWN_NOT_PASS;

  const counts = {
    met: data.segments.filter(s => s === 'met').length,
    partial: data.segments.filter(s => s === 'partial').length,
    miss: data.segments.filter(s => s === 'miss').length,
  };
  const summaryParts = [`${counts.met} met`];
  if (counts.partial > 0) summaryParts.push(`${counts.partial} partial`);
  if (counts.miss > 0) summaryParts.push(`${counts.miss} missing`);

  return (
    <details className="gr-card gr-rest">
      <summary>
        <span>See the full breakdown · {summaryParts.join(', ')}</span>
        <span className="gr-chev"><ChevronDownIcon /></span>
      </summary>
      <div className="gr-restbody">

        {/* Stats + segments */}
        <div className="gr-stat">
          <div className="gr-stat-big">
            {data.metCount} of {data.totalCount} <span>requirements met</span>
          </div>
          <div className="gr-segbar">
            {data.segments.map((s, i) => (
              <i key={i} className={segClass[s]} />
            ))}
          </div>
          <div className="gr-seglegend">
            <span><b className="gr-legdot gr-legdot-met" />{counts.met} Met</span>
            {counts.partial > 0 && <span><b className="gr-legdot gr-legdot-part" />{counts.partial} Partial</span>}
            {counts.miss > 0 && <span><b className="gr-legdot gr-legdot-miss" />{counts.miss} Missing</span>}
          </div>
        </div>

        {/* Requirements list */}
        <div className="gr-reqlist">
          {data.reqs.map((req, i) => <ReqRow key={i} req={req} />)}
        </div>

        {/* Requirement gathering notes */}
        <div className="gr-restsub">Requirement gathering</div>
        <div className="gr-notes">
          {data.reqNotes.map((note, i) => <NoteRow key={i} note={note} />)}
        </div>

        {/* Communication notes */}
        <div className="gr-restsub">Communication</div>
        <div className="gr-notes">
          {data.commNotes.map((note, i) => <NoteRow key={i} note={note} />)}
        </div>

        {/* Delivery */}
        <div className={`gr-delivery${data.deliveryLate ? '' : ' gr-delivery-ok'}`}>
          {data.deliveryLate ? <ClockIcon /> : <CheckIcon size={17} />}
          <span>
            {data.deliveryLate
              ? 'Delivered 6h late. The client accepted it, but it was noted.'
              : 'Delivered on time. The client accepted it without changes.'}
          </span>
        </div>

      </div>
    </details>
  );
};

/* ── Action card ── */
const ActionCard = ({
  tier,
  onJoinPool,
  onStartPath,
}: {
  tier: ScoreTier;
  onJoinPool: () => void;
  onStartPath: () => void;
}) => {
  const isPass = tier === 'pass';
  const isSchol = tier === 'scholarship';
  const fullPrice = GAP_CONFIG.pathPrice;
  const price = isSchol ? Math.round(fullPrice * (1 - GAP_CONFIG.scholarshipPct / 100)) : fullPrice;
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (isPass) {
    return (
      <section className="gr-card gr-actioncard gr-actioncard-ok">
        <span className="gr-aeye">You're placement-ready</span>
        <div className="gr-ahead">Join the pool</div>
        <p className="gr-asub">
          Local businesses pick from the pool. Join it and we'll start matching you with companies near you.
        </p>
        <button className="gr-cta gr-cta-ok" onClick={onJoinPool}>
          Join the pool <ArrowRightIcon />
        </button>
        <p className="gr-reassure">We'll text and email you the moment a company picks you.</p>
      </section>
    );
  }

  return (
    <section className="gr-card gr-actioncard">
      <span className="gr-aeye">Your next step</span>
      <div className="gr-ahead">Close these gaps on the path</div>
      <p className="gr-asub">
        A guided path built from your gaps, a mentor checking your work, and a free retry with a fresh client.
      </p>
      <div className="gr-priceline">
        <span className="gr-price-amt">{fmt(price)}</span>
        {isSchol && <span className="gr-price-was">{fmt(fullPrice)}</span>}
        <span className="gr-price-per">one-time · includes a free retry</span>
        {isSchol && <span className="gr-savetag">{GAP_CONFIG.scholarshipPct}% scholarship</span>}
      </div>
      <button className="gr-cta" onClick={onStartPath}>
        Start my path <ArrowRightIcon />
      </button>
      <p className="gr-reassure">No subscription. Pay once, keep the path for good.</p>
    </section>
  );
};

/* ── Home bar (mobile) ── */
const HomeBar = () => (
  <div className="gr-homebar"><i /></div>
);

/* ── Props ── */
export interface GapReportPageJSXProps {
  score: number;
  tier: ScoreTier;
  onJoinPool: () => void;
  onStartPath: () => void;
  onBack: () => void;
}

/* ── Main component ── */
const GapReportPageJSX: React.FC<GapReportPageJSXProps> = ({
  score,
  tier,
  onJoinPool,
  onStartPath,
  onBack,
}) => (
  <div className="gr-shell">
    <StatusBar />
    <AppBar onBack={onBack} />
    <div className="gr-scroll">
      <div className="gr-layout">
        <div className="gr-report">
          <ScoreCard score={score} tier={tier} />
          <BigGapCard tier={tier} />
          <BreakdownSection tier={tier} />
          <ActionCard tier={tier} onJoinPool={onJoinPool} onStartPath={onStartPath} />
        </div>
      </div>
    </div>
    <HomeBar />
  </div>
);

export default GapReportPageJSX;
