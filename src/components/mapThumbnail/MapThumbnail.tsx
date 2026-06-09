import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';

export interface MapThumbnailProps {
  showHeader?: boolean;
}

const MapThumbnail: React.FC<MapThumbnailProps> = ({ showHeader = true }) => {
  const navigate = useNavigate();

  const handleClick = () => { navigate(PathFor.homePage); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  };

  return (
    <div className="hp-mapthumb">
      {showHeader && (
        <div className="hp-mapthumb-head">
          <h2 className="mth">Companies Near You</h2>
        </div>
      )}
      <div
        className="maptile"
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label="View companies near you on map"
      >
        <svg className="maptile-bg" viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="mapOverlay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="32%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.58" />
            </linearGradient>
            <style>{`
              .map-pulse { transform-box: fill-box; transform-origin: center; }
              @media (prefers-reduced-motion: no-preference) {
                .map-pulse { animation: mapPulseAnim 2.2s ease-out infinite; }
              }
              @keyframes mapPulseAnim { 0% { transform: scale(1); opacity: .48; } 100% { transform: scale(2.8); opacity: 0; } }
            `}</style>
          </defs>
          {/* base */}
          <rect width="400" height="180" fill="#f0ebe0" />
          {/* park */}
          <rect x="199" y="0" width="111" height="33" fill="#c8e0a8" />
          {/* water */}
          <rect x="315" y="94" width="85" height="86" fill="#cdd8e0" />
          {/* diagonal roads */}
          <line x1="80" y1="0" x2="190" y2="85" stroke="#fff" strokeWidth="4.5" strokeOpacity="0.85" />
          <line x1="199" y1="85" x2="310" y2="0" stroke="#fff" strokeWidth="4.5" strokeOpacity="0.85" />
          {/* secondary H roads */}
          <rect x="0" y="28" width="400" height="5" fill="#fff" fillOpacity="0.8" />
          <rect x="0" y="142" width="400" height="5" fill="#fff" fillOpacity="0.8" />
          {/* secondary V roads */}
          <rect x="80" y="0" width="5" height="180" fill="#fff" fillOpacity="0.8" />
          <rect x="310" y="0" width="5" height="180" fill="#fff" fillOpacity="0.8" />
          {/* minor connectors */}
          <rect x="140" y="33" width="3" height="52" fill="#fff" fillOpacity="0.55" />
          <rect x="248" y="33" width="3" height="52" fill="#fff" fillOpacity="0.55" />
          <rect x="85" y="110" width="105" height="3" fill="#fff" fillOpacity="0.52" />
          <rect x="199" y="110" width="111" height="3" fill="#fff" fillOpacity="0.52" />
          {/* main roads */}
          <rect x="0" y="85" width="400" height="9" fill="#fff" />
          <rect x="190" y="0" width="9" height="180" fill="#fff" />
          {/* park trees */}
          <circle cx="218" cy="14" r="3.5" fill="#7ab560" opacity="0.7" />
          <circle cx="234" cy="20" r="4" fill="#7ab560" opacity="0.7" />
          <circle cx="248" cy="10" r="3" fill="#7ab560" opacity="0.7" />
          <circle cx="265" cy="18" r="4.5" fill="#7ab560" opacity="0.7" />
          <circle cx="280" cy="8" r="3.5" fill="#7ab560" opacity="0.7" />
          <circle cx="294" cy="22" r="3" fill="#7ab560" opacity="0.6" />
          {/* marker 1 */}
          <g transform="translate(65,52)">
            <circle r="14" fill="#1A56DB" />
            <rect x="-5.5" y="-3.5" width="11" height="8.5" rx="1.3" fill="none" stroke="#fff" strokeWidth="1.4" />
            <path d="M-2.5,-3.5 V-5.5 Q-2.5,-6.5 0,-6.5 Q2.5,-6.5 2.5,-5.5 V-3.5" fill="none" stroke="#fff" strokeWidth="1.4" />
            <line x1="-5.5" y1="0.5" x2="5.5" y2="0.5" stroke="#fff" strokeWidth="1.4" />
          </g>
          <g transform="translate(75,39)">
            <rect x="-10" y="-7" width="20" height="13" rx="6.5" fill="#FF5100" />
            <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="7.5" fontWeight="700" fontFamily="system-ui,sans-serif">20</text>
          </g>
          {/* marker 2 */}
          <g transform="translate(244,14)">
            <circle r="12" fill="#1A56DB" />
            <rect x="-4.5" y="-3" width="9" height="7" rx="1.1" fill="none" stroke="#fff" strokeWidth="1.3" />
            <path d="M-2,-3 V-4.5 Q-2,-5.5 0,-5.5 Q2,-5.5 2,-4.5 V-3" fill="none" stroke="#fff" strokeWidth="1.3" />
            <line x1="-4.5" y1="0.5" x2="4.5" y2="0.5" stroke="#fff" strokeWidth="1.3" />
          </g>
          <g transform="translate(253,3)">
            <rect x="-9" y="-6.5" width="18" height="13" rx="6.5" fill="#FF5100" />
            <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="7.5" fontWeight="700" fontFamily="system-ui,sans-serif">12</text>
          </g>
          {/* marker 3 */}
          <g transform="translate(340,115)">
            <circle r="12" fill="#1A56DB" />
            <rect x="-4.5" y="-3" width="9" height="7" rx="1.1" fill="none" stroke="#fff" strokeWidth="1.3" />
            <path d="M-2,-3 V-4.5 Q-2,-5.5 0,-5.5 Q2,-5.5 2,-4.5 V-3" fill="none" stroke="#fff" strokeWidth="1.3" />
            <line x1="-4.5" y1="0.5" x2="4.5" y2="0.5" stroke="#fff" strokeWidth="1.3" />
          </g>
          <g transform="translate(349,104)">
            <rect x="-7" y="-6.5" width="14" height="13" rx="6.5" fill="#FF5100" />
            <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="7.5" fontWeight="700" fontFamily="system-ui,sans-serif">7</text>
          </g>
          {/* marker 4 */}
          <g transform="translate(136,160)">
            <circle r="14" fill="#1A56DB" />
            <rect x="-5.5" y="-3.5" width="11" height="8.5" rx="1.3" fill="none" stroke="#fff" strokeWidth="1.4" />
            <path d="M-2.5,-3.5 V-5.5 Q-2.5,-6.5 0,-6.5 Q2.5,-6.5 2.5,-5.5 V-3.5" fill="none" stroke="#fff" strokeWidth="1.4" />
            <line x1="-5.5" y1="0.5" x2="5.5" y2="0.5" stroke="#fff" strokeWidth="1.4" />
          </g>
          <g transform="translate(147,148)">
            <rect x="-10" y="-7" width="20" height="13" rx="6.5" fill="#FF5100" />
            <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="7.5" fontWeight="700" fontFamily="system-ui,sans-serif">35</text>
          </g>
          {/* marker 5 */}
          <g transform="translate(258,157)">
            <circle r="11" fill="#1A56DB" />
            <rect x="-4" y="-2.5" width="8" height="6.5" rx="1" fill="none" stroke="#fff" strokeWidth="1.2" />
            <path d="M-1.8,-2.5 V-4 Q-1.8,-5 0,-5 Q1.8,-5 1.8,-4 V-2.5" fill="none" stroke="#fff" strokeWidth="1.2" />
            <line x1="-4" y1="0.5" x2="4" y2="0.5" stroke="#fff" strokeWidth="1.2" />
          </g>
          <g transform="translate(265,146)">
            <rect x="-7" y="-6.5" width="14" height="13" rx="6.5" fill="#FF5100" />
            <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="7.5" fontWeight="700" fontFamily="system-ui,sans-serif">5</text>
          </g>
          {/* user pulse */}
          <circle className="map-pulse" cx="194" cy="89" r="9" fill="#FF5100" fillOpacity="0.42" />
          <circle cx="194" cy="89" r="8" fill="#FF5100" />
          <circle cx="194" cy="89" r="4.5" fill="#fff" />
          <circle cx="194" cy="89" r="2.5" fill="#FF5100" />
          {/* bottom gradient */}
          <rect width="400" height="180" fill="url(#mapOverlay)" />
        </svg>
        <div className="maptile-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF5100">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Raipur, CG
        </div>
        <div className="maptile-expand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </div>
        <div className="maptile-info">
          <div className="maptile-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="2" y1="14" x2="22" y2="14" />
            </svg>
            74 openings nearby
          </div>
          <span className="maptile-cta">View on map →</span>
        </div>
      </div>
    </div>
  );
};

export default MapThumbnail;
