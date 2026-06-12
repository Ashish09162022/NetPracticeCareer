import { type FC, useState, useCallback } from 'react';

const URL_RE = /[a-z0-9-]+\.[a-z]{2,}/i;

export interface BuildSubmissionPageJSXProps {
  deadlineSoft: string | null;
  deadlineHard: string | null;
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmit: (repo: string, live: string, notes: string) => void;
}

const BuildSubmissionPageJSX: FC<BuildSubmissionPageJSXProps> = ({ onBack, onSubmit, isSubmitting }) => {
  const [repoVal, setRepoVal] = useState('');
  const [liveVal, setLiveVal] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const repoOk = URL_RE.test(repoVal);
  const liveOk = URL_RE.test(liveVal);
  const canSubmit = repoOk && liveOk;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    setSubmitted(true);
    onSubmit(repoVal, liveVal, notes);
  }, [canSubmit, repoVal, liveVal, notes, onSubmit]);

  return (
    <div className="bsp-shell">
      <header className="bsp-appbar">
        {/* Mobile nav */}
        <div className="bsp-nav-m">
          <button className="bsp-iconbtn" aria-label="Back" onClick={onBack}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="bsp-appbar-title">Submit your build</span>
          <button className="bsp-iconbtn" aria-label="Help">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>

        {/* Desktop nav */}
        <div className="bsp-nav-d">
          <div className="bsp-brand">
            <span className="bsp-brand-logo">
              <span /><span /><span /><span />
            </span>
            NetPractice
          </div>
          <nav className="bsp-appbar-nav">
            <a href="#">Dashboard</a>
            <a href="#" className="active">Assessment</a>
            <a href="#">Placements</a>
          </nav>
          <div className="bsp-appbar-spacer" />
          <button className="bsp-help-btn">Need help?</button>
        </div>
      </header>

      <div className="bsp-scroll">
        <div className="bsp-layout">
          <div className="bsp-content">

            {/* Page header */}
            <div className="bsp-header">
              <h1 className="bsp-page-title">Submit your build</h1>
              <p className="bsp-page-subtitle">Send your work for Dr. Mehta's clinic. Check both links open before you submit.</p>
            </div>

            {/* Deadline banner */}
            <div className="bsp-deadline bsp-deadline--late">
              <div className="bsp-dl-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="bsp-dl-body">
                <span className="bsp-dl-status">Late, still accepted</span>
                <span className="bsp-dl-time">In grace period · <b>3h 40m</b> left</span>
                <span className="bsp-dl-sub">Client asked for 48 hours. Submitting now is noted, still graded.</span>
              </div>
            </div>

            {/* Form */}
            <div className="bsp-form">

              {/* Repository link */}
              <div className={`bsp-field${repoVal && repoOk ? ' bsp-field--ok' : ''}`}>
                <label className="bsp-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="bsp-label-icon">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Repository link
                </label>
                <div className="bsp-input-wrap">
                  <span className="bsp-input-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <input
                    type="url"
                    className="bsp-input"
                    placeholder="github.com/your-username/project"
                    value={repoVal}
                    onChange={e => setRepoVal(e.target.value)}
                    autoComplete="off"
                  />
                  {repoVal && repoOk && (
                    <span className="bsp-input-check">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              {/* Deployed link */}
              <div className={`bsp-field${liveVal && liveOk ? ' bsp-field--ok' : ''}`}>
                <label className="bsp-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bsp-label-icon">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Deployed link
                </label>
                <div className="bsp-input-wrap">
                  <span className="bsp-input-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </span>
                  <input
                    type="url"
                    className="bsp-input"
                    placeholder="your-project.vercel.app"
                    value={liveVal}
                    onChange={e => setLiveVal(e.target.value)}
                    autoComplete="off"
                  />
                  {liveVal && liveOk && (
                    <span className="bsp-input-check">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bsp-field">
                <label className="bsp-label">
                  Notes to the client
                  <span className="bsp-optional">Optional</span>
                </label>
                <textarea
                  className="bsp-textarea"
                  placeholder="Anything Dr. Mehta should know: test login, a feature you're proud of, a known limitation."
                  maxLength={300}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <div className="bsp-char-count">{notes.length}/300</div>
              </div>

              {/* Submit */}
              <button
                className="bsp-submit-btn"
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Submitting…' : 'Submit build'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

              {/* Reassurance */}
              <div className="bsp-reassurance">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#43a85a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                You'll get clear feedback on what you nailed and what to fix.
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* End state overlay */}
      {submitted && (
        <div className="bsp-endstate">
          <div className="bsp-endstate-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#43a85a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="bsp-endstate-title">Build submitted</h2>
          <p className="bsp-endstate-sub">We're checking your work against Dr. Mehta's requirements. Your report is ready shortly.</p>
        </div>
      )}
    </div>
  );
};

export default BuildSubmissionPageJSX;
