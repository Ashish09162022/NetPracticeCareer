import React from 'react';

/* ===== Icons ===== */
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const GiftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12v10H4V12" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const BigCheckIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const PathValueIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" />
    <path d="M5 17V9a7 7 0 0 1 14 0v8" />
  </svg>
);

const ChatValueIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ClipboardValueIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const RefreshValueIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6M23 20v-6h-6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const UpiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

/* ===== Brand mark ===== */
const BrandMark = () => (
  <span className="pw-brand-mark">
    <span />
  </span>
);

/* ===== Value items ===== */
const VALUE_ITEMS = [
  {
    icon: <PathValueIcon />,
    title: 'Hands-on guided path',
    desc: 'Build the skills you missed, with a mentor checking your work.',
  },
  {
    icon: <ChatValueIcon />,
    title: 'Practice with simulated clients',
    desc: 'Rehearse requirement-gathering until it’s second nature.',
  },
  {
    icon: <ClipboardValueIcon />,
    title: 'A fresh assessment when you’re ready',
    desc: 'Pass it and you’re in the placement pool.',
  },
  {
    icon: <RefreshValueIcon />,
    title: 'Re-attempts included',
    desc: 'No extra cost. Keep going until you’re ready.',
  },
];

/* ===== Props ===== */
export interface PaywallPageJSXProps {
  score: number;
  hasScholarship: boolean;
  price: number;
  originalPrice: number;
  razorpayOpen: boolean;
  successShown: boolean;
  onUnlock: () => void;
  onCloseRazorpay: () => void;
  onPay: () => void;
  onSuccessCTA: () => void;
  onBack: () => void;
}

const PaywallPageJSX: React.FC<PaywallPageJSXProps> = ({
  score,
  hasScholarship,
  price,
  originalPrice,
  razorpayOpen,
  successShown,
  onUnlock,
  onCloseRazorpay,
  onPay,
  onSuccessCTA,
  onBack,
}) => {
  const fmt = (n: number) => n.toLocaleString('en-IN');

  return (
    <div className="pw-shell">

      {/* Mobile status bar */}
      <div className="pw-statusbar">
        <span>9:41</span>
        <span className="pw-sb-icons">
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
            <rect x="0" y="7" width="3" height="4" rx="1" />
            <rect x="4.5" y="5" width="3" height="6" rx="1" />
            <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
            <rect x="13.5" y="0" width="3" height="11" rx="1" />
          </svg>
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <path d="M8 2.6c2.1 0 4 .82 5.43 2.16l1.2-1.3A9.4 9.4 0 0 0 8 .9 9.4 9.4 0 0 0 1.37 3.46l1.2 1.3A7.86 7.86 0 0 1 8 2.6Z" fill="currentColor" />
            <path d="M8 6.1c1.16 0 2.21.46 2.98 1.2l1.2-1.3A6.06 6.06 0 0 0 8 4.35c-1.6 0-3.05.62-4.13 1.65l1.2 1.3A4.27 4.27 0 0 1 8 6.1Z" fill="currentColor" />
            <path d="M8 9.6 9.9 7.5A2.7 2.7 0 0 0 8 6.7a2.7 2.7 0 0 0-1.9.8L8 9.6Z" fill="currentColor" />
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="1" y="1" width="20" height="10" rx="2.6" stroke="currentColor" strokeOpacity=".5" strokeWidth="1" />
            <rect x="2.6" y="2.6" width="15" height="6.8" rx="1.4" fill="currentColor" />
            <rect x="22.4" y="4" width="1.6" height="4" rx=".8" fill="currentColor" fillOpacity=".5" />
          </svg>
        </span>
      </div>

      {/* App bar */}
      <header className="pw-appbar">
        {/* Mobile: back button */}
        <button className="pw-iconbtn pw-nav-m" aria-label="Back" onClick={onBack}>
          <BackIcon />
        </button>
        <span className="pw-spacer pw-nav-m" />

        {/* Desktop: brand + close */}
        <div className="pw-nav-d">
          <div className="pw-brand">
            <BrandMark />
            NetPractice
          </div>
          <span className="pw-spacer" />
          <button className="pw-iconbtn" aria-label="Close" onClick={onBack}>
            <CloseIcon />
          </button>
        </div>
      </header>

      {/* Scroll area */}
      <div className="pw-scroll">
        <div className="pw-content">

          {/* Tie-in chip */}
          <div className="pw-tiein">
            From your result · Readiness <strong>{score}/100</strong>
          </div>

          {/* Headline */}
          <div className="pw-htext">
            <h1>Get placement-ready</h1>
            <p>You&rsquo;re close. This path fixes exactly what you missed: subscriptions, scoping, and timing.</p>
          </div>

          {/* Value items */}
          <div className="pw-values">
            {VALUE_ITEMS.map((v) => (
              <div key={v.title} className="pw-vitem">
                <span className="pw-vico">{v.icon}</span>
                <div className="pw-vtxt">
                  <div className="pw-vtitle">{v.title}</div>
                  <div className="pw-vdesc">{v.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Price card */}
          <div className="pw-pricecard">

            {/* Scholarship badge (conditional) */}
            {hasScholarship && (
              <div className="pw-earnedrow">
                <span className="pw-eb"><GiftIcon /></span>
                <div className="pw-etxt">
                  <div className="pw-etitle">50% scholarship earned</div>
                  <div className="pw-edesc">
                    Your readiness score of {score} unlocked this price — earned by your assessment, not a limited-time offer.
                  </div>
                </div>
              </div>
            )}

            {/* Price line */}
            <div className="pw-priceline">
              {hasScholarship && (
                <span className="pw-was">₹{fmt(originalPrice)}</span>
              )}
              <span className="pw-amt">₹{fmt(price)}</span>
              <span className="pw-per">one time</span>
            </div>

            <p className="pw-pricesub">No subscription, no renewals. Pay once, keep the path for good.</p>

            <button className="pw-cta" onClick={onUnlock}>
              Unlock my path
            </button>

            <div className="pw-secure">
              <LockIcon />
              Secure payment via <strong>Razorpay</strong>
            </div>

            <p className="pw-nextline">Unlocks the moment you pay. You&rsquo;ll land straight on your path.</p>

          </div>

          {/* Honest box */}
          <div className="pw-honest">
            <span className="pw-honest-ico"><InfoIcon /></span>
            <p>
              Placement-ready gets you into the <strong>matching pool</strong>. It&rsquo;s a real shot at a paid placement, not a guarantee. We match you when your skills are ready.
            </p>
          </div>

          {/* Skip link */}
          <button className="pw-maybe" onClick={onBack}>
            Back to my report
          </button>

        </div>
      </div>

      {/* Mobile home bar */}
      <div className="pw-homebar"><i /></div>

      {/* Razorpay mock overlay */}
      {razorpayOpen && (
        <div className="pw-overlay" onClick={onCloseRazorpay}>
          <div className="pw-rzpsheet" onClick={(e) => e.stopPropagation()}>
            <div className="pw-rzphead">
              <span className="pw-rzptitle">
                NetPractice · Placement-ready path · ₹{fmt(price)}
              </span>
              <button className="pw-rzpclose" aria-label="Close payment" onClick={onCloseRazorpay}>
                <CloseIcon />
              </button>
            </div>
            <div className="pw-rzpbody">
              <div className="pw-rzpmethod">
                <UpiIcon />
                <span>UPI / Card / Netbanking</span>
              </div>
              <button className="pw-rzppay" onClick={onPay}>
                Pay ₹{fmt(price)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success screen */}
      {successShown && (
        <div className="pw-endstate">
          <div className="pw-end-inner">
            <div className="pw-end-check">
              <BigCheckIcon />
            </div>
            <h2>You&rsquo;re in. Let&rsquo;s get you ready.</h2>
            <p>Payment successful. Your path is unlocked, built around the gaps in your report.</p>
            <button className="pw-cta pw-end-cta" onClick={onSuccessCTA}>
              Start my path →
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaywallPageJSX;
