import { type FC, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { COMPANY_POOL, LIVE_COUNT, type Company } from './companiesWantYouPageComponents/companiesWantYouPageData';
import CompaniesWantYouPageJSX from './companiesWantYouPageComponents/companiesWantYouPageJSX/CompaniesWantYouPageJSX';
import './companiesWantYouPage.css';

const CompaniesWantYouPage: FC = () => {
  const navigate = useNavigate();

  const [shown, setShown] = useState<Company[]>(COMPANY_POOL.slice(0, LIVE_COUNT));
  const [queue, setQueue] = useState<Company[]>(COMPANY_POOL.slice(LIVE_COUNT));
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());
  const [enteringId, setEnteringId] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingYesId, setPendingYesId] = useState<string | null>(null);

  const [reasonbar, setReasonbar] = useState({ open: false, title: '' });
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Refs so callbacks never go stale
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const queueRef = useRef(queue);
  queueRef.current = queue;

  const reasonbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enteringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (reasonbarTimerRef.current) clearTimeout(reasonbarTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (enteringTimerRef.current) clearTimeout(enteringTimerRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast({ visible: true, message: msg });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast(t => ({ ...t, visible: false }));
    }, 1700);
  }, []);

  const clearCard = useCallback((id: string, afterCb?: () => void) => {
    setLeavingIds(prev => new Set([...prev, id]));

    setTimeout(() => {
      const currentShown = shownRef.current;
      const currentQueue = queueRef.current;

      const newShown = currentShown.filter(c => c.id !== id);
      let newQueue = currentQueue;
      let addedId: string | null = null;

      if (currentQueue.length > 0) {
        const added = currentQueue[0];
        addedId = added.id;
        newQueue = currentQueue.slice(1);
        newShown.push(added);
      }

      setLeavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setShown(newShown);
      setQueue(newQueue);

      if (addedId) {
        setEnteringId(addedId);
        if (enteringTimerRef.current) clearTimeout(enteringTimerRef.current);
        enteringTimerRef.current = setTimeout(() => setEnteringId(null), 400);
      }

      afterCb?.();
    }, 260);
  }, []);

  const handleYes = useCallback((id: string) => {
    setPendingYesId(id);
    setSheetOpen(true);
  }, []);

  const handleSheetConfirm = useCallback(() => {
    const company = shownRef.current.find(c => c.id === pendingYesId);
    setSheetOpen(false);
    setPendingYesId(null);
    showToast(`Interview booked with ${company?.name.split(' ')[0] ?? 'them'}`);
    setTimeout(() => navigate(PathFor.statusTrackerPage), 850);
  }, [pendingYesId, showToast, navigate]);

  const handleSheetCancel = useCallback(() => {
    setSheetOpen(false);
    setPendingYesId(null);
  }, []);

  const handlePass = useCallback((id: string) => {
    const company = shownRef.current.find(c => c.id === id);
    clearCard(id);
    setReasonbar({ open: true, title: `Passed on ${company?.name ?? ''}.` });
    if (reasonbarTimerRef.current) clearTimeout(reasonbarTimerRef.current);
    reasonbarTimerRef.current = setTimeout(() => {
      setReasonbar(r => ({ ...r, open: false }));
    }, 6000);
  }, [clearCard]);

  const handleReasonbarClose = useCallback(() => {
    setReasonbar(r => ({ ...r, open: false }));
    if (reasonbarTimerRef.current) clearTimeout(reasonbarTimerRef.current);
  }, []);

  const handleReasonPick = useCallback(() => {
    if (reasonbarTimerRef.current) clearTimeout(reasonbarTimerRef.current);
    reasonbarTimerRef.current = setTimeout(() => {
      setReasonbar(r => ({ ...r, open: false }));
    }, 700);
  }, []);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const pendingCompany = pendingYesId
    ? shown.find(c => c.id === pendingYesId) ?? null
    : null;

  const allClear = shown.length === 0 && leavingIds.size === 0;

  const countText =
    shown.length === 1
      ? '1 company picked you'
      : `${shown.length} companies picked you`;

  return (
    <CompaniesWantYouPageJSX
      shown={shown}
      leavingIds={leavingIds}
      enteringId={enteringId}
      allClear={allClear}
      countText={countText}
      sheetOpen={sheetOpen}
      pendingCompany={pendingCompany}
      reasonbarOpen={reasonbar.open}
      reasonbarTitle={reasonbar.title}
      toastVisible={toast.visible}
      toastMessage={toast.message}
      onYes={handleYes}
      onPass={handlePass}
      onSheetConfirm={handleSheetConfirm}
      onSheetCancel={handleSheetCancel}
      onReasonbarClose={handleReasonbarClose}
      onReasonPick={handleReasonPick}
      onBack={handleBack}
    />
  );
};

export default CompaniesWantYouPage;
