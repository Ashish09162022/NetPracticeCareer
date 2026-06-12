import React from 'react';

/* ===== Icons ===== */
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FlagIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22V4" />
    <path d="M4 4h13l-2.5 4L17 12H4" fill="currentColor" fillOpacity=".14" />
  </svg>
);

const InfoIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 16v-4M12 8.5v.01" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/* ===== Brand Logo ===== */
const BrandLogo = () => (
  <span className="ma-brand-logo">
    <span></span>
  </span>
);

/* ===== Main component ===== */
export interface MarkAvailablePageJSXProps {
  onConfirm: () => void;
  onNotNow: () => void;
  isSaving?: boolean;
}

const MarkAvailablePageJSX: React.FC<MarkAvailablePageJSXProps> = ({ onConfirm, onNotNow, isSaving }) => {

  return (
    <div className="ma-shell">

      {/* Mobile status bar */}
      <div className="ma-statusbar">
        <span>9:41</span>
        <span className="ma-sb-icons">
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

      {/* App bar */}
      <header className="ma-appbar">
        {/* Mobile nav */}
        <button className="ma-iconbtn ma-nav-m" aria-label="Back" onClick={onNotNow}>
          <BackIcon />
        </button>
        <span className="ma-title ma-nav-m">Availability</span>
        <span className="ma-spacer ma-nav-m"></span>

        {/* Desktop nav */}
        <div className="ma-nav-d">
          <div className="ma-brand">
            <BrandLogo />
            NetPractice
          </div>
          <nav className="ma-nav-links">
            <a href="#">Dashboard</a>
            <a href="#" className="ma-nav-cur">Availability</a>
            <a href="#">Placements</a>
          </nav>
          <span className="ma-spacer"></span>
        </div>
      </header>

      {/* Scroll area */}
      <div className="ma-scroll">
        <div className="ma-layout">
          <div className="ma-content">

            {/* Hero */}
            <div className="ma-htext">
              <h1>Ready to start?</h1>
              <p>Tell us you can begin within 15 days. Next you prove you can build. Pass that and you're in the pool.</p>
            </div>

            {/* Commitment card */}
            <div className="ma-commit">
              <span className="ma-cic"><CalendarIcon /></span>
              <div className="ma-ctxt">
                <div className="ma-clab">I can begin within</div>
                <div className="ma-cbig">15 days</div>
              </div>
              <span className="ma-cflag"><FlagIcon /></span>
            </div>

            {/* Expectation note */}
            <p className="ma-expect">
              <span className="ma-ei"><InfoIcon /></span>
              <span>This is the start, not the finish — your skills get verified next. The assessment is the way in, not a hurdle.</span>
            </p>

          </div>

          {/* CTA bar */}
          <div className="ma-ctabar">
            <button className="ma-cta" onClick={onConfirm} disabled={isSaving}>
              {isSaving ? 'Saving…' : "Confirm I'm ready"}
              <ArrowIcon />
            </button>
            <button className="ma-notnow" onClick={onNotNow}>Not yet</button>
          </div>
        </div>
      </div>

      {/* Mobile home indicator bar */}
      <div className="ma-homebar"><i></i></div>

    </div>
  );
};

export default MarkAvailablePageJSX;
