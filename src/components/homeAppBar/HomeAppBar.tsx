import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';

export interface HomeAppBarProps {
  initials?: string;
}

const HomeAppBar: React.FC<HomeAppBarProps> = ({ initials = 'AR' }) => {
  const navigate = useNavigate();

  return (
    <header className="hp-appbar">
      <div className="hp-brand">
        <span className="hp-brand-logo">
          <span /><span className="dim" /><span className="dim" /><span />
        </span>
        <span className="hp-brand-name">
          <b>NetPractice</b>
        </span>
      </div>

      <nav className="hp-nav-desktop">
        <a href={PathFor.homePage} className="cur">Home</a>
        <a href={PathFor.guidedBuildPathPage}>My path</a>
        <a href={PathFor.assessmentIntroPage}>Practice</a>
      </nav>

      <span className="hp-appbar-spacer" />

      <button className="hp-iconbtn" aria-label="Notifications">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        <span className="bdot" />
      </button>

      <button
        className="hp-avatar"
        aria-label="View profile"
        onClick={() => { navigate(PathFor.profileIntakePage); }}
      >
        {initials}
      </button>
    </header>
  );
};

export default HomeAppBar;
