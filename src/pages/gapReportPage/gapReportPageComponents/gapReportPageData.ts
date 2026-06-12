export const GAP_CONFIG = {
  passMark: 90,
  scholarshipFloor: 70,
  scholarshipPct: 50,
  pathPrice: 5000,
  clientName: 'Raipur Tiffin Co.',
} as const;

export type ScoreTier = 'low' | 'scholarship' | 'pass' | 'capped_by_late';

export function getTier(score: number, scenario?: string | null): ScoreTier {
  if (scenario === 'capped_by_late') return 'capped_by_late';
  if (score >= GAP_CONFIG.passMark) return 'pass';
  if (score >= GAP_CONFIG.scholarshipFloor) return 'scholarship';
  return 'low';
}

export type ReqStatus = 'met' | 'partial' | 'miss' | 'unverifiable';
export type NoteKind = 'pos' | 'neg' | 'tip';

export interface Req {
  name: string;
  why: string;
  status: ReqStatus;
}

export interface Note {
  kind: NoteKind;
  bold: string;
  text: string;
}

export interface BreakdownData {
  metCount: number;
  totalCount: number;
  segments: ReqStatus[];
  reqs: Req[];
  reqNotes: Note[];
  commNotes: Note[];
  deliveryLate: boolean;
}

export const BREAKDOWN_NOT_PASS: BreakdownData = {
  metCount: 5,
  totalCount: 8,
  segments: ['met', 'met', 'met', 'met', 'met', 'partial', 'miss', 'miss'],
  reqs: [
    { name: 'Browse the daily menu', why: "Loads the owner’s menu and refreshes each day.", status: 'met' },
    { name: 'Place an order for a chosen date', why: 'Date picker and cart complete the order cleanly.', status: 'met' },
    { name: 'Owner can edit the daily menu', why: 'Add, edit and remove items all work.', status: 'met' },
    { name: 'Cash-on-delivery payment', why: 'COD flow confirms and records the order.', status: 'met' },
    { name: 'Order confirmation with order number', why: 'Clear confirmation screen after checkout.', status: 'met' },
    { name: 'Re-order from past orders', why: "Order history shows, but the re-order button isn’t wired up yet.", status: 'partial' },
    { name: '9 PM daily order cutoff', why: 'The kitchen needs orders to close at 9 PM so they can shop and prep.', status: 'miss' },
  ],
  reqNotes: [
    { kind: 'pos', bold: 'You scoped the menu well.', text: 'Good questions about daily updates and who manages items.' },
    { kind: 'neg', bold: 'You missed the business model.', text: 'The client leads with subscriptions—that question never came up.' },
    { kind: 'neg', bold: "You didn’t ask about timing.", text: 'Order cutoff and delivery areas were left unexplored.' },
  ],
  commNotes: [
    { kind: 'pos', bold: 'Clear and professional.', text: 'You explained your choices in plain language the client followed.' },
    { kind: 'pos', bold: 'Polite and steady.', text: 'You kept a respectful tone even when the client changed their mind.' },
    { kind: 'tip', bold: 'Keep them posted when you go quiet.', text: 'A couple of replies were slow. A quick “working on it” keeps clients calm.' },
  ],
  deliveryLate: true,
};

export const BREAKDOWN_PASS: BreakdownData = {
  metCount: 7,
  totalCount: 8,
  segments: [‘met’, ‘met’, ‘met’, ‘met’, ‘met’, ‘met’, ‘met’, ‘partial’],
  reqs: [
    { name: ‘9 PM daily order cutoff’, why: ‘Orders close at 9 PM so the kitchen can shop and prep—exactly what they needed.’, status: ‘met’ },
    { name: ‘Browse the daily menu & place orders’, why: ‘Menu loads, refreshes daily, and the date picker and cart complete cleanly.’, status: ‘met’ },
    { name: ‘Owner can edit the daily menu’, why: ‘Add, edit and remove items all work for the owner.’, status: ‘met’ },
    { name: ‘Cash-on-delivery & order confirmation’, why: ‘COD flow confirms, records the order, and shows a clear order number.’, status: ‘met’ },
    { name: ‘Re-order from past orders’, why: "History shows and the button’s wired. Just needs a confirmation step, a small polish.", status: ‘partial’ },
  ],
  reqNotes: [
    { kind: ‘pos’, bold: ‘You found the business model.’, text: ‘You asked how the client makes money and caught that subscriptions are the heart of it.’ },
    { kind: ‘pos’, bold: ‘You nailed the timing.’, text: ‘Order cutoff and delivery areas came up early, so nothing was a surprise.’ },
  ],
  commNotes: [
    { kind: ‘pos’, bold: ‘Clear and professional.’, text: ‘You explained your choices in plain language the client followed.’ },
    { kind: ‘pos’, bold: ‘Kept the client posted.’, text: ‘Steady updates meant they always knew where things stood.’ },
  ],
  deliveryLate: false,
};

export const BREAKDOWN_CAPPED_BY_LATE: BreakdownData = BREAKDOWN_PASS;
