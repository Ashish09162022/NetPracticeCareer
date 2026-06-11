import { type FC, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import LoginPageJSX, { type LoginPhase } from './loginPageComponents/loginPageJSX/LoginPageJSX';
import './loginPage.css';

interface LoginPageProps {}

const LoginPage: FC<LoginPageProps> = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<LoginPhase>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resendSeconds, setResendSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendSeconds(30);
    timerRef.current = setInterval(() => {
      setResendSeconds(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSendCode = useCallback(() => {
    setPhase('otp');
    setOtp(Array(6).fill(''));
    startCountdown();
  }, [startCountdown]);

  const handleChangeNumber = useCallback(() => {
    setPhase('phone');
    if (timerRef.current) clearInterval(timerRef.current);
    setResendSeconds(0);
  }, []);

  const handleOtpChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    setOtp(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
  }, []);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setOtp(prev => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
    }
  }, [otp]);

  const handleVerify = useCallback(() => {
    setPhase('done');
    setTimeout(() => navigate(PathFor.homePage), 1400);
  }, [navigate]);

  const handleResend = useCallback(() => {
    startCountdown();
  }, [startCountdown]);

  return (
    <LoginPageJSX
      phase={phase}
      phoneNumber={phoneNumber}
      otp={otp}
      resendSeconds={resendSeconds}
      onPhoneChange={setPhoneNumber}
      onSendCode={handleSendCode}
      onOtpChange={handleOtpChange}
      onOtpKeyDown={handleOtpKeyDown}
      onVerify={handleVerify}
      onChangeNumber={handleChangeNumber}
      onResend={handleResend}
    />
  );
};

export default LoginPage;
