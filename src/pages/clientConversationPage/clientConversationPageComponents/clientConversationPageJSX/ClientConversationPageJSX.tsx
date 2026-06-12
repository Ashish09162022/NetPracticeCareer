import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ===== Types ===== */
type DaychipMsg = { id: string; type: 'daychip'; label: string };
type ClientMsg  = { id: string; type: 'client'; text: string; timestamp?: string; cont?: boolean };
type StudentMsg = { id: string; type: 'student'; text: string; timestamp?: string };
type TypingMsg  = { id: string; type: 'typing' };
type ChatMessage = DaychipMsg | ClientMsg | StudentMsg | TypingMsg;

interface ClientConversationPageJSXProps {
  openingMessage: string | null;
  personaName: string;
  personaRole: string;
  turnSeconds: number;
  onBack: () => void;
  onSend: (text: string, responseSecs: number, pasteAttempts: number) => Promise<string>;
  onGoToBuild: () => void;
  onConversationEnded: (buildClockStart: string, deadlineSoft: string, deadlineHard: string) => void;
}

/* ===== Constants ===== */
const CIRCUMFERENCE = 2 * Math.PI * 18;

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/* ===== Icons ===== */
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DoneCheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const ClockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/* ===== Mobile status bar icons ===== */
const SignalIcon = () => (
  <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
    <rect x="0" y="7" width="3" height="4" rx="1" />
    <rect x="4.5" y="5" width="3" height="6" rx="1" />
    <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
    <rect x="13.5" y="0" width="3" height="11" rx="1" />
  </svg>
);

const WifiIcon = () => (
  <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
    <path d="M8 2.6c2.1 0 4 .82 5.43 2.16l1.2-1.3A9.4 9.4 0 0 0 8 .9 9.4 9.4 0 0 0 1.37 3.46l1.2 1.3A7.86 7.86 0 0 1 8 2.6Z" fill="currentColor" />
    <path d="M8 6.1c1.16 0 2.21.46 2.98 1.2l1.2-1.3A6.06 6.06 0 0 0 8 4.35c-1.6 0-3.05.62-4.13 1.65l1.2 1.3A4.27 4.27 0 0 1 8 6.1Z" fill="currentColor" />
    <path d="M8 9.6 9.9 7.5A2.7 2.7 0 0 0 8 6.7a2.7 2.7 0 0 0-1.9.8L8 9.6Z" fill="currentColor" />
  </svg>
);

const BatteryIcon = () => (
  <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
    <rect x="1" y="1" width="20" height="10" rx="2.6" stroke="currentColor" strokeOpacity=".5" strokeWidth="1" />
    <rect x="2.6" y="2.6" width="15" height="6.8" rx="1.4" fill="currentColor" />
    <rect x="22.4" y="4" width="1.6" height="4" rx=".8" fill="currentColor" fillOpacity=".5" />
  </svg>
);

/* ===== Main component ===== */
const ClientConversationPageJSX: React.FC<ClientConversationPageJSXProps> = ({
  openingMessage,
  personaName,
  personaRole,
  turnSeconds,
  onBack,
  onSend,
  onGoToBuild,
  onConversationEnded,
}) => {
  const initMessages: ChatMessage[] = [
    { id: 'dc1', type: 'daychip', label: 'Today' },
    ...(openingMessage
      ? [{ id: 'c1', type: 'client' as const, text: openingMessage }]
      : []),
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initMessages);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(turnSeconds);
  const [showModal, setShowModal] = useState(false);
  const [endVariant, setEndVariant] = useState<'done' | 'ended' | null>(null);
  const [noticeFlash, setNoticeFlash] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerEndedRef = useRef(false);
  const counterRef = useRef(0);
  const noticeFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendStartRef = useRef<number>(Date.now());

  const nextId = () => String(++counterRef.current);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerEndedRef.current = false;
    setTimeLeft(turnSeconds);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  }, [turnSeconds]);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  useEffect(() => {
    if (timeLeft <= 0 && !timerEndedRef.current) {
      timerEndedRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setEndVariant('ended');
    }
  }, [timeLeft]);

  const doSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isSending) return;

    const studentId = `s${nextId()}`;
    const typingId = `t${nextId()}`;
    const clientId = `c${nextId()}`;
    const responseSecs = Math.round((Date.now() - sendStartRef.current) / 1000);

    setInputValue('');
    if (taRef.current) {
      taRef.current.style.height = 'auto';
    }

    setMessages(prev => [...prev, { id: studentId, type: 'student', text }]);
    startTimer();
    sendStartRef.current = Date.now();

    typingTimerRef.current = setTimeout(() => {
      setMessages(prev => [...prev, { id: typingId, type: 'typing' }]);
    }, 300);

    setIsSending(true);
    try {
      const reply = await onSend(text, responseSecs, 0);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setMessages(prev =>
        prev.map(m =>
          m.id === typingId
            ? ({ id: clientId, type: 'client', text: reply } as ClientMsg)
            : m
        ).filter(m => m.id !== typingId || true)
      );
      setMessages(prev => {
        const hasTyping = prev.some(m => m.id === typingId);
        if (hasTyping) {
          return prev.map(m =>
            m.id === typingId ? ({ id: clientId, type: 'client', text: reply } as ClientMsg) : m
          );
        }
        return [...prev, { id: clientId, type: 'client', text: reply }];
      });
    } catch (err: unknown) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setMessages(prev => prev.filter(m => m.id !== typingId));
      const errData = (err as { data?: { error?: { code?: string; build_clock_start?: string; deadline_soft?: string; deadline_hard?: string } } })?.data?.error;
      if (errData?.code === 'conversation_ended') {
        timerEndedRef.current = true;
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        setEndVariant('ended');
        if (errData.build_clock_start) {
          onConversationEnded(errData.build_clock_start, errData.deadline_soft ?? '', errData.deadline_hard ?? '');
        }
      }
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, startTimer, onSend, onConversationEnded]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  }, [doSend]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 110) + 'px';
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setNoticeFlash(true);
    if (noticeFlashTimerRef.current) clearTimeout(noticeFlashTimerRef.current);
    noticeFlashTimerRef.current = setTimeout(() => setNoticeFlash(false), 1600);
  }, []);

  const handleDoneClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleConfirmDone = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timerEndedRef.current = true;
    setShowModal(false);
    setEndVariant('done');
    onGoToBuild();
  }, [onGoToBuild]);

  const handleKeepChatting = useCallback(() => {
    setShowModal(false);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (noticeFlashTimerRef.current) clearTimeout(noticeFlashTimerRef.current);
    };
  }, []);

  const isEnded = endVariant !== null;
  const timerClass = timeLeft <= 10 ? 'danger' : timeLeft <= 30 ? 'warn' : '';
  const dashOffset = CIRCUMFERENCE * (1 - timeLeft / TOTAL);

  return (
    <div className="cc-shell">
      {/* Mobile status bar */}
      <div className="cc-statusbar">
        <span>9:41</span>
        <div className="cc-sb-icons">
          <SignalIcon />
          <WifiIcon />
          <BatteryIcon />
        </div>
      </div>

      {/* Top bar */}
      <div className="cc-topbar">
        <div className="cc-tb">
          <button className="cc-back" onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
          <span className="cc-cavatar">{personaName.slice(0, 2).toUpperCase()}</span>
          <div className="cc-cmeta">
            <div className="cc-cn">{personaName}</div>
            <div className="cc-cr">{personaRole}</div>
          </div>

          {/* Circular timer */}
          <div className="cc-timer-wrap">
            <svg
              className={`cc-timer-svg${timerClass ? ' ' + timerClass : ''}`}
              width="46"
              height="46"
              viewBox="0 0 46 46"
            >
              <circle
                cx="23" cy="23" r="18"
                fill="none"
                stroke="var(--np-surface-2)"
                strokeWidth="4"
              />
              <circle
                className="cc-timer-prog"
                cx="23" cy="23" r="18"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                style={{ strokeDashoffset: dashOffset }}
                transform="rotate(-90 23 23)"
              />
              <text className="cc-timer-text" x="23" y="27" textAnchor="middle">
                {formatTime(timeLeft)}
              </text>
            </svg>
          </div>

          <button className="cc-donebtn" onClick={handleDoneClick} disabled={isEnded}>
            <CheckIcon />
            <span className="cc-shrt">Done</span>
            <span className="cc-lng">I'm done</span>
          </button>
        </div>
      </div>

      {/* Status strip */}
      <div className="cc-strip">
        <div className="cc-si">
          <span className="cc-live" />
          Assessment in progress · type your replies by hand, no pasting
        </div>
      </div>

      {/* Chat scroll */}
      <div className="cc-scroll" ref={scrollRef}>
        <div className="cc-thread">
          {messages.map(msg => {
            if (msg.type === 'daychip') {
              return <span key={msg.id} className="cc-daychip">{msg.label}</span>;
            }
            if (msg.type === 'client') {
              return (
                <div key={msg.id} className={`cc-row client${msg.cont ? ' cont' : ''}`}>
                  <span className="cc-ravatar">{personaName.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <div className="cc-bubble">{msg.text}</div>
                    {msg.timestamp && <div className="cc-tstamp">{msg.timestamp}</div>}
                  </div>
                </div>
              );
            }
            if (msg.type === 'typing') {
              return (
                <div key={msg.id} className="cc-row client cc-typing">
                  <span className="cc-ravatar">{personaName.slice(0, 2).toUpperCase()}</span>
                  <div>
                    <div className="cc-bubble">
                      <i /><i /><i />
                    </div>
                  </div>
                </div>
              );
            }
            if (msg.type === 'student') {
              return (
                <div key={msg.id} className="cc-row me">
                  <div>
                    <div className="cc-bubble">{msg.text}</div>
                    {msg.timestamp && <div className="cc-tstamp">{msg.timestamp}</div>}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Input bar */}
      <div className="cc-inputbar">
        <div className="cc-inputbar-inner">
          <div className="cc-ibrow">
            <div className={`cc-ifield${isFocused ? ' focus' : ''}`}>
              <textarea
                ref={taRef}
                rows={1}
                placeholder={isEnded ? 'The conversation has ended.' : 'Type your reply…'}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onPaste={handlePaste}
                disabled={isEnded}
              />
            </div>
            <button
              className="cc-send"
              disabled={!inputValue.trim() || isEnded || isSending}
              onClick={doSend}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
          <div className={`cc-notice${noticeFlash ? ' flash' : ''}`}>
            <LockIcon />
            {noticeFlash ? 'Paste is off. Type your reply by hand.' : 'Paste is off here. Type your reply by hand.'}
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      {showModal && (
        <div className="cc-overlay" onClick={handleKeepChatting}>
          <div className="cc-modal" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-icon">
              <WarningIcon />
            </div>
            <div className="cc-modal-head">Ready to build?</div>
            <p className="cc-modal-body">
              Make sure you understand the full requirements. You can't return to this chat once it ends.
            </p>
            <button className="cc-modal-cta" onClick={handleConfirmDone}>
              Yes, go build <ArrowRightIcon />
            </button>
            <button className="cc-modal-ghost" onClick={handleKeepChatting}>
              Keep chatting
            </button>
          </div>
        </div>
      )}

      {/* End state */}
      {endVariant && (
        <div className="cc-endstate">
          {endVariant === 'done' ? (
            <>
              <div className="cc-end-icon done"><DoneCheckIcon /></div>
              <div className="cc-end-head">Conversation complete</div>
              <p className="cc-end-body">Time to build. Ship a working app before Dr. Mehta's deadline.</p>
            </>
          ) : (
            <>
              <div className="cc-end-icon ended"><ClockIcon /></div>
              <div className="cc-end-head">Conversation ended</div>
              <p className="cc-end-body">The client had to go. Build with what you've learned.</p>
            </>
          )}
          <button className="cc-endcta" onClick={onGoToBuild}>
            Go to build <ArrowRightIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientConversationPageJSX;
