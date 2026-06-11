export type RecoType = 'pass' | 'border' | 'fail';
export type DeliveryType = 'ontime' | 'late';
export type DimScoreClass = 'good' | 'warn' | 'bad';
export type ReqStatus = 'met' | 'part' | 'miss';
export type NoteType = 'pos' | 'neg' | 'tip';

export interface Requirement {
  s: ReqStatus;
  n: string;
  why?: string;
  miss?: boolean;
  notask?: boolean;
}

export interface NoteItem {
  t: NoteType;
  h: string;
  b: string;
}

export interface BuildDimension {
  score: string;
  cls: DimScoreClass;
  reqs: Requirement[];
}

export interface NotesDimension {
  score: string;
  cls: DimScoreClass;
  notes: NoteItem[];
}

export interface Submission {
  id: number;
  name: string;
  init: string;
  avail: boolean;
  brief: string;
  reco: RecoType;
  recoLabel: string;
  score: number;
  time: string;
  delivery: DeliveryType;
  deliveryLabel: string;
  summary: string;
  build: BuildDimension;
  gather: NotesDimension;
  comm: NotesDimension;
}

export const SUBMISSIONS: Submission[] = [
  {
    id: 1, name: 'Aman Verma', init: 'AV', avail: true,
    brief: 'Raipur Tiffin Co. · meal ordering app',
    reco: 'border', recoLabel: 'Almost there', score: 68,
    time: '12 min ago', delivery: 'late', deliveryLabel: '6h late',
    summary: 'Solid core build (5/8). Missed the subscription feature and the 9 PM cutoff, never scoped them. Communication strong.',
    build: {
      score: '5 / 8 met', cls: 'warn',
      reqs: [
        { s: 'met', n: 'Browse the daily menu' },
        { s: 'met', n: 'Place an order for a date' },
        { s: 'met', n: 'Owner edits menu' },
        { s: 'met', n: 'Cash on delivery' },
        { s: 'met', n: 'Order confirmation' },
        { s: 'part', n: 'Re-order from history', why: '· not wired' },
        { s: 'miss', n: 'Weekly/monthly subscriptions', why: "· client's main ask", miss: true },
        { s: 'miss', n: '9 PM order cutoff', why: '', miss: true, notask: true },
      ],
    },
    gather: {
      score: 'Needs work', cls: 'warn',
      notes: [
        { t: 'pos', h: 'Scoped the menu well.', b: 'asked who manages items + daily updates.' },
        { t: 'neg', h: 'Missed the business model.', b: 'subscriptions never came up.' },
        { t: 'neg', h: "Didn't ask about timing.", b: 'cutoff & delivery areas unexplored.' },
      ],
    },
    comm: {
      score: 'Good', cls: 'good',
      notes: [
        { t: 'pos', h: 'Clear & professional.', b: 'explained choices plainly.' },
        { t: 'tip', h: 'Slow to reply twice.', b: 'a quick ack would help.' },
      ],
    },
  },
  {
    id: 2, name: 'Priya Nair', init: 'PN', avail: true,
    brief: 'Sharma Dental · appointment booking',
    reco: 'pass', recoLabel: 'Ready', score: 86,
    time: '31 min ago', delivery: 'ontime', deliveryLabel: 'On time',
    summary: 'Strong, complete build (8/8). Thorough requirement-gathering, asked about edge cases. Clear recommendation: Ready.',
    build: {
      score: '8 / 8 met', cls: 'good',
      reqs: [
        { s: 'met', n: 'Browse available slots' },
        { s: 'met', n: 'Book with name + phone' },
        { s: 'met', n: 'Reason for visit field' },
        { s: 'met', n: "Owner sees day's bookings" },
        { s: 'met', n: 'Block closed slots' },
        { s: 'met', n: 'SMS confirmation' },
        { s: 'met', n: 'Reschedule flow' },
        { s: 'met', n: 'Cancel flow' },
      ],
    },
    gather: {
      score: 'Strong', cls: 'good',
      notes: [
        { t: 'pos', h: 'Excellent scoping.', b: 'asked about dentists, slots, closed days.' },
        { t: 'pos', h: 'Caught edge cases.', b: 'what if a patient no-shows?' },
      ],
    },
    comm: {
      score: 'Excellent', cls: 'good',
      notes: [
        { t: 'pos', h: 'Crisp and warm.', b: 'confirmed understanding before building.' },
      ],
    },
  },
  {
    id: 3, name: 'Rohit Sahu', init: 'RS', avail: false,
    brief: 'Verma Hardware · credit khata tracker',
    reco: 'fail', recoLabel: 'Not ready', score: 41,
    time: '1 hr ago', delivery: 'late', deliveryLabel: '18h late',
    summary: 'Incomplete build (3/8). Core credit-tracking logic missing. Agreed to build before scoping. Recommend: Not ready, route to path.',
    build: {
      score: '3 / 8 met', cls: 'bad',
      reqs: [
        { s: 'met', n: 'Customer list' },
        { s: 'met', n: 'Add a purchase' },
        { s: 'met', n: 'Basic total' },
        { s: 'part', n: 'Mark balance paid', why: '· partial' },
        { s: 'miss', n: 'Per-customer credit limit', why: '', miss: true, notask: true },
        { s: 'miss', n: 'Monthly statement', why: '', miss: true },
        { s: 'miss', n: 'Payment reminders', why: '', miss: true, notask: true },
        { s: 'miss', n: 'Owner-only access', why: '', miss: true },
      ],
    },
    gather: {
      score: 'Weak', cls: 'bad',
      notes: [
        { t: 'neg', h: 'Agreed before understanding.', b: 'committed to build on message one.' },
        { t: 'neg', h: 'No questions on limits.', b: 'core to a khata system.' },
      ],
    },
    comm: {
      score: 'Fair', cls: 'warn',
      notes: [
        { t: 'pos', h: 'Polite throughout.', b: '' },
        { t: 'tip', h: 'Over-promised early.', b: 'set expectations before scoping.' },
      ],
    },
  },
  {
    id: 4, name: 'Sneha Patel', init: 'SP', avail: true,
    brief: 'Gupta Tuition · scores & attendance portal',
    reco: 'pass', recoLabel: 'Ready', score: 82,
    time: '2 hrs ago', delivery: 'ontime', deliveryLabel: 'On time',
    summary: 'Complete build (7/8), one minor partial. Good scoping. Communication clear. Recommend: Ready.',
    build: {
      score: '7 / 8 met', cls: 'good',
      reqs: [
        { s: 'met', n: 'Parent login' },
        { s: 'met', n: 'View test scores' },
        { s: 'met', n: 'View attendance' },
        { s: 'met', n: 'Teacher adds scores' },
        { s: 'met', n: 'Mark attendance' },
        { s: 'met', n: 'Per-child view' },
        { s: 'part', n: 'Score trend chart', why: '· basic only' },
        { s: 'met', n: 'Mobile friendly' },
      ],
    },
    gather: {
      score: 'Good', cls: 'good',
      notes: [
        { t: 'pos', h: 'Asked about multiple children per parent.', b: '' },
        { t: 'tip', h: 'Could probe privacy needs.', b: 'who sees what.' },
      ],
    },
    comm: {
      score: 'Good', cls: 'good',
      notes: [
        { t: 'pos', h: 'Professional and timely.', b: '' },
      ],
    },
  },
  {
    id: 5, name: 'Karan Singh', init: 'KS', avail: false,
    brief: 'Raipur Cycles · rental & return tracker',
    reco: 'border', recoLabel: 'Almost there', score: 71,
    time: '3 hrs ago', delivery: 'ontime', deliveryLabel: 'On time',
    summary: "Good build (6/8). Missed late-fee logic and a return-condition note. Decent scoping. Borderline. Reviewer's call.",
    build: {
      score: '6 / 8 met', cls: 'warn',
      reqs: [
        { s: 'met', n: 'Cycle inventory' },
        { s: 'met', n: 'Rent out a cycle' },
        { s: 'met', n: 'Record return' },
        { s: 'met', n: 'Customer details' },
        { s: 'met', n: 'Daily rate' },
        { s: 'met', n: 'Availability view' },
        { s: 'miss', n: 'Late-fee calculation', why: '', miss: true },
        { s: 'miss', n: 'Return condition note', why: '', miss: true, notask: true },
      ],
    },
    gather: {
      score: 'Fair', cls: 'warn',
      notes: [
        { t: 'pos', h: 'Covered rates and availability.', b: '' },
        { t: 'neg', h: 'Missed late returns.', b: 'common in rentals.' },
      ],
    },
    comm: {
      score: 'Good', cls: 'good',
      notes: [
        { t: 'pos', h: 'Clear and responsive.', b: '' },
      ],
    },
  },
];
