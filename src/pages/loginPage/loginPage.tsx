import { type FC, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useAppDispatch } from '@/hooks/storeHooks';
import { setCredentials } from '@/store/slices/authSlice/authSlice';
import { useRequestOtpMutation, useVerifyOtpMutation } from '@/store/api/authApi';
import LoginPageJSX, { type LoginPhase } from './loginPageComponents/loginPageJSX/LoginPageJSX';
import './loginPage.css';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [phase, setPhase] = useState<LoginPhase>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [resendSeconds, setResendSeconds] = useState(0);
  const [otpError, setOtpError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [requestOtp, { isLoading: isSending }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const startCountdown = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setResendSeconds(30);
    timerRef.current = setInterval(() => {
      setResendSeconds((s) => {
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSendCode = useCallback(async () => {
    try {
      await requestOtp({ phone: phoneNumber }).unwrap();
      setPhase('otp');
      setOtp(Array(6).fill(''));
      setOtpError('');
      startCountdown();
    } catch {
      // error shown via toast or inline; stay on phone phase
    }
  }, [phoneNumber, requestOtp, startCountdown]);

  const handleChangeNumber = useCallback(() => {
    setPhase('phone');
    setOtpError('');
    if (timerRef.current) clearInterval(timerRef.current);
    setResendSeconds(0);
  }, []);

  const handleOtpChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
  }, []);

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
        setOtp((prev) => {
          const next = [...prev];
          next[index - 1] = '';
          return next;
        });
      }
    },
    [otp],
  );

  const handleVerify = useCallback(async () => {
    setOtpError('');
    try {
      const result = await verifyOtp({ phone: phoneNumber, otp: otp.join('') }).unwrap();
      dispatch(setCredentials({ token: result.token, phone: phoneNumber }));
      setPhase('done');
      setTimeout(() => {
        navigate(result.profile_gate_complete ? PathFor.homePage : PathFor.profileIntakePage);
      }, 1400);
    } catch (err: unknown) {
      const code = (err as { data?: { error?: { code?: string } } })?.data?.error?.code;
      if (code === 'otp_expired') setOtpError('Code expired — request a new one');
      else setOtpError('Wrong code, try again');
    }
  }, [phoneNumber, otp, verifyOtp, dispatch, navigate]);

  const handleResend = useCallback(async () => {
    try {
      await requestOtp({ phone: phoneNumber }).unwrap();
      startCountdown();
      setOtpError('');
    } catch {
      // silently ignore; user can retry
    }
  }, [phoneNumber, requestOtp, startCountdown]);

  return (
    <LoginPageJSX
      phase={phase}
      phoneNumber={phoneNumber}
      otp={otp}
      resendSeconds={resendSeconds}
      otpError={otpError}
      isSending={isSending}
      isVerifying={isVerifying}
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
