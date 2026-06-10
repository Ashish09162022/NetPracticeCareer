import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';

/* ===== Icons ===== */
const CheckIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const CalendarIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const DotCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const BellIcon = () => (
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

const BriefcaseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h18v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />
    <path d="M3 7l3-4h12l3 4" />
    <path d="M9 12h6" />
  </svg>
);

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const VideoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 7l-7 5 7 5V7Z" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

const SmallCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/* ===== Logo mark ===== */
const BrandLogo = () => (
  <span className="st-brand-logo">
    <span></span>
  </span>
);

/* ===== Interview card content (shared between mobile + desktop) ===== */
const InterviewCardContent = () => (
  <>
    <div className="st-interview">
      <span className="st-ico"><BriefcaseIcon size={20} /></span>
      <div className="st-iv">
        <div className="st-co">Sharda Tech Solutions</div>
        <div className="st-role">Junior Web Developer · Raipur (Hybrid)</div>
      </div>
    </div>
    <div className="st-when">
      <span className="st-wchip"><CalendarIcon size={15} />Tue, 10 June</span>
      <span className="st-wchip"><ClockIcon />11:30 AM</span>
      <span className="st-wchip"><VideoIcon />Video call</span>
    </div>
    <div className="st-prep"><SmallCheckIcon />We'll send a calendar invite and joining link 24 hours before.</div>
  </>
);

/* ===== Main component ===== */
export interface StatusTrackerPageJSXProps {}

const StatusTrackerPageJSX: React.FC<StatusTrackerPageJSXProps> = () => {
  const navigate = useNavigate();

  return (
    <div className="st-shell">

      {/* Mobile status bar */}
      <div className="st-statusbar">
        <span>9:41</span>
        <span className="st-sb-icons">
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
      <header className="st-appbar">
        {/* Mobile nav */}
        <button className="st-iconbtn st-nav-m" aria-label="Back" onClick={() => navigate(PathFor.homePage)}>
          <BackIcon />
        </button>
        <span className="st-title st-nav-m">Placement status</span>
        <span className="st-spacer st-nav-m"></span>
        <button className="st-iconbtn st-nav-m" aria-label="Notifications">
          <BellIcon />
        </button>

        {/* Desktop nav */}
        <div className="st-nav-d">
          <div className="st-brand">
            <BrandLogo />
            NetPractice
          </div>
          <nav className="st-nav-links">
            <a href="#">Dashboard</a>
            <a href="#" className="st-nav-cur">Placement</a>
            <a href="#">Profile</a>
          </nav>
          <span className="st-spacer"></span>
          <div className="st-avatar">AV</div>
        </div>
      </header>

      {/* Scroll area */}
      <div className="st-scroll">
        <div className="st-layout">

          {/* Hero */}
          <div className="st-hero">
            <h1>Your placement status</h1>
            <p>You passed and you're in the pool. Here's where things stand. We'll update it as you move forward.</p>
          </div>

          {/* Stepper */}
          <div className="st-stepper">

            {/* Step 1: Done — In the placement pool */}
            <div className="st-snode st-done">
              <div className="st-rail">
                <span className="st-mk"><CheckIcon /></span>
                <span className="st-line"></span>
              </div>
              <div className="st-scontent">
                <div className="st-slab">Done</div>
                <div className="st-stitle">In the placement pool</div>
                <div className="st-sdesc">You passed and qualified for the placement pool.</div>
              </div>
            </div>

            {/* Step 2: Done — Matched with a company */}
            <div className="st-snode st-done">
              <div className="st-rail">
                <span className="st-mk"><CheckIcon /></span>
                <span className="st-line"></span>
              </div>
              <div className="st-scontent">
                <div className="st-slab">Done</div>
                <div className="st-stitle">Matched with a company</div>
                <div className="st-sdesc">A hiring partner shortlisted your profile.</div>
              </div>
            </div>

            {/* Step 3: Active — Interview scheduled */}
            <div className="st-snode st-active">
              <div className="st-rail">
                <span className="st-mk"><CalendarIcon /></span>
                <span className="st-line"></span>
              </div>
              <div className="st-scontent">
                <div className="st-slab">Current</div>
                <div className="st-stitle">Interview scheduled</div>
                <div className="st-sdesc">Your first-round interview is booked. Details below.</div>
                {/* Mobile contextual card */}
                <div className="st-scard">
                  <InterviewCardContent />
                </div>
              </div>
            </div>

            {/* Step 4: Upcoming — Placement confirmed */}
            <div className="st-snode st-upcoming">
              <div className="st-rail">
                <span className="st-mk"><DotCircleIcon /></span>
                <span className="st-line"></span>
              </div>
              <div className="st-scontent">
                <div className="st-slab">Upcoming</div>
                <div className="st-stitle">Placement confirmed</div>
                <div className="st-sdesc">Final step once your interview goes well.</div>
              </div>
            </div>

          </div>

          {/* Desktop contextual card — full width below horizontal stepper */}
          <div className="st-deskcard st-scard-inner">
            <InterviewCardContent />
          </div>

        </div>
      </div>

      {/* Mobile home bar */}
      <div className="st-homebar"><i></i></div>

    </div>
  );
};

export default StatusTrackerPageJSX;
