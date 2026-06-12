import { type FC } from 'react';

export interface ReAssessmentIntroPageJSXProps {
  onCTAClick: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const ReAssessmentIntroPageJSX: FC<ReAssessmentIntroPageJSXProps> = ({ onCTAClick, onBack, isLoading }) => {
  return (
    <div className="rai-shell">
      <header className="rai-appbar">
        {/* Mobile nav */}
        <div className="rai-nav-m">
          <button className="rai-iconbtn" aria-label="Back" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="rai-appbar-title">Re-assessment</span>
          <span className="rai-appbar-spacer" />
          <button className="rai-iconbtn" aria-label="Help">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M9.6 9.2a2.4 2.4 0 0 1 4.7.7c0 1.6-2.4 2.4-2.4 2.4" />
              <line x1="12" y1="16.6" x2="12" y2="16.7" />
            </svg>
          </button>
        </div>

        {/* Desktop nav */}
        <div className="rai-nav-d">
          <div className="rai-brand">
            <span className="rai-brand-logo">
              <span /><span /><span /><span />
            </span>
            NetPractice
          </div>
          <nav className="rai-nav">
            <a href="#">Dashboard</a>
            <a href="#" className="active">Assessment</a>
            <a href="#">Placements</a>
          </nav>
          <span className="rai-appbar-spacer" />
          <button className="rai-help-btn">Need help?</button>
        </div>
      </header>

      <div className="rai-scroll">
        <div className="rai-layout">
          <div className="rai-content">
            <div className="rai-htext">
              <div className="rai-badge">Second attempt</div>
              <h1>One more shot.</h1>
              <p>Your first attempt didn't clear the bar. Here's another chance — same project, same standard. Use what you learned.</p>
            </div>

            <div className="rai-steps">
              {/* Step 1 */}
              <div className="rai-step">
                <div className="rai-stepicon">
                  <span className="rai-num">1</span>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.1a8.38 8.38 0 0 1-.9-3.9 8.5 8.5 0 0 1 8.4-8.5h.5A8.48 8.48 0 0 1 21 11v.5Z" />
                    <line x1="8.5" y1="10.5" x2="15.5" y2="10.5" />
                    <line x1="8.5" y1="13.8" x2="13" y2="13.8" />
                  </svg>
                </div>
                <div className="rai-steptext">
                  <span className="rai-step-label">Step 1</span>
                  <h3>Talk to the client again</h3>
                  <p>The brief hasn't changed. This time, ask sharper questions and listen more carefully.</p>
                </div>
              </div>

              <span className="rai-arrow">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>

              {/* Step 2 */}
              <div className="rai-step">
                <div className="rai-stepicon">
                  <span className="rai-num">2</span>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <div className="rai-steptext">
                  <span className="rai-step-label">Step 2</span>
                  <h3>Build it right</h3>
                  <p>Ship a working app that solves what the client asked. Use any AI tools you want.</p>
                </div>
              </div>

              <span className="rai-arrow">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>

              {/* Step 3 */}
              <div className="rai-step">
                <div className="rai-stepicon">
                  <span className="rai-num">3</span>
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
                <div className="rai-steptext">
                  <span className="rai-step-label">Step 3</span>
                  <h3>Submit</h3>
                  <p>Send your repo and live link. You'll get honest feedback on where you stand.</p>
                </div>
              </div>
            </div>

            <div className="rai-focus">
              <div className="rai-focus-header">
                <span className="rai-focus-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                <h4>What to focus on this time</h4>
              </div>

              <div className="rai-focus-item">
                <span className="rai-focus-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <span className="rai-focus-item-text">
                  Scope creep is the top reason first builds miss the mark. Build exactly what the client asks — nothing more.
                </span>
              </div>

              <div className="rai-focus-item">
                <span className="rai-focus-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <span className="rai-focus-item-text">
                  The deadline is firm. Plan your time before you start coding — late work shows in your result.
                </span>
              </div>
            </div>
          </div>

          <div className="rai-ctabar">
            <button className="rai-cta" onClick={onCTAClick} disabled={isLoading}>
              {isLoading ? 'Starting…' : 'Talk to the client'}
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <p className="rai-ctahelp">Re-read your previous feedback before you begin.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReAssessmentIntroPageJSX;
