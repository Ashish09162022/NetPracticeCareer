export const STEPS = [
  { label: 'About you', short: 'About you' },
  { label: 'Internship preference', short: 'Internship' },
  { label: 'Show your work', short: 'Your work' },
] as const;

export const GRADUATION_YEARS = ['2024', '2025', '2026', '2027'] as const;

export const STREAMS = ['CS', 'IT', 'ECE', 'Other'] as const;

// value = backend DurationEnum code, label = what the student sees
export const DURATIONS = [
  { value: '45d', label: '45 days' },
  { value: '2mo', label: '2 months' },
  { value: '3mo', label: '3 months' },
  { value: '4mo', label: '4 months' },
  { value: '5mo', label: '5 months' },
  { value: '6mo', label: '6 months' },
] as const;

// Completion weights per step completed: step 0 done → 40%, step 1 done → 80%, all → 100%
export const COMPLETION_PCT = [0, 40, 80, 100] as const;
