export const STEPS = [
  { label: 'About you', short: 'About you' },
  { label: 'Internship preference', short: 'Internship' },
  { label: 'Show your work', short: 'Your work' },
] as const;

export const GRADUATION_YEARS = ['2024', '2025', '2026', '2027'] as const;

export const STREAMS = ['CS', 'IT', 'ECE', 'Other'] as const;

export const DURATIONS = ['45 days', '2 months', '3 months', '4 months', '5 months', '6 months'] as const;

// Completion weights per step completed: step 0 done → 40%, step 1 done → 80%, all → 100%
export const COMPLETION_PCT = [0, 40, 80, 100] as const;
