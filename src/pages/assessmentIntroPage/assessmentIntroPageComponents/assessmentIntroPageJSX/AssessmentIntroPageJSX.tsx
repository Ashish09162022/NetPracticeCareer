import { type FC } from 'react';

export interface AssessmentIntroPageJSXProps {
  onCTAClick: () => void;
  onBack: () => void;
}

const AssessmentIntroPageJSX: FC<AssessmentIntroPageJSXProps> = ({ onCTAClick, onBack }) => {
  return (
    <div className="ai-shell">
      <header className="ai-appbar">
        {/* Mobile nav */}
        <div className="ai-nav-m">
          <button className="ai-iconbtn" aria-label="Back" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="ai-appbar-title">Assessment</span>
          <span className="ai-appbar-spacer" />
          <button className="ai-iconbtn" aria-label="Help">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M9.6 9.2a2.4 2.4 0 0 1 4.7.7c0 1.6-2.4 2.4-2.4 2.4" />
              <line x1="12" y1="16.6" x2="12" y2="16.7" />
            </svg>
          </button>
        </div>

        {/* Desktop nav */}
        <div className="ai-nav-d">
          <div className="ai-brand">
            <span className="ai-brand-logo">
              <span /><span /><span /><span />
            </span>
            NetPractice
          </div>
          <nav className="ai-nav">
            <a href="#">Dashboard</a>
            <a href="#" className="active">Assessment</a>
            <a href="#">Placements</a>
          </nav>
          <span className="ai-appbar-spacer" />
          <button className="ai-help-btn">Need help?</button>
        </div>
      </header>

      <div className="ai-scroll">
        <div className="ai-layout">
          <div className="ai-content">
            <div className="ai-htext">
              <h1>Build something real.</h1>
              <p>A real business needs something built. You'll scope it, build it, and ship it. Here's how it works.</p>
            </div>

            <div className="ai-steps">
              {/* Step 1 */}
              <div className="ai-step">
                <div className="ai-stepicon">
                  <span className="ai-num">1</span>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.1a8.38 8.38 0 0 1-.9-3.9 8.5 8.5 0 0 1 8.4-8.5h.5A8.48 8.48 0 0 1 21 11v.5Z" />
                    <line x1="8.5" y1="10.5" x2="15.5" y2="10.5" />
                    <line x1="8.5" y1="13.8" x2="13" y2="13.8" />
                  </svg>
                </div>
                <div className="ai-steptext">
                  <span className="ai-step-label">Step 1</span>
                  <h3>Talk to a client</h3>
                  <p>An owner tells you what they need. Ask sharp questions until the job is clear.</p>
                </div>
              </div>

              <span className="ai-arrow">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>

              {/* Step 2 */}
              <div className="ai-step">
                <div className="ai-stepicon">
                  <span className="ai-num">2</span>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <div className="ai-steptext">
                  <span className="ai-step-label">Step 2</span>
                  <h3>Build it</h3>
                  <p>Build and ship a working web app. Use any AI tools you want.</p>
                </div>
              </div>

              <span className="ai-arrow">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>

              {/* Step 3 */}
              <div className="ai-step">
                <div className="ai-stepicon">
                  <span className="ai-num">3</span>
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
                <div className="ai-steptext">
                  <span className="ai-step-label">Step 3</span>
                  <h3>Submit</h3>
                  <p>Send your repo and live link. You'll get clear feedback on where you stand.</p>
                </div>
              </div>
            </div>

            <div className="ai-rules">
              <div className="ai-rules-header">
                <span className="ai-rules-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9.5" />
                    <line x1="12" y1="11" x2="12" y2="16.5" />
                    <line x1="12" y1="7.6" x2="12" y2="7.7" />
                  </svg>
                </span>
                <h4>Two rules</h4>
              </div>

              <div className="ai-rule">
                <span className="ai-rule-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2" />
                    <line x1="6" y1="10" x2="6" y2="10" />
                    <line x1="10" y1="10" x2="10" y2="10" />
                    <line x1="14" y1="10" x2="14" y2="10" />
                    <line x1="18" y1="10" x2="18" y2="10" />
                    <line x1="8" y1="14" x2="16" y2="14" />
                  </svg>
                </span>
                <span className="ai-rule-text">
                  In the chat, you type every reply by hand. No pasting. We're checking how you communicate, not how fast you copy.
                </span>
              </div>

              <div className="ai-rule">
                <span className="ai-rule-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <span className="ai-rule-text">
                  The client sets a deadline. Deliver on time. Late work shows in your result.
                </span>
              </div>
            </div>
          </div>

          <div className="ai-ctabar">
            <button className="ai-cta" onClick={onCTAClick}>
              Talk to the client
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <p className="ai-ctahelp">Read the full brief before you reply. Take your time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentIntroPageJSX;
