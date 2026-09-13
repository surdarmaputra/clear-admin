/** Mock data for the overview page. Replace with your own source. */

/** Twelve points each — enough for a sparkline to show shape, not detail. */
export const trend = {
  revenue: [38, 41, 40, 46, 51, 50, 55, 59, 57, 63, 66, 71],
  orders: [280, 302, 297, 331, 349, 340, 366, 381, 372, 398, 412, 430],
  users: [9.1, 9.6, 10.0, 10.4, 10.7, 11.1, 11.4, 11.8, 12.0, 12.3, 12.6, 12.8],
  churn: [1.4, 1.5, 1.5, 1.6, 1.7, 1.7, 1.8, 1.9, 1.9, 2.0, 2.0, 2.1],
};

export const revenue = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Revenue',
      data: [38200, 41100, 39800, 46300, 51200, 49700, 55400, 58900, 57200, 62800, 66100, 71400],
    },
    {
      name: 'Target',
      data: [40000, 42000, 44000, 46000, 48000, 50000, 52000, 54000, 56000, 58000, 60000, 62000],
    },
  ],
};

export const sessions = {
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  series: [{ name: 'Sessions', data: [4210, 4980, 5320, 5110, 6040, 3870, 3240] }],
};

export const ordersByChannel = {
  categories: ['Direct', 'Search', 'Social', 'Email', 'Affiliate'],
  series: [{ name: 'Orders', data: [1284, 1042, 738, 516, 293] }],
};

export const trafficSources = {
  labels: ['Organic', 'Paid', 'Referral', 'Direct'],
  series: [4820, 2140, 1360, 3210],
};

export type Order = {
  id: string;
  customer: string;
  plan: string;
  status: 'paid' | 'pending' | 'refunded';
  amount: number;
  date: string;
};

export const orders: Order[] = [
  {
    id: 'INV-2041',
    customer: 'Ada Lovelace',
    plan: 'Scale',
    status: 'paid',
    amount: 2400,
    date: '2026-09-09',
  },
  {
    id: 'INV-2040',
    customer: 'Grace Hopper',
    plan: 'Growth',
    status: 'paid',
    amount: 890,
    date: '2026-09-09',
  },
  {
    id: 'INV-2039',
    customer: 'Alan Turing',
    plan: 'Starter',
    status: 'pending',
    amount: 290,
    date: '2026-09-08',
  },
  {
    id: 'INV-2038',
    customer: 'Katherine Johnson',
    plan: 'Scale',
    status: 'paid',
    amount: 2400,
    date: '2026-09-08',
  },
  {
    id: 'INV-2037',
    customer: 'Linus Torvalds',
    plan: 'Growth',
    status: 'refunded',
    amount: 890,
    date: '2026-09-07',
  },
  {
    id: 'INV-2036',
    customer: 'Margaret Hamilton',
    plan: 'Scale',
    status: 'paid',
    amount: 2400,
    date: '2026-09-07',
  },
  {
    id: 'INV-2035',
    customer: 'Barbara Liskov',
    plan: 'Starter',
    status: 'paid',
    amount: 290,
    date: '2026-09-06',
  },
  {
    id: 'INV-2034',
    customer: 'Donald Knuth',
    plan: 'Growth',
    status: 'pending',
    amount: 890,
    date: '2026-09-06',
  },
  {
    id: 'INV-2033',
    customer: 'Radia Perlman',
    plan: 'Scale',
    status: 'paid',
    amount: 2400,
    date: '2026-09-05',
  },
  {
    id: 'INV-2032',
    customer: 'Ken Thompson',
    plan: 'Starter',
    status: 'paid',
    amount: 290,
    date: '2026-09-05',
  },
  {
    id: 'INV-2031',
    customer: 'Frances Allen',
    plan: 'Growth',
    status: 'paid',
    amount: 890,
    date: '2026-09-04',
  },
  {
    id: 'INV-2030',
    customer: 'Dennis Ritchie',
    plan: 'Scale',
    status: 'refunded',
    amount: 2400,
    date: '2026-09-04',
  },
];
