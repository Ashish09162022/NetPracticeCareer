import { type FC } from 'react';

export interface GradingPageJSXProps {
  onBack: () => void;
}

const GradingPageJSX: FC<GradingPageJSXProps> = ({ onBack }) => {
  return (
    <div className="gip-shell">
      <header className="gip-appbar">
        {/* Mobile nav */}
        <div className="gip-nav-m">
          <button className="gip-iconbtn" aria-label="Back" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="gip-appbar-title">Assessment</span>
          <span className="gip-appbar-spacer" />
        </div>

        {/* Desktop nav */}
        <div className="gip-nav-d">
          <div className="gip-brand">
            <span className="gip-brand-logo">
              <span /><span /><span /><span />
            </span>
            NetPractice
          </div>
          <nav className="gip-nav">
            <a href="#">Dashboard</a>
            <a href="#" className="active">Assessment</a>
            <a href="#">Placements</a>
          </nav>
          <span className="gip-appbar-spacer" />
        </div>
      </header>

      <div className="gip-scroll">
        <div className="gip-layout">
          <div className="gip-content">

            {/* Hero */}
            <div className="gip-hero">
              <div className="gip-loader-wrap">
                <div className="gip-loader-ring" />
                <div className="gip-loader-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
              </div>

              <h1 className="gip-title">Grading in progress</h1>
              <p className="gip-subtitle">
                Our team is reviewing your submission. You'll be notified as soon as your result is ready.
              </p>

              <div className="gip-eta-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Usually within 24 hours
              </div>
            </div>

            {/* Submission card */}
            <div className="gip-section">
              <h2 className="gip-section-label">Submitted build</h2>
              <div className="gip-submission-card">
                <div className="gip-sub-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <div className="gip-sub-info">
                  <span className="gip-sub-name">Inventory Manager App</span>
                  <span className="gip-sub-meta">Submitted just now</span>
                </div>
                <div className="gip-sub-badge">
                  <span className="gip-dot-pulse" />
                  Under review
                </div>
              </div>
            </div>

            {/* Evaluation criteria */}
            <div className="gip-section">
              <h2 className="gip-section-label">What we're grading</h2>
              <div className="gip-criteria-list">
                <div className="gip-criterion gip-criterion--active">
                  <span className="gip-crit-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.1a8.38 8.38 0 0 1-.9-3.9 8.5 8.5 0 0 1 8.4-8.5h.5A8.48 8.48 0 0 1 21 11v.5Z" />
                    </svg>
                  </span>
                  <div className="gip-crit-text">
                    <span className="gip-crit-name">Client communication</span>
                    <span className="gip-crit-desc">How well you scoped the project in the chat</span>
                  </div>
                  <span className="gip-crit-status gip-crit-status--active">
                    <span className="gip-mini-ring" />
                    Reviewing
                  </span>
                </div>

                <div className="gip-criterion gip-criterion--pending">
                  <span className="gip-crit-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </span>
                  <div className="gip-crit-text">
                    <span className="gip-crit-name">Code quality</span>
                    <span className="gip-crit-desc">Structure, readability, and best practices</span>
                  </div>
                  <span className="gip-crit-status gip-crit-status--pending">Queued</span>
                </div>

                <div className="gip-criterion gip-criterion--pending">
                  <span className="gip-crit-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </span>
                  <div className="gip-crit-text">
                    <span className="gip-crit-name">Working product</span>
                    <span className="gip-crit-desc">Does the live app meet the client's requirements</span>
                  </div>
                  <span className="gip-crit-status gip-crit-status--pending">Queued</span>
                </div>

                <div className="gip-criterion gip-criterion--pending">
                  <span className="gip-crit-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>
                  <div className="gip-crit-text">
                    <span className="gip-crit-name">Delivery timing</span>
                    <span className="gip-crit-desc">Whether you met the client's deadline</span>
                  </div>
                  <span className="gip-crit-status gip-crit-status--pending">Queued</span>
                </div>
              </div>
            </div>

            {/* Notification note */}
            <div className="gip-notify-box">
              <span className="gip-notify-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              <p className="gip-notify-text">
                We'll send you a notification when your grading is complete. Check back here any time to see your result.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingPageJSX;
