import { type FC, useRef, useEffect } from 'react';

export type LoginPhase = 'phone' | 'otp' | 'done';

export interface LoginPageJSXProps {
  phase: LoginPhase;
  phoneNumber: string;
  otp: string[];
  resendSeconds: number;
  otpError?: string;
  isSending?: boolean;
  isVerifying?: boolean;
  onPhoneChange: (v: string) => void;
  onSendCode: () => void;
  onOtpChange: (index: number, value: string) => void;
  onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onChangeNumber: () => void;
  onResend: () => void;
}

const LoginPageJSX: FC<LoginPageJSXProps> = ({
  phase,
  phoneNumber,
  otp,
  resendSeconds,
  otpError,
  isSending,
  isVerifying,
  onPhoneChange,
  onSendCode,
  onOtpChange,
  onOtpKeyDown,
  onVerify,
  onChangeNumber,
  onResend,
}) => {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (phase === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 60);
    }
  }, [phase]);

  const formattedPhone = phoneNumber
    ? phoneNumber.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim()
    : '98765 43210';

  const resendLabel =
    resendSeconds > 0
      ? `Resend in ${Math.floor(resendSeconds / 60)}:${String(resendSeconds % 60).padStart(2, '0')}`
      : 'Resend OTP';

  return (
    <div className="lp-shell">
      <div className="lp-wrap">
        <div className="lp-card">

          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-mark" />
            <div className="lp-wordmark">NetPractice</div>
          </div>

          {/* Phase 1: Phone */}
          {phase === 'phone' && (
            <div className="lp-phase">
              <p className="lp-tagline">Get placement-ready. Get placed.</p>
              <p className="lp-subtag">Log in or sign up with your phone.</p>

              <label className="lp-flabel" htmlFor="lp-phone-input">Phone number</label>
              <div className="lp-phonegroup">
                <span className="lp-ccode">
                  <span className="lp-flag"><i /><i /><i /></span>
                  +91
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
                <input
                  id="lp-phone-input"
                  className="lp-phone-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={e => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={e => { if (e.key === 'Enter') onSendCode(); }}
                />
              </div>

              <button className="lp-cta" onClick={onSendCode} disabled={isSending}>
                {isSending ? 'Sending…' : 'Send code'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>

              <p className="lp-legal">
                By continuing you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.
              </p>
            </div>
          )}

          {/* Phase 2: OTP */}
          {phase === 'otp' && (
            <div className="lp-phase">
              <div className="lp-otphead">
                <h2>Enter the code</h2>
                <p>
                  We sent a 6-digit code to{' '}
                  <span className="lp-otpnum">+91 {formattedPhone}</span>
                  <br />
                  <button className="lp-editnum" onClick={onChangeNumber}>Change number</button>
                </p>
              </div>

              {otpError && <p className="lp-otperror">{otpError}</p>}

              <div className="lp-otpboxes">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${i + 1}`}
                    value={digit}
                    className={digit ? 'lp-otpbox filled' : 'lp-otpbox'}
                    onChange={e => {
                      onOtpChange(i, e.target.value);
                      if (e.target.value.replace(/\D/g, '') && i < 5) {
                        setTimeout(() => otpRefs.current[i + 1]?.focus(), 0);
                      }
                    }}
                    onKeyDown={e => {
                      onOtpKeyDown(i, e);
                      if (e.key === 'Backspace' && !otp[i] && i > 0) {
                        setTimeout(() => otpRefs.current[i - 1]?.focus(), 0);
                      }
                    }}
                  />
                ))}
              </div>

              <button className="lp-cta lp-cta--otp" onClick={onVerify} disabled={isVerifying}>
                {isVerifying ? 'Verifying…' : 'Verify'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </button>

              <p className="lp-resend">
                Didn&apos;t get it?{' '}
                <button disabled={resendSeconds > 0} onClick={onResend}>
                  {resendLabel}
                </button>
              </p>
            </div>
          )}

          {/* Phase 3: Done */}
          {phase === 'done' && (
            <div className="lp-donephase">
              <span className="lp-donecircle">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <h2>You&apos;re verified</h2>
              <p>Taking you in.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPageJSX;
