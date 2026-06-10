import { type FC, useState, useEffect } from 'react';
import type { Company } from '../companiesWantYouPageData';
import { PASS_REASONS } from '../companiesWantYouPageData';

export interface CompaniesWantYouPageJSXProps {
  shown: Company[];
  leavingIds: Set<string>;
  enteringId: string | null;
  allClear: boolean;
  countText: string;
  sheetOpen: boolean;
  pendingCompany: Company | null;
  reasonbarOpen: boolean;
  reasonbarTitle: string;
  toastVisible: boolean;
  toastMessage: string;
  onYes: (id: string) => void;
  onPass: (id: string) => void;
  onSheetConfirm: () => void;
  onSheetCancel: () => void;
  onReasonbarClose: () => void;
  onReasonPick: (reason: string) => void;
  onBack: () => void;
}

function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean);
  return ((parts[0] ?? '')[0] ?? '') + ((parts[1] ?? '')[0] ?? '');
}

const PinIcon: FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="2.6"/>
  </svg>
);

const ModeIcon: FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="13" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);

const CoinIcon: FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M14.5 9.5A2.5 2.5 0 0 0 12 8c-1.4 0-2.5.9-2.5 2s1.1 2 2.5 2 2.5.9 2.5 2-1.1 2-2.5 2a2.5 2.5 0 0 1-2.5-1.5M12 6.5v11"/>
  </svg>
);

const ClockIcon: FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2"/>
  </svg>
);

interface CheckIconProps { size?: number; weight?: number; }
const CheckIcon: FC<CheckIconProps> = ({ size = 14, weight = 2.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

const CompaniesWantYouPageJSX: FC<CompaniesWantYouPageJSXProps> = ({
  shown, leavingIds, enteringId, allClear, countText,
  sheetOpen, pendingCompany, reasonbarOpen, reasonbarTitle,
  toastVisible, toastMessage,
  onYes, onPass, onSheetConfirm, onSheetCancel,
  onReasonbarClose, onReasonPick, onBack,
}) => {
  const [pickedReason, setPickedReason] = useState<string | null>(null);

  useEffect(() => {
    if (reasonbarOpen) setPickedReason(null);
  }, [reasonbarOpen]);

  const handleReasonChip = (reason: string) => {
    setPickedReason(reason);
    onReasonPick(reason);
  };

  return (
    <div className="cwy-shell">

      {/* Status bar — mobile only */}
      <div className="cwy-statusbar">
        <span>9:41</span>
        <span className="icons">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <rect x="0" y="7" width="3" height="4" rx="1"/>
            <rect x="4.5" y="5" width="3" height="6" rx="1"/>
            <rect x="9" y="2.5" width="3" height="8.5" rx="1"/>
            <rect x="13.5" y="0" width="3" height="11" rx="1"/>
          </svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <path d="M8 2.6c2.1 0 4 .82 5.43 2.16l1.2-1.3A9.4 9.4 0 0 0 8 .9 9.4 9.4 0 0 0 1.37 3.46l1.2 1.3A7.86 7.86 0 0 1 8 2.6Z" fill="currentColor"/>
            <path d="M8 6.1c1.16 0 2.21.46 2.98 1.2l1.2-1.3A6.06 6.06 0 0 0 8 4.35c-1.6 0-3.05.62-4.13 1.65l1.2 1.3A4.27 4.27 0 0 1 8 6.1Z" fill="currentColor"/>
            <path d="M8 9.6 9.9 7.5A2.7 2.7 0 0 0 8 6.7a2.7 2.7 0 0 0-1.9.8L8 9.6Z" fill="currentColor"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="1" y="1" width="20" height="10" rx="2.6" stroke="currentColor" strokeOpacity=".5" strokeWidth="1"/>
            <rect x="2.6" y="2.6" width="15" height="6.8" rx="1.4" fill="currentColor"/>
            <rect x="22.4" y="4" width="1.6" height="4" rx=".8" fill="currentColor" fillOpacity=".5"/>
          </svg>
        </span>
      </div>

      {/* App bar */}
      <header className="cwy-appbar">
        {/* Mobile nav */}
        <div className="cwy-nav-m">
          <button className="cwy-iconbtn" aria-label="Back" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span className="cwy-appbar-title">Interest</span>
          <span className="cwy-spacer" />
        </div>
        {/* Desktop nav */}
        <div className="cwy-nav-d">
          <div className="cwy-brand">
            <span className="cwy-brand-logo"><span /><span /><span /><span /></span>
            NetPractice
          </div>
          <nav className="cwy-nav">
            <a href="/">Dashboard</a>
            <a href="#" className="cur">Interest</a>
            <a href="/placement/status">Placement</a>
          </nav>
          <span className="cwy-spacer" />
        </div>
      </header>

      {/* Scrollable content */}
      <div className="cwy-scroll">
        <div className="cwy-content">

          {/* Intro */}
          {!allClear && (
            <div className="cwy-intro">
              <h1>Companies want you</h1>
              <p>Each one picked you. Say yes to talk, or pass. Saying yes confirms you can still start in 15 days.</p>
              <span className="cwy-countline">
                <span className="cwy-pulse" />
                <span>{countText}</span>
              </span>
            </div>
          )}

          {/* Cards */}
          {!allClear && (
            <div className="cwy-cards">
              {shown.map(c => (
                <div
                  key={c.id}
                  className={`cwy-card${leavingIds.has(c.id) ? ' leaving' : ''}${enteringId === c.id ? ' entering' : ''}`}
                >
                  <span className="cwy-picked">
                    <span className="cwy-picked-dot" />
                    Picked you
                  </span>

                  <div className="cwy-chead">
                    <span className="cwy-cav" style={{ background: c.av }}>{initials(c.name)}</span>
                    <div className="cwy-cinfo">
                      <div className="cwy-cname">{c.name}</div>
                      <div className="cwy-cwhat">{c.what}</div>
                    </div>
                  </div>

                  <p className="cwy-cwant">{c.want}</p>

                  <div className="cwy-cmeta">
                    <span className="cwy-mchip"><PinIcon />{c.loc}</span>
                    <span className="cwy-mchip"><ModeIcon />{c.mode}</span>
                    <span className="cwy-mchip"><CoinIcon />{c.pay}</span>
                    <span className="cwy-mchip"><ClockIcon />{c.dur}</span>
                  </div>

                  <div className="cwy-cspacer" />

                  <div className="cwy-cactions">
                    <button className="cwy-btn yes" onClick={() => onYes(c.id)}>Yes, interview me</button>
                    <button className="cwy-btn pass" onClick={() => onPass(c.id)}>Pass</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All-clear empty state */}
          <div className={`cwy-allclear${allClear ? ' show' : ''}`}>
            <span className="cwy-ac-ic">
              <CheckIcon size={28} weight={2} />
            </span>
            <h2>You're all caught up</h2>
            <p>You've responded to everyone for now. When another company picks you, it'll show up right here.</p>
          </div>

          {/* Footer reassurance */}
          {!allClear && (
            <div className="cwy-foot">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5"/>
                <path d="M12 16v-4M12 8.5v.01"/>
              </svg>
              <span>These companies reached out to you. Passing is always free — it never affects who sees you next.</span>
            </div>
          )}

        </div>
      </div>

      {/* YES confirmation sheet */}
      <div
        className={`cwy-scrim${sheetOpen ? ' show' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) onSheetCancel(); }}
      >
        <div className="cwy-sheet" role="dialog" aria-modal="true">
          <span className="cwy-shav" style={{ background: pendingCompany?.av ?? 'var(--np-primary)' }}>
            {pendingCompany ? initials(pendingCompany.name) : ''}
          </span>
          <h3>Interview with {pendingCompany?.name ?? '—'}</h3>
          <p className="cwy-sline">One tap sets this up. Here's everything it does:</p>
          <div className="cwy-fused">
            <div className="cwy-frow">
              <span className="cwy-fk"><CheckIcon /></span>
              <span>You agree to talk with <b>{pendingCompany?.name ?? 'them'}</b></span>
            </div>
            <div className="cwy-frow">
              <span className="cwy-fk"><CheckIcon /></span>
              <span>You confirm you can still start within <b>15 days</b></span>
            </div>
            <div className="cwy-frow">
              <span className="cwy-fk"><CheckIcon /></span>
              <span>We book the interview and let them know</span>
            </div>
          </div>
          <div className="cwy-srow">
            <button className="cwy-scancel" onClick={onSheetCancel}>Not now</button>
            <button className="cwy-syes" onClick={onSheetConfirm}>
              Yes, interview me
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Pass reason bar — non-blocking */}
      <div className={`cwy-reasonbar${reasonbarOpen ? ' show' : ''}`}>
        <div className="cwy-rb-top">
          <span className="cwy-rb-t">{reasonbarTitle}</span>
          <span className="cwy-rb-s">Reason optional</span>
          <button className="cwy-rb-x" aria-label="Dismiss" onClick={onReasonbarClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="cwy-rb-chips">
          {PASS_REASONS.map(reason => (
            <button
              key={reason}
              className={`cwy-rchip${pickedReason === reason ? ' picked' : ''}`}
              onClick={() => handleReasonChip(reason)}
            >
              {reason}
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      <div className={`cwy-toast${toastVisible ? ' show' : ''}`}>
        <CheckIcon size={17} weight={2.6} />
        <span>{toastMessage}</span>
      </div>

      {/* Home bar (iOS indicator) */}
      <div className="cwy-homebar"><i /></div>

    </div>
  );
};

export default CompaniesWantYouPageJSX;
