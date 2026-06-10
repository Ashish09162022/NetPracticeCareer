export interface Company {
  id: string;
  name: string;
  what: string;
  av: string;
  want: string;
  when: string;
  loc: string;
  mode: string;
  pay: string;
  dur: string;
}

export const COMPANY_POOL: Company[] = [
  {
    id: 'lyte',
    name: 'Lytehouse Studios',
    what: 'Web apps for local businesses',
    av: '#2A6FDB',
    want: 'Saw your meal-ordering build and liked how fast you shipped a clean flow. They want you on a live client tool.',
    when: 'Picked you 2 days ago',
    loc: 'Raipur',
    mode: 'Hybrid',
    pay: '₹18k / mo',
    dur: '3 months',
  },
  {
    id: 'patel',
    name: 'Patel & Co. Digital',
    what: 'Booking software for clinics',
    av: '#1F8A5B',
    want: 'They liked how carefully you scoped requirements. They want your help building their appointment tools.',
    when: 'Picked you yesterday',
    loc: 'Remote',
    mode: 'Remote',
    pay: '₹15k / mo',
    dur: '6 months',
  },
  {
    id: 'bright',
    name: 'BrightLedger',
    what: 'Payment tools for small shops',
    av: '#7A4FD6',
    want: 'Your khata-style thinking caught their eye. They want you on merchant dashboards.',
    when: 'Picked you 3 days ago',
    loc: 'Bhilai',
    mode: 'On-site',
    pay: '₹22k / mo',
    dur: '4 months',
  },
  {
    id: 'nova',
    name: 'Nova Retail Tech',
    what: 'Inventory tools for retailers',
    av: '#C2533B',
    want: 'They noticed how quickly you turned the build around. They want a fast hand on their ordering screens.',
    when: 'Picked you 4 days ago',
    loc: 'Remote',
    mode: 'Remote',
    pay: '₹16k / mo',
    dur: '3 months',
  },
  {
    id: 'green',
    name: 'GreenCart',
    what: 'Grocery ordering for kiranas',
    av: '#3E8E41',
    want: 'They want your eye for clean ordering flows on their customer app.',
    when: 'Picked you 5 days ago',
    loc: 'Raipur',
    mode: 'Hybrid',
    pay: '₹20k / mo',
    dur: '5 months',
  },
];

export const LIVE_COUNT = 3;

export const PASS_REASONS = ['Too far', 'Stipend', 'Work mode', 'Not my domain', 'Other'];
