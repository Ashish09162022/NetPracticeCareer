import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ===== Types ===== */
interface CoachVariant {
  good: [string, string];
  miss: [string, string];
  tip: string;
}

type DaychipMsg = { id: string; type: 'daychip'; label: string };
type ClientMsg  = { id: string; type: 'client'; text: string };
type StudentMsg = { id: string; type: 'student'; text: string; variantIdx: number };
type TypingMsg  = { id: string; type: 'typing' };
type ChatMessage = DaychipMsg | ClientMsg | StudentMsg | TypingMsg;

import type { CoachingFeedback } from '@/store/api/coachingApi';

interface CoachingPracticePageJSXProps {
  attemptId?: string | null;
  personaName?: string;
  personaRole?: string;
  openingMessage?: string;
  isStarting?: boolean;
  onBack: () => void;
  onStart?: () => void;
  onSend?: (text: string) => Promise<{ reply: string; coaching_feedback: CoachingFeedback | null }>;
}

/* ===== Data ===== */
const COACH_VARIANTS: CoachVariant[] = [
  {
    good: ['Friendly and confident.', 'You reassured the client quickly. That builds trust.'],
    miss: ['You agreed before understanding.', '"Pay later on credit" hides a lot: who gets credit, what limit, how it\'s tracked and repaid. Don\'t commit to building until you\'ve scoped it.'],
    tip: 'Happy to help! Before I plan it -- how does the khata work today? Who\'s allowed credit, is there a limit per customer, and how do they usually clear their balance?',
  },
  {
    good: ['Clear and specific.', 'You asked about one concrete detail instead of a vague "tell me more".'],
    miss: ['You stopped at one question.', "There's more to uncover: payment limits, reminders, and who can mark a balance as paid."],
    tip: 'What happens if a customer goes over their usual amount -- do you want a hard limit, or just a warning to you?',
  },
  {
    good: ['Great follow-up.', 'You connected your question to something the client already said.'],
    miss: ['Watch the scope creep.', 'Reminders and SMS can balloon the build. Confirm what\'s essential for version one.'],
    tip: 'For the first version, is an on-screen list of who owes what enough, or do you need automatic reminders too?',
  },
];

const CLIENT_FOLLOW_UPS = [
  "That makes sense. Anything else you'd need from me?",
  "Okay, noted. What else should I think about?",
  'Sure -- go on.',
];

const SCENARIO_1: ChatMessage[] = [
  { id: 'dc1', type: 'daychip', label: 'Practice scenario' },
  { id: 'c1', type: 'client', text: 'Hi, I own a hardware store and I want an app where my regular customers can order supplies and pay later on credit, like a khata.' },
  { id: 's1', type: 'student', text: 'Okay, I can build that for you.', variantIdx: 0 },
  { id: 'c2', type: 'client', text: 'Good question! Only my regulars get credit -- maybe 30-40 of them. They usually clear it at the end of the month.' },
];

const SCENARIO_2: ChatMessage[] = [
  { id: 'dc2', type: 'daychip', label: 'New practice scenario' },
  { id: 'c3', type: 'client', text: "Hi! I run a small tuition centre and I want a website where parents can see their child's test scores and attendance. Can you help?" },
];

/* ===== Icons ===== */
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-3.5-7.1" />
    <polyline points="21 3 21 8 16 8" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 3 6v6c0 5.2 3.4 8.9 9 10 5.6-1.1 9-4.8 9-10V6l-9-4Z" />
    <path d="M9.5 12l1.8 1.8 3.5-3.6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const GoodIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const MissIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="8" x2="12" y2="13" />
    <line x1="12" y1="16.5" x2="12" y2="16.6" />
  </svg>
);

const TipIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2Z" />
    <line x1="9.5" y1="21" x2="14.5" y2="21" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/* ===== Coach card sub-component ===== */
const CoachCard = ({
  id,
  variant,
  isOpen,
  isFirst,
  onToggle,
}: {
  id: string;
  variant: CoachVariant;
  isOpen: boolean;
  isFirst: boolean;
  onToggle: (id: string) => void;
}) => (
  <div className={`cp-coach${isOpen ? ' open' : ''}`}>
    <div className="cp-coach-head" onClick={() => onToggle(id)}>
      <span className="cp-coach-badge"><ShieldIcon /></span>
      <span className="cp-coach-title">
        <b>Coach</b>
        <span>{isFirst ? 'One thing you did well, one to improve' : 'Tap to see feedback'}</span>
      </span>
      <span className="cp-coach-toggle"><ChevronDownIcon /></span>
    </div>
    <div className="cp-coach-body">
      <div className="cp-cfb good">
        <span className="cp-cfb-icon"><GoodIcon /></span>
        <span className="cp-cfb-text"><b>{variant.good[0]}</b> {variant.good[1]}</span>
      </div>
      <div className="cp-cfb miss">
        <span className="cp-cfb-icon"><MissIcon /></span>
        <span className="cp-cfb-text"><b>{variant.miss[0]}</b> {variant.miss[1]}</span>
      </div>
      <div className="cp-cfb tip">
        <span className="cp-cfb-icon"><TipIcon /></span>
        <span className="cp-cfb-text">
          <b>Try asking instead:</b>
          <span className="cp-cfb-quote">"{variant.tip}"</span>
        </span>
      </div>
    </div>
  </div>
);

/* ===== Main component ===== */
const CoachingPracticePageJSX: React.FC<CoachingPracticePageJSXProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(SCENARIO_1);
  const [openCoachIds, setOpenCoachIds] = useState<Set<string>>(new Set(['s1']));
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const variantIndexRef = useRef(1);
  const counterRef = useRef(10);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const clientTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coachTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextId = () => String(++counterRef.current);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const toggleCoach = useCallback((id: string) => {
    setOpenCoachIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const doSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    const studentId = `s${nextId()}`;
    const typingId = `t${nextId()}`;
    const clientId = `c${nextId()}`;
    const variantIdx = variantIndexRef.current % COACH_VARIANTS.length;
    variantIndexRef.current++;

    setInputValue('');
    if (taRef.current) {
      taRef.current.style.height = 'auto';
    }

    setMessages(prev => [...prev, { id: studentId, type: 'student', text, variantIdx }]);

    coachTimerRef.current = setTimeout(() => {
      setOpenCoachIds(prev => new Set([...prev, studentId]));
      scrollToBottom();
    }, 700);

    clientTimerRef.current = setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: typingId, type: 'typing' },
      ]);
      setTimeout(() => {
        const followUp = CLIENT_FOLLOW_UPS[Math.floor(Math.random() * CLIENT_FOLLOW_UPS.length)];
        setMessages(prev => prev.map(m => m.id === typingId ? { id: clientId, type: 'client', text: followUp } as ClientMsg : m));
      }, 800);
    }, 1700);
  }, [inputValue, scrollToBottom]);

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

  const handleNewScenario = useCallback(() => {
    if (clientTimerRef.current) clearTimeout(clientTimerRef.current);
    if (coachTimerRef.current) clearTimeout(coachTimerRef.current);
    variantIndexRef.current = 0;
    setMessages(SCENARIO_2);
    setOpenCoachIds(new Set());
    setInputValue('');
  }, []);

  useEffect(() => {
    return () => {
      if (clientTimerRef.current) clearTimeout(clientTimerRef.current);
      if (coachTimerRef.current) clearTimeout(coachTimerRef.current);
    };
  }, []);

  return (
    <div className="cp-shell">
      {/* Top bar */}
      <div className="cp-topbar">
        <div className="cp-tb">
          <button className="cp-back" onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
          <span className="cp-cavatar">SK</span>
          <div className="cp-cmeta">
            <div className="cp-cn">Sunil Kumar</div>
            <div className="cp-cr">Practice client · Hardware store</div>
          </div>
          <button className="cp-newbtn" onClick={handleNewScenario}>
            <RefreshIcon />
            <span className="cp-lng">New scenario</span>
            <span className="cp-shrt">New</span>
          </button>
        </div>
      </div>

      {/* Practice strip */}
      <div className="cp-strip">
        <div className="cp-si">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <CheckIcon />
            Practice, not graded
          </span>
          <span className="cp-dot">·</span>
          <span>No timer · a coach reviews every reply</span>
        </div>
      </div>

      {/* Chat scroll */}
      <div className="cp-scroll" ref={scrollRef}>
        <div className="cp-thread">
          {messages.map(msg => {
            if (msg.type === 'daychip') {
              return <span key={msg.id} className="cp-daychip">{msg.label}</span>;
            }
            if (msg.type === 'client') {
              return (
                <div key={msg.id} className="cp-row client">
                  <span className="cp-ravatar">SK</span>
                  <div>
                    <div className="cp-bubble">{msg.text}</div>
                    <div className="cp-tstamp">Now</div>
                  </div>
                </div>
              );
            }
            if (msg.type === 'typing') {
              return (
                <div key={msg.id} className="cp-row client cp-typing">
                  <span className="cp-ravatar">SK</span>
                  <div>
                    <div className="cp-bubble">
                      <i /><i /><i />
                    </div>
                  </div>
                </div>
              );
            }
            if (msg.type === 'student') {
              const variant = COACH_VARIANTS[msg.variantIdx % COACH_VARIANTS.length];
              const isOpen = openCoachIds.has(msg.id);
              return (
                <div key={msg.id} className="cp-megroup">
                  <div className="cp-row me">
                    <div>
                      <div className="cp-bubble">{msg.text}</div>
                      <div className="cp-tstamp">Now</div>
                    </div>
                  </div>
                  <CoachCard
                    id={msg.id}
                    variant={variant}
                    isOpen={isOpen}
                    isFirst={msg.id === 's1'}
                    onToggle={toggleCoach}
                  />
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Input bar */}
      <div className="cp-inputbar">
        <div className="cp-inputbar-inner">
          <div className="cp-ibrow">
            <div className={`cp-ifield${isFocused ? ' focus' : ''}`}>
              <textarea
                ref={taRef}
                rows={1}
                placeholder="Type your reply. The coach will review it."
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>
            <button className="cp-send" disabled={!inputValue.trim()} onClick={doSend} aria-label="Send">
              <SendIcon />
            </button>
          </div>
          <div className="cp-hint">
            <TipIcon />
            Practice freely. Pasting's fine, nothing's graded.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingPracticePageJSX;
