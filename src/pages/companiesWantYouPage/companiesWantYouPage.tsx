import { type FC, useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import { useGetCompaniesQuery, useAcceptCompanyMutation, usePassCompanyMutation } from '@/store/api/placementApi';
import { useLogEventMutation } from '@/store/api/eventsApi';
import type { Company } from './companiesWantYouPageComponents/companiesWantYouPageData';
import { COMPANY_POOL, LIVE_COUNT } from './companiesWantYouPageComponents/companiesWantYouPageData';
import CompaniesWantYouPageJSX from './companiesWantYouPageComponents/companiesWantYouPageJSX/CompaniesWantYouPageJSX';
import './companiesWantYouPage.css';

const CompaniesWantYouPage: FC = () => {
  const navigate = useNavigate();

  const { data: companiesData } = useGetCompaniesQuery();
  const [acceptCompany] = useAcceptCompanyMutation();
  const [passCompany] = usePassCompanyMutation();
  const [logEvent] = useLogEventMutation();

  useEffect(() => {
    logEvent({ type: 'company_interest_shown', payload: {} });
  }, [logEvent]);

  // Use API data when available, fall back to mock data for demo
  const apiCompanies: Company[] = (companiesData?.interests ?? []).map((c) => ({
    id: c.id,
    name: c.company_name,
    what: c.description,
    av: '#3366CC',
    want: c.pitch,
    when: c.picked,
    loc: c.area,
    mode: c.mode,
    pay: c.stipend,
    dur: c.duration,
  }));
  const sourcePool = apiCompanies.length > 0 ? apiCompanies : COMPANY_POOL;

  const [shown, setShown] = useState<Company[]>(sourcePool.slice(0, LIVE_COUNT));
  const [queue, setQueue] = useState<Company[]>(sourcePool.slice(LIVE_COUNT));
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());
  const [enteringId, setEnteringId] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingYesId, setPendingYesId] = useState<string | null>(null);

  const [reasonbar, setReasonbar] = useState({ open: false, title: '' });
  const [toast, setToast] = useState({ visible: false, message: '' });

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
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 1700);
  }, []);

  const clearCard = useCallback((id: string, afterCb?: () => void) => {
    setLeavingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      const newShown = shownRef.current.filter((c) => c.id !== id);
      let newQueue = queueRef.current;
      let addedId: string | null = null;
      if (queueRef.current.length > 0) {
        const added = queueRef.current[0];
        addedId = added.id;
        newQueue = queueRef.current.slice(1);
        newShown.push(added);
      }
      setLeavingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
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

  const handleSheetConfirm = useCallback(async () => {
    const company = shownRef.current.find((c) => c.id === pendingYesId);
    setSheetOpen(false);
    setPendingYesId(null);
    if (pendingYesId) {
      try {
        await acceptCompany(pendingYesId).unwrap();
      } catch {
        // already_responded or other — still navigate
      }
    }
    showToast(`Interview booked with ${company?.name.split(' ')[0] ?? 'them'}`);
    setTimeout(() => navigate(PathFor.statusTrackerPage), 850);
  }, [pendingYesId, acceptCompany, showToast, navigate]);

  const handleSheetCancel = useCallback(() => {
    setSheetOpen(false);
    setPendingYesId(null);
  }, []);

  const handlePass = useCallback(async (id: string) => {
    const company = shownRef.current.find((c) => c.id === id);
    clearCard(id);
    try {
      await passCompany({ id }).unwrap();
    } catch {
      // already_responded — card is still cleared from view
    }
    setReasonbar({ open: true, title: `Passed on ${company?.name ?? ''}.` });
    if (reasonbarTimerRef.current) clearTimeout(reasonbarTimerRef.current);
    reasonbarTimerRef.current = setTimeout(() => setReasonbar((r) => ({ ...r, open: false })), 6000);
  }, [clearCard, passCompany]);

  const handleReasonbarClose = useCallback(() => {
    setReasonbar((r) => ({ ...r, open: false }));
    if (reasonbarTimerRef.current) clearTimeout(reasonbarTimerRef.current);
  }, []);

  const handleReasonPick = useCallback(() => {
    if (reasonbarTimerRef.current) clearTimeout(reasonbarTimerRef.current);
    reasonbarTimerRef.current = setTimeout(() => setReasonbar((r) => ({ ...r, open: false })), 700);
  }, []);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const pendingCompany = pendingYesId ? shown.find((c) => c.id === pendingYesId) ?? null : null;
  const allClear = shown.length === 0 && leavingIds.size === 0;
  const countText = shown.length === 1 ? '1 company picked you' : `${shown.length} companies picked you`;

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
