import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathFor } from '@/enums/global';
import type { ProfileIntakeFormData } from '../../profileIntakePage';
import { STEPS, GRADUATION_YEARS, STREAMS, DURATIONS, COMPLETION_PCT } from '../profileIntakePageData';

/* ===== Icons ===== */
const ChevronLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const GitHubIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const BigCheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/* ===== NetPractice brand logo ===== */
const BrandLogo = () => (
  <div className="pi-brand-logo">
    <span /><span className="dim" /><span className="dim" /><span />
  </div>
);

export interface ProfileIntakePageJSXProps {
  step: 0 | 1 | 2;
  done: boolean;
  formData: ProfileIntakeFormData;
  toastVisible: boolean;
  isSaving?: boolean;
  onContinue: () => void;
  onBack: () => void;
  onSkip: () => void;
  onDoneForNow: () => void;
  onFieldChange: <K extends keyof ProfileIntakeFormData>(field: K, value: ProfileIntakeFormData[K]) => void;
  onProjectLinkChange: (index: number, value: string) => void;
  onAddProjectLink: () => void;
  onRemoveProjectLink: (index: number) => void;
  onResumeChange: (file: File | null) => void;
}

/* ===== Mobile horizontal stepper ===== */
const MobileStepper: React.FC<{ step: number; done: boolean }> = ({ step, done }) => (
  <div className="pi-progress">
    {STEPS.map((s, i) => {
      const isDone = done || i < step;
      const isCurrent = !done && i === step;
      return (
        <React.Fragment key={i}>
          {i > 0 && (
            <span className={`pi-prog-line${isDone || i <= step ? ' done' : ''}`} />
          )}
          <div className={`pi-prog-step${isCurrent ? ' current' : isDone ? ' sdone' : ''}`}>
            <span className="pi-prog-circle">
              {isDone ? <CheckIcon size={13} /> : i + 1}
            </span>
            <span className="pi-prog-label">{s.short}</span>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

/* ===== Desktop vertical stepper ===== */
const DesktopStepper: React.FC<{ step: number; done: boolean }> = ({ step, done }) => {
  const pct = done ? 100 : COMPLETION_PCT[step];
  return (
    <aside className="pi-stepper">
      <div className="pi-complete">
        <span className="pi-complete-label">Profile completeness</span>
        <span className="pi-complete-pct">{pct}%</span>
        <div className="pi-complete-bar">
          <div className="pi-complete-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {STEPS.map((s, i) => {
        const isDone = done || i < step;
        const isCurrent = !done && i === step;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={i} className={`pi-step-item${isCurrent ? ' current' : isDone ? ' sdone' : ''}`}>
            <div className="pi-step-rail">
              <span className="pi-step-circle">
                {isDone ? <CheckIcon size={14} /> : i + 1}
              </span>
              {!isLast && <span className={`pi-step-line${isDone ? ' done' : ''}`} />}
            </div>
            <div className="pi-step-meta">
              <span className="pi-step-sublabel">Step {i + 1}</span>
              <span className="pi-step-title">{s.label}</span>
            </div>
          </div>
        );
      })}
    </aside>
  );
};

/* ===== Section 1 -- About you ===== */
const SectionAboutYou: React.FC<{
  formData: ProfileIntakeFormData;
  onFieldChange: ProfileIntakePageJSXProps['onFieldChange'];
}> = ({ formData, onFieldChange }) => (
  <div className="pi-section">
    <h2 className="pi-shead">About you</h2>
    <p className="pi-sintro">The basics, so businesses know who they're working with.</p>

    <div className="pi-row2">
      <div className="pi-field">
        <label className="pi-label">Full name</label>
        <input
          className="pi-input"
          type="text"
          placeholder="e.g. Aman Verma"
          value={formData.fullName}
          onChange={e => onFieldChange('fullName', e.target.value)}
        />
      </div>
      <div className="pi-field">
        <label className="pi-label">Email</label>
        <input
          className="pi-input"
          type="email"
          placeholder="you@email.com"
          value={formData.email}
          onChange={e => onFieldChange('email', e.target.value)}
        />
      </div>
    </div>

    <div className="pi-field">
      <label className="pi-label">College name</label>
      <input
        className="pi-input"
        type="text"
        placeholder="e.g. NIT Raipur"
        value={formData.collegeName}
        onChange={e => onFieldChange('collegeName', e.target.value)}
      />
    </div>

    <div className="pi-row2">
      <div className="pi-field">
        <label className="pi-label">Graduation year</label>
        <div className="pi-select-wrap">
          <select
            className="pi-input pi-select"
            value={formData.graduationYear}
            onChange={e => onFieldChange('graduationYear', e.target.value)}
          >
            <option value="" disabled>Select</option>
            {GRADUATION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="pi-select-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </div>
      </div>
      <div className="pi-field">
        <label className="pi-label">Stream</label>
        <div className="pi-select-wrap">
          <select
            className="pi-input pi-select"
            value={formData.stream}
            onChange={e => onFieldChange('stream', e.target.value)}
          >
            <option value="" disabled>Select</option>
            {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="pi-select-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </div>
      </div>
    </div>
  </div>
);

/* ===== Section 2 -- Internship preference ===== */
const SectionInternship: React.FC<{
  formData: ProfileIntakeFormData;
  onFieldChange: ProfileIntakePageJSXProps['onFieldChange'];
}> = ({ formData, onFieldChange }) => (
  <div className="pi-section">
    <h2 className="pi-shead">Internship preference</h2>
    <p className="pi-sintro">Tell us when you can start and how long you can commit.</p>

    <div className="pi-row2">
      <div className="pi-field">
        <label className="pi-label">Start date</label>
        <input
          className="pi-input"
          type="date"
          value={formData.startDate}
          onChange={e => onFieldChange('startDate', e.target.value)}
        />
      </div>
      <div className="pi-field">
        <label className="pi-label">Duration</label>
        <div className="pi-select-wrap">
          <select
            className="pi-input pi-select"
            value={formData.duration}
            onChange={e => onFieldChange('duration', e.target.value)}
          >
            <option value="" disabled>Select</option>
            {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <span className="pi-select-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </div>
      </div>
    </div>

    <div className="pi-field">
      <label className="pi-label">Current city</label>
      <input
        className="pi-input"
        type="text"
        placeholder="e.g. Bhilai"
        value={formData.currentCity}
        onChange={e => onFieldChange('currentCity', e.target.value)}
      />
    </div>

    <div className="pi-field">
      <label className="pi-label">Internship city</label>
      <div className="pi-locked-field">
        <span className="pi-locked-value">Raipur</span>
        <span className="pi-lock-icon"><LockIcon /></span>
      </div>
      <p className="pi-helper">Right now we only offer internships in Raipur.</p>
    </div>

    <div className="pi-field">
      <label className="pi-label">Internship field</label>
      <div className="pi-locked-field">
        <span className="pi-locked-value">AI Web Development</span>
        <span className="pi-lock-icon"><LockIcon /></span>
      </div>
      <p className="pi-helper">More fields are coming soon.</p>
    </div>

    <div className="pi-field">
      <div
        className={`pi-checkbox-card${formData.readyToRelocate ? ' checked' : ''}`}
        onClick={() => onFieldChange('readyToRelocate', !formData.readyToRelocate)}
      >
        <div className="pi-checkbox-text">
          <span className="pi-checkbox-title">Ready to relocate</span>
          <span className="pi-checkbox-sub">The internship is in Raipur. Tick this if you can move there.</span>
        </div>
        <span className={`pi-checkbox-box${formData.readyToRelocate ? ' checked' : ''}`}>
          {formData.readyToRelocate && <CheckIcon size={13} />}
        </span>
      </div>
    </div>

    <div className="pi-assurance">
      <span className="pi-assurance-icon"><CheckIcon size={13} /></span>
      <span>Finishing here marks you available to start.</span>
    </div>
  </div>
);

/* ===== Section 3 -- Show your work ===== */
const SectionWork: React.FC<{
  formData: ProfileIntakeFormData;
  onFieldChange: ProfileIntakePageJSXProps['onFieldChange'];
  onProjectLinkChange: ProfileIntakePageJSXProps['onProjectLinkChange'];
  onAddProjectLink: ProfileIntakePageJSXProps['onAddProjectLink'];
  onRemoveProjectLink: ProfileIntakePageJSXProps['onRemoveProjectLink'];
  onResumeChange: ProfileIntakePageJSXProps['onResumeChange'];
}> = ({ formData, onFieldChange, onProjectLinkChange, onAddProjectLink, onRemoveProjectLink, onResumeChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onResumeChange(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="pi-section">
      <h2 className="pi-shead">Show your work</h2>
      <p className="pi-sintro">This is optional. Even one project link helps you get matched.</p>

      <div className="pi-field">
        <label className="pi-label">Resume <span className="pi-label-secondary">· PDF</span></label>
        {formData.resumeFile ? (
          <div className="pi-file-chip">
            <div className="pi-pdf-badge">PDF</div>
            <div className="pi-file-info">
              <span className="pi-file-name">{formData.resumeFile.name}</span>
              <span className="pi-file-status">Uploaded · {formatFileSize(formData.resumeFile.size)}</span>
            </div>
            <button className="pi-file-remove" onClick={() => onResumeChange(null)} aria-label="Remove resume">
              <XIcon />
            </button>
          </div>
        ) : (
          <div
            className="pi-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type === 'application/pdf') onResumeChange(file);
            }}
          >
            <div className="pi-dropzone-icon"><UploadIcon /></div>
            <span className="pi-dropzone-title">Upload your resume</span>
            <span className="pi-dropzone-sub">Tap to browse · PDF · max 5 MB</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <div className="pi-row2">
        <div className="pi-field">
          <label className="pi-label">GitHub</label>
          <div className="pi-icon-input-wrap">
            <span className="pi-input-icon"><GitHubIcon /></span>
            <input
              className="pi-input pi-input-iconed"
              type="url"
              placeholder="github.com/username"
              value={formData.github}
              onChange={e => onFieldChange('github', e.target.value)}
            />
          </div>
        </div>
        <div className="pi-field">
          <label className="pi-label">LinkedIn</label>
          <div className="pi-icon-input-wrap">
            <span className="pi-input-icon"><LinkedInIcon /></span>
            <input
              className="pi-input pi-input-iconed"
              type="url"
              placeholder="linkedin.com/in/username"
              value={formData.linkedin}
              onChange={e => onFieldChange('linkedin', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="pi-field">
        <label className="pi-label">
          Project links <span className="pi-label-secondary">· up to 3</span>
        </label>
        {formData.projectLinks.map((link, i) => (
          <div key={i} className="pi-project-row">
            <input
              className="pi-input"
              type="url"
              placeholder="https://your-project.vercel.app"
              value={link}
              onChange={e => onProjectLinkChange(i, e.target.value)}
            />
            {formData.projectLinks.length > 1 && (
              <button
                className="pi-remove-link"
                onClick={() => onRemoveProjectLink(i)}
                aria-label="Remove link"
              >
                <XIcon />
              </button>
            )}
          </div>
        ))}
        <button
          className={`pi-add-link${formData.projectLinks.length >= 3 ? ' disabled' : ''}`}
          onClick={onAddProjectLink}
          disabled={formData.projectLinks.length >= 3}
        >
          <span className="pi-add-circle"><PlusIcon /></span>
          Add another link
        </button>
        <p className="pi-helper">Deployed projects work best. A live URL the client can open.</p>
      </div>
    </div>
  );
};

/* ===== Done screen ===== */
const DoneScreen: React.FC<{ onHome: () => void }> = ({ onHome }) => (
  <div className="pi-done">
    <div className="pi-done-icon">
      <BigCheckIcon />
    </div>
    <h2 className="pi-done-heading">Profile saved</h2>
    <p className="pi-done-body">
      Saved. The more complete your profile, the better we can match you. Come back and add the rest anytime.
    </p>
    <button className="pi-cta" onClick={onHome}>
      Back to home <ChevronRightIcon />
    </button>
  </div>
);

/* ===== Main component ===== */
const ProfileIntakePageJSX: React.FC<ProfileIntakePageJSXProps> = ({
  step, done, formData, toastVisible, isSaving,
  onContinue, onBack, onSkip, onDoneForNow,
  onFieldChange, onProjectLinkChange, onAddProjectLink, onRemoveProjectLink, onResumeChange,
}) => {
  const navigate = useNavigate();

  const handleHomeNav = () => navigate(PathFor.homePage);

  return (
    <div className="pi-shell">
      {/* app bar */}
      <header className="pi-appbar">
        {/* mobile nav */}
        <div className="pi-nav-m">
          <button className="pi-iconbtn" onClick={handleHomeNav} aria-label="Back to home">
            <ChevronLeftIcon />
          </button>
          <span className="pi-appbar-title">Your profile</span>
          <button className="pi-skip-btn" onClick={onDoneForNow}>Done for now</button>
        </div>
        {/* desktop nav */}
        <div className="pi-nav-d">
          <div className="pi-brand">
            <BrandLogo />
            <span className="pi-brand-name"><b>NetPractice</b></span>
          </div>
          <span className="pi-appbar-spacer" />
          <button className="pi-skip-btn" onClick={onDoneForNow}>Done for now</button>
        </div>
      </header>

      {!done && <MobileStepper step={step} done={done} />}

      <div className="pi-scroll">
        <div className="pi-layout">
          {!done && (
            <div className="pi-head">
              <h1>Your profile</h1>
              <p>Companies match you from your profile. Add what you can now and finish the rest anytime.</p>
            </div>
          )}

          <div className="pi-cols">
            {!done && <DesktopStepper step={step} done={done} />}

            <div className="pi-formcard">
              <div className="pi-cardpad">
                {done ? (
                  <DoneScreen onHome={handleHomeNav} />
                ) : (
                  <>
                    {step === 0 && (
                      <SectionAboutYou formData={formData} onFieldChange={onFieldChange} />
                    )}
                    {step === 1 && (
                      <SectionInternship formData={formData} onFieldChange={onFieldChange} />
                    )}
                    {step === 2 && (
                      <SectionWork
                        formData={formData}
                        onFieldChange={onFieldChange}
                        onProjectLinkChange={onProjectLinkChange}
                        onAddProjectLink={onAddProjectLink}
                        onRemoveProjectLink={onRemoveProjectLink}
                        onResumeChange={onResumeChange}
                      />
                    )}
                  </>
                )}
              </div>

              {!done && (
                <div className="pi-cardfoot">
                  {step > 0 && (
                    <button className="pi-back-btn" onClick={onBack} aria-label="Back">
                      <span className="pi-back-icon"><ChevronLeftIcon /></span>
                      <span className="pi-back-text">Back</span>
                    </button>
                  )}
                  <span className="pi-foot-spacer" />
                  <span className="pi-step-note">Step {step + 1} of 3</span>
                  {step === 2 && (
                    <button className="pi-ghost-btn" onClick={onSkip}>Skip for now</button>
                  )}
                  <button className="pi-cta" onClick={onContinue} disabled={isSaving}>
                    {isSaving ? 'Saving…' : step === 2 ? 'Save' : 'Continue'} <ChevronRightIcon />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* availability toast */}
      <div className={`pi-toast${toastVisible ? ' visible' : ''}`}>
        <span className="pi-toast-check"><CheckIcon size={13} /></span>
        You're now available to start.
      </div>
    </div>
  );
};

export default ProfileIntakePageJSX;
