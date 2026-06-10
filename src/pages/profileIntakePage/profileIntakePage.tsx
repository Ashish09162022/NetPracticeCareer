import { type FC, useState, useCallback, useRef } from 'react';
import ProfileIntakePageJSX from './profileIntakePageComponents/profileIntakePageJSX/ProfileIntakePageJSX';
import './profileIntakePage.css';

export interface ProfileIntakeFormData {
  fullName: string;
  email: string;
  collegeName: string;
  graduationYear: string;
  stream: string;
  startDate: string;
  duration: string;
  currentCity: string;
  readyToRelocate: boolean;
  github: string;
  linkedin: string;
  projectLinks: string[];
  resumeFile: File | null;
}

const DEFAULT_FORM: ProfileIntakeFormData = {
  fullName: '',
  email: '',
  collegeName: '',
  graduationYear: '',
  stream: '',
  startDate: '',
  duration: '',
  currentCity: '',
  readyToRelocate: false,
  github: '',
  linkedin: '',
  projectLinks: [''],
  resumeFile: null,
};

interface ProfileIntakePageProps {}

const ProfileIntakePage: FC<ProfileIntakePageProps> = () => {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState<ProfileIntakeFormData>(DEFAULT_FORM);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(() => {
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3400);
  }, []);

  const handleContinue = useCallback(() => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) { showToast(); setStep(2); return; }
    if (step === 2) { setDone(true); }
  }, [step, showToast]);

  const handleBack = useCallback(() => {
    if (step === 1) setStep(0);
    if (step === 2) setStep(1);
  }, [step]);

  const handleSkip = useCallback(() => { setDone(true); }, []);

  const handleDoneForNow = useCallback(() => { setDone(true); }, []);

  const handleFieldChange = useCallback(<K extends keyof ProfileIntakeFormData>(
    field: K,
    value: ProfileIntakeFormData[K],
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleProjectLinkChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const links = [...prev.projectLinks];
      links[index] = value;
      return { ...prev, projectLinks: links };
    });
  }, []);

  const handleAddProjectLink = useCallback(() => {
    setFormData(prev => {
      if (prev.projectLinks.length >= 3) return prev;
      return { ...prev, projectLinks: [...prev.projectLinks, ''] };
    });
  }, []);

  const handleRemoveProjectLink = useCallback((index: number) => {
    setFormData(prev => {
      const links = prev.projectLinks.filter((_, i) => i !== index);
      return { ...prev, projectLinks: links.length ? links : [''] };
    });
  }, []);

  const handleResumeChange = useCallback((file: File | null) => {
    setFormData(prev => ({ ...prev, resumeFile: file }));
  }, []);

  return (
    <ProfileIntakePageJSX
      step={step}
      done={done}
      formData={formData}
      toastVisible={toastVisible}
      onContinue={handleContinue}
      onBack={handleBack}
      onSkip={handleSkip}
      onDoneForNow={handleDoneForNow}
      onFieldChange={handleFieldChange}
      onProjectLinkChange={handleProjectLinkChange}
      onAddProjectLink={handleAddProjectLink}
      onRemoveProjectLink={handleRemoveProjectLink}
      onResumeChange={handleResumeChange}
    />
  );
};

export default ProfileIntakePage;
