import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SUBMISSIONS,
  type Submission,
  type RecoType,
  type DimScoreClass,
  type ReqStatus,
  type NoteType,
} from '../adminReviewQueuePageData';

/* ===== Icons ===== */
const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
  </svg>
);
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const LightbulbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2Z" />
    <line x1="9.5" y1="21" x2="14.5" y2="21" />
  </svg>
);
const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5" />
    <path d="M2.5 12h19" />
    <path d="M12 2.5a14 14 0 0 1 0 19 14 14 0 0 1 0-19Z" />
  </svg>
);
const ChatIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </svg>
);
const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const QueueCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const EmptyQueueIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

/* ===== Small requirement icon helpers ===== */
const ReqMetIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const ReqPartIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
);
const ReqMissIcon = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const ReqUnverifiableIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 9a3 3 0 1 1 3 3v2" /><circle cx="12" cy="17" r=".5" fill="currentColor" />
  </svg>
);

const notePosIcon = (
  <svg className="ar-ni" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const noteNegIcon = (
  <svg className="ar-ni" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const noteTipIcon = (
  <svg className="ar-ni" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v4M12 17v.01" /><circle cx="12" cy="12" r="9.5" />
  </svg>
);

/* ===== Pill ===== */
const Pill = ({ reco, label }: { reco: RecoType; label: string }) => (
  <span className={`ar-pill ar-${reco}`}>
    <span className="ar-pd"></span>{label}
  </span>
);

/* ===== MiniChip ===== */
const MiniChip = ({ cls, children }: { cls?: string; children: React.ReactNode }) => (
  <span className={`ar-minichip${cls ? ' ar-' + cls : ''}`}>{children}</span>
);

/* ===== AvailTag ===== */
const AvailTag = ({ avail }: { avail: boolean }) => (
  <span className={`ar-availtag${avail ? '' : ' ar-off'}`}>
    <span className="ar-ad"></span>{avail ? 'Available' : 'Unavailable'}
  </span>
);

/* ===== AvailBanner ===== */
const AvailBanner = ({ avail }: { avail: boolean }) => (
  <div className={`ar-availbanner ${avail ? 'ar-on' : 'ar-off'}`}>
    <span className="ar-abdot"></span>
    <div className="ar-abtext">
      <div className="ar-abtitle">
        {avail ? 'Available to start' : 'Not available'}
        <span className="ar-ablive"><span className="ar-ablive-dot"></span>Live</span>
      </div>
      <div className="ar-absub">
        {avail
          ? 'Student-controlled status. In active matching -- okay to move forward.'
          : <><b>Held out of active matching.</b> The student set themselves unavailable -- don't match until they turn it back on.</>
        }
      </div>
    </div>
    <span className="ar-ablock"><LockIcon />Read-only</span>
  </div>
);

/* ===== Req icon ===== */
const reqIcon = (s: ReqStatus) => {
  if (s === 'met')          return <ReqMetIcon />;
  if (s === 'part')         return <ReqPartIcon />;
  if (s === 'unverifiable') return <ReqUnverifiableIcon />;
  return <ReqMissIcon />;
};

/* ===== Note icon ===== */
const noteIcon = (t: NoteType) => {
  if (t === 'pos') return notePosIcon;
  if (t === 'neg') return noteNegIcon;
  return noteTipIcon;
};

/* ===== Detail content ===== */
const DetailContent = ({ s }: { s: Submission }) => (
  <div className="ar-dpad">
    <div className="ar-dhd">
      <span className="ar-dav">{s.init}</span>
      <div className="ar-dinfo">
        <div className="ar-dname">{s.name}</div>
        <div className="ar-dbrief">{s.brief}</div>
        <div className="ar-dmeta">
          <Pill reco={s.reco} label={s.recoLabel} />
          <MiniChip cls={s.delivery}>Delivery: {s.deliveryLabel}</MiniChip>
          <MiniChip>Submitted {s.time}</MiniChip>
        </div>
      </div>
    </div>

    <AvailBanner avail={s.avail} />

    <div className="ar-reco">
      <span className="ar-ricon"><LightbulbIcon /></span>
      <div className="ar-rb">
        <div className="ar-rtop">
          <span className="ar-rlabel">AI recommendation</span>
          <Pill reco={s.reco} label={s.recoLabel} />
          <span className="ar-rscore">Readiness {s.score}/100</span>
        </div>
        <p className="ar-rsum">{s.summary}</p>
      </div>
    </div>

    <div className="ar-links">
      <a href="#"><GithubIcon />View repo</a>
      <a href="#"><GlobeIcon />Live app</a>
      <a href="#"><ChatIcon />Transcript</a>
    </div>

    <div className="ar-dim">
      <div className="ar-dimh">
        <span className="ar-dimt">What they built</span>
        <span className={`ar-dimscore ar-${s.build.cls}`}>{s.build.score}</span>
      </div>
      <div className="ar-reqs">
        {s.build.reqs.map((r, i) => (
          <div key={i} className={`ar-req${r.miss ? ' ar-missrow' : ''}`}>
            <span className={`ar-rk ar-${r.s}`}>{reqIcon(r.s)}</span>
            <span className="ar-rn">
              {r.miss ? <b>{r.n}</b> : r.n}
              {r.why && <span className="ar-why"> {r.why}</span>}
            </span>
            {r.notask && <span className="ar-notask">didn't ask</span>}
          </div>
        ))}
      </div>
    </div>

    <div className="ar-dim">
      <div className="ar-dimh">
        <span className="ar-dimt">Requirement gathering</span>
        <span className={`ar-dimscore ar-${s.gather.cls}`}>{s.gather.score}</span>
      </div>
      <ul className="ar-notes">
        {s.gather.notes.map((n, i) => (
          <li key={i} className={`ar-${n.t}`}>
            {noteIcon(n.t)}
            <span><b>{n.h}</b> {n.b}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="ar-dim">
      <div className="ar-dimh">
        <span className="ar-dimt">Communication</span>
        <span className={`ar-dimscore ar-${s.comm.cls}`}>{s.comm.score}</span>
      </div>
      <ul className="ar-notes">
        {s.comm.notes.map((n, i) => (
          <li key={i} className={`ar-${n.t}`}>
            {noteIcon(n.t)}
            <span><b>{n.h}</b> {n.b}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

/* ===== Override panel ===== */
const OV_OPTS: { label: string; cls: 'pass' | 'border' | 'fail'; dotColor: string }[] = [
  { label: 'Ready',       cls: 'pass',   dotColor: '#2f9c4a' },
  { label: 'Almost there', cls: 'border', dotColor: '#cc861d' },
  { label: 'Not ready',   cls: 'fail',   dotColor: '#e21a1a' },
];

/* ===== Score class helper ===== */
const _dimCls = (_c: DimScoreClass) => _c; // used only for TS, the prop is typed already

/* ===== Main component ===== */
export interface AdminReviewQueuePageJSXProps {
  submissions?: Submission[];
  onConfirmApi?: (gradeId: string, override: { outcome: string; note: string } | null) => void;
}

const AdminReviewQueuePageJSX: React.FC<AdminReviewQueuePageJSXProps> = ({ submissions: submissionsProp, onConfirmApi }) => {
  const subs = submissionsProp ?? SUBMISSIONS;
  const [selectedId, setSelectedId]         = useState<number>(1);
  const [reviewed, setReviewed]             = useState<Record<number, string>>({});
  const [filter, setFilter]                 = useState<'pending' | 'all'>('pending');
  const [availFilter, setAvailFilter]       = useState<'all' | 'available' | 'unavailable'>('all');
  const [overrideChoice, setOverrideChoice] = useState<string | null>(null);
  const [ovPanelOpen, setOvPanelOpen]       = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [toastMsg, setToastMsg]             = useState('');
  const [toastVisible, setToastVisible]     = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const ovNoteRef  = useRef<HTMLTextAreaElement>(null);

  /* computed */
  const visibleRows = subs
    .filter(s => filter === 'all' || !reviewed[s.id])
    .filter(s => availFilter === 'all' || (s.avail ? 'available' : 'unavailable') === availFilter)
    .sort((a, b) => (b.avail ? 1 : 0) - (a.avail ? 1 : 0));

  const pendingCount = subs.filter(s => !reviewed[s.id]).length;
  const selectedSub  = subs.find(s => s.id === selectedId) ?? null;

  /* toast */
  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1900);
  }, []);

  /* select */
  const selectSub = useCallback((id: number) => {
    setSelectedId(id);
    setOverrideChoice(null);
    setOvPanelOpen(false);
    setMobileDetailOpen(true);
  }, []);

  /* advance to next pending */
  const nextPending = useCallback((excludeId: number, newReviewed: Record<number, string>) => {
    const next = subs.find(s => !newReviewed[s.id] && s.id !== excludeId);
    setSelectedId(next ? next.id : -1);
    setOvPanelOpen(false);
    setMobileDetailOpen(false);
  }, [subs]);

  /* confirm */
  const confirmSub = useCallback(() => {
    if (!selectedId || selectedId < 0) return;
    const sub = subs.find(s => s.id === selectedId);
    if (sub?.grade_id && onConfirmApi) onConfirmApi(sub.grade_id, null);
    const newReviewed = { ...reviewed, [selectedId]: 'confirmed' };
    setReviewed(newReviewed);
    showToast('Confirmed, student notified');
    nextPending(selectedId, newReviewed);
  }, [selectedId, reviewed, showToast, nextPending, subs, onConfirmApi]);

  /* override */
  const doOverride = useCallback(() => {
    if (!selectedId || selectedId < 0) return;
    const sub = subs.find(s => s.id === selectedId);
    if (sub?.grade_id && onConfirmApi) {
      onConfirmApi(
        sub.grade_id,
        overrideChoice ? { outcome: overrideChoice, note: ovNoteRef.current?.value ?? '' } : null,
      );
    }
    const newReviewed = { ...reviewed, [selectedId]: 'override' };
    setReviewed(newReviewed);
    showToast('Override saved' + (overrideChoice ? ' → ' + overrideChoice : ''));
    setOverrideChoice(null);
    nextPending(selectedId, newReviewed);
  }, [selectedId, reviewed, overrideChoice, showToast, nextPending, subs, onConfirmApi]);

  /* keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'c' || e.key === 'C') {
        confirmSub();
      } else if (e.key === 'o' || e.key === 'O') {
        if (!ovPanelOpen) setOvPanelOpen(true);
        else doOverride();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = visibleRows.findIndex(s => s.id === selectedId);
        if (idx < visibleRows.length - 1) selectSub(visibleRows[idx + 1].id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = visibleRows.findIndex(s => s.id === selectedId);
        if (idx > 0) selectSub(visibleRows[idx - 1].id);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [confirmSub, doOverride, ovPanelOpen, visibleRows, selectedId, selectSub]);

  /* ===== Render ===== */
  const queueEmpty = visibleRows.length === 0;
  const queueClear = selectedId < 0;

  return (
    <div className="ar-shell">

      {/* Mobile status bar */}
      <div className="ar-statusbar">
        <span>9:41</span>
        <span className="ar-sb-icons">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" />
          </svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <path d="M8 2.6c2.1 0 4 .82 5.43 2.16l1.2-1.3A9.4 9.4 0 0 0 8 .9 9.4 9.4 0 0 0 1.37 3.46l1.2 1.3A7.86 7.86 0 0 1 8 2.6Z" fill="currentColor" />
            <path d="M8 6.1c1.16 0 2.21.46 2.98 1.2l1.2-1.3A6.06 6.06 0 0 0 8 4.35c-1.6 0-3.05.62-4.13 1.65l1.2 1.3A4.27 4.27 0 0 1 8 6.1Z" fill="currentColor" />
            <path d="M8 9.6 9.9 7.5A2.7 2.7 0 0 0 8 6.7a2.7 2.7 0 0 0-1.9.8L8 9.6Z" fill="currentColor" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="1" y="1" width="20" height="10" rx="2.6" stroke="currentColor" strokeOpacity=".5" strokeWidth="1" /><rect x="2.6" y="2.6" width="15" height="6.8" rx="1.4" fill="currentColor" /><rect x="22.4" y="4" width="1.6" height="4" rx=".8" fill="currentColor" fillOpacity=".5" />
          </svg>
        </span>
      </div>

      {/* Top bar */}
      <header className="ar-topbar">
        <div className="ar-brand">
          <span className="ar-brand-logo"></span>
          NetPractice
        </div>
        <span className="ar-tag">Review Console</span>
        <span className="ar-spacer"></span>
        <span className="ar-queuecount">
          <QueueCheckIcon />
          <b>{pendingCount}</b> pending
        </span>
        <div className="ar-reviewer">
          <span className="ar-reviewer-av">RH</span>
          <span className="ar-reviewer-nm">Radhika</span>
        </div>
      </header>

      {/* Body */}
      <div className="ar-body">

        {/* Queue pane */}
        <div className="ar-queue">
          <div className="ar-qhead">
            <span className="ar-qtitle">Awaiting review</span>
            <span className="ar-spacer"></span>

            {/* Status filter */}
            <span className="ar-filter">
              {(['pending', 'all'] as const).map(f => (
                <button
                  key={f}
                  className={filter === f ? 'ar-on' : ''}
                  onClick={() => setFilter(f)}
                >
                  {f === 'pending' ? 'Pending' : 'All'}
                </button>
              ))}
            </span>

            <span className="ar-livehint"><span className="ar-lvd"></span>Live</span>

            {/* Availability filter */}
            <span className="ar-filter">
              <button className={availFilter === 'all' ? 'ar-on' : ''} onClick={() => setAvailFilter('all')}>All</button>
              <button className={availFilter === 'available' ? 'ar-on' : ''} onClick={() => setAvailFilter('available')}>
                <span className="ar-fdot ar-on"></span>Available
              </button>
              <button className={availFilter === 'unavailable' ? 'ar-on' : ''} onClick={() => setAvailFilter('unavailable')}>
                <span className="ar-fdot"></span>Off
              </button>
            </span>
          </div>

          <div className="ar-qlist">
            {queueEmpty ? (
              <div className="ar-empty">
                <EmptyQueueIcon />
                <span className="ar-empty-title">Queue clear</span>
                <span style={{ fontSize: 13 }}>All submissions reviewed.</span>
              </div>
            ) : (
              visibleRows.map(s => (
                <button
                  key={s.id}
                  className={[
                    'ar-qrow',
                    selectedId === s.id ? 'ar-sel' : '',
                    reviewed[s.id]     ? 'ar-reviewed' : '',
                    !s.avail           ? 'ar-unavail' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => selectSub(s.id)}
                >
                  <span className="ar-qav">{s.init}</span>
                  <span className="ar-qb">
                    <span className="ar-qtop">
                      <span className="ar-qname">{s.name}</span>
                    </span>
                    <span className="ar-qbrief">{s.brief}</span>
                    <span className="ar-qmeta">
                      <Pill reco={s.reco} label={s.recoLabel} />
                      <AvailTag avail={s.avail} />
                      <MiniChip cls={s.delivery}>{s.deliveryLabel}</MiniChip>
                      <span className="ar-qtime">{s.time}</span>
                    </span>
                  </span>
                  {reviewed[s.id] && (
                    <span className="ar-qcheck"><CheckIcon size={16} /></span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail pane (desktop) */}
        <div className="ar-detail">
          <div className="ar-dscroll">
            {queueClear || !selectedSub ? (
              <div className="ar-empty" style={{ height: '100%' }}>
                <EmptyQueueIcon />
                <span className="ar-empty-title">Queue clear</span>
                <span style={{ fontSize: 13 }}>All submissions reviewed.</span>
              </div>
            ) : (
              <DetailContent s={selectedSub} />
            )}
          </div>

          {/* Action bar */}
          {!queueClear && selectedSub && (
            <div className="ar-actions">
              <div className={`ar-ovpanel${ovPanelOpen ? ' ar-show' : ''}`}>
                <div className="ar-ovt">Override outcome</div>
                <div className="ar-ovopts">
                  {OV_OPTS.map(opt => (
                    <button
                      key={opt.label}
                      className={[
                        'ar-ovopt ar-' + opt.cls,
                        overrideChoice === opt.label ? 'ar-on' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setOverrideChoice(prev => prev === opt.label ? null : opt.label)}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: opt.dotColor, display: 'inline-block' }}></span>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <textarea ref={ovNoteRef} placeholder="Reason for override (team-visible, not the student)…" />
              </div>
              <div className="ar-actionrow">
                <span className="ar-hintkey">
                  Decide in ~2 min · <kbd>C</kbd> confirm · <kbd>O</kbd> override · <kbd>↓</kbd> next
                </span>
                <button
                  className="ar-btn ar-override"
                  onClick={() => {
                    if (!ovPanelOpen) setOvPanelOpen(true);
                    else doOverride();
                  }}
                >
                  <EditIcon />
                  {ovPanelOpen ? 'Save override' : 'Override'}
                </button>
                <button className="ar-btn ar-confirm" onClick={confirmSub}>
                  <CheckIcon size={16} />
                  Confirm AI call
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile detail overlay */}
      <div className={`ar-mdetail${mobileDetailOpen ? ' ar-show' : ''}`}>
        <div className="ar-mbar">
          <button aria-label="Back" onClick={() => setMobileDetailOpen(false)}><BackIcon /></button>
          <span className="ar-mtitle">{selectedSub?.name ?? 'Submission'}</span>
        </div>
        <div className="ar-dscroll" style={{ flex: 1, overflowY: 'auto' }}>
          {selectedSub && <DetailContent s={selectedSub} />}
        </div>
        {selectedSub && (
          <div className="ar-actions">
            <div className="ar-actionrow" style={{ gap: 8 }}>
              <button className="ar-btn ar-override" style={{ flex: 1 }} onClick={doOverride}>
                <EditIcon />Override
              </button>
              <button className="ar-btn ar-confirm" style={{ flex: 1.4 }} onClick={confirmSub}>
                <CheckIcon size={16} />Confirm
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      <div className={`ar-toast${toastVisible ? ' ar-show' : ''}`}>
        <CheckIcon size={17} />
        <span>{toastMsg}</span>
      </div>

    </div>
  );
};

export default AdminReviewQueuePageJSX;
