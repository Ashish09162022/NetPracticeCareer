import { type FC, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import {
  useGetProfileQuery,
  useUpdateSection1Mutation,
  useUpdateSection2Mutation,
  useUploadResumeMutation,
  useUpdateSection3Mutation,
} from '@/store/api/profileApi';
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
  resumeUrl: string | null;
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
  resumeUrl: null,
};

const ProfileIntakePage: FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState<ProfileIntakeFormData>(DEFAULT_FORM);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: profile } = useGetProfileQuery();
  const [updateSection1, { isLoading: savingS1 }] = useUpdateSection1Mutation();
  const [updateSection2, { isLoading: savingS2 }] = useUpdateSection2Mutation();
  const [uploadResume] = useUploadResumeMutation();
  const [updateSection3, { isLoading: savingS3 }] = useUpdateSection3Mutation();

  // Pre-fill from API on first load
  const [prefilled, setPrefilled] = useState(false);
  if (profile && !prefilled) {
    setPrefilled(true);
    setFormData((prev) => ({
      ...prev,
      fullName: profile.name ?? '',
      email: profile.email ?? '',
      collegeName: profile.college ?? '',
      graduationYear: profile.graduation_year ? String(profile.graduation_year) : '',
      stream: profile.stream ?? '',
      startDate: profile.start_date ?? '',
      duration: profile.duration ?? '',
      currentCity: profile.current_city ?? '',
      readyToRelocate: profile.ready_to_relocate ?? false,
      github: profile.github_url ?? '',
      linkedin: profile.linkedin_url ?? '',
      projectLinks: profile.project_links?.length ? profile.project_links : [''],
      resumeUrl: profile.resume_url ?? null,
    }));
  }

  const showToast = useCallback(() => {
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3400);
  }, []);

  const handleContinue = useCallback(async () => {
    if (step === 0) {
      try {
        await updateSection1({
          name: formData.fullName,
          email: formData.email,
          college: formData.collegeName,
          graduation_year: Number(formData.graduationYear),
          stream: formData.stream,
        }).unwrap();
        setStep(1);
      } catch {
        // validation errors shown inline via toast or error state
      }
      return;
    }
    if (step === 1) {
      try {
        const res = await updateSection2({
          start_date: formData.startDate,
          duration: formData.duration,
          current_city: formData.currentCity,
          ready_to_relocate: formData.readyToRelocate,
        }).unwrap();
        if (res.is_available) showToast();
        setStep(2);
      } catch {
        // stay on step
      }
      return;
    }
    if (step === 2) {
      try {
        let resumeUrl = formData.resumeUrl;
        if (formData.resumeFile) {
          const fd = new FormData();
          fd.append('file', formData.resumeFile);
          const uploaded = await uploadResume(fd).unwrap();
          resumeUrl = uploaded.resume_url;
        }
        await updateSection3({
          resume_url: resumeUrl ?? undefined,
          github_url: formData.github || undefined,
          linkedin_url: formData.linkedin || undefined,
          project_links: formData.projectLinks.filter(Boolean),
        }).unwrap();
        setDone(true);
      } catch {
        // stay on step
      }
    }
  }, [step, formData, updateSection1, updateSection2, updateSection3, uploadResume, showToast]);

  const handleBack = useCallback(() => {
    if (step === 1) setStep(0);
    if (step === 2) setStep(1);
  }, [step]);

  const handleSkip = useCallback(() => {
    navigate(PathFor.homePage);
  }, [navigate]);

  const handleDoneForNow = useCallback(() => {
    navigate(PathFor.homePage);
  }, [navigate]);

  const handleFieldChange = useCallback(<K extends keyof ProfileIntakeFormData>(
    field: K,
    value: ProfileIntakeFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleProjectLinkChange = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const links = [...prev.projectLinks];
      links[index] = value;
      return { ...prev, projectLinks: links };
    });
  }, []);

  const handleAddProjectLink = useCallback(() => {
    setFormData((prev) => {
      if (prev.projectLinks.length >= 3) return prev;
      return { ...prev, projectLinks: [...prev.projectLinks, ''] };
    });
  }, []);

  const handleRemoveProjectLink = useCallback((index: number) => {
    setFormData((prev) => {
      const links = prev.projectLinks.filter((_, i) => i !== index);
      return { ...prev, projectLinks: links.length ? links : [''] };
    });
  }, []);

  const handleResumeChange = useCallback((file: File | null) => {
    setFormData((prev) => ({ ...prev, resumeFile: file }));
  }, []);

  const isSaving = savingS1 || savingS2 || savingS3;

  return (
    <ProfileIntakePageJSX
      step={step}
      done={done}
      formData={formData}
      toastVisible={toastVisible}
      isSaving={isSaving}
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
