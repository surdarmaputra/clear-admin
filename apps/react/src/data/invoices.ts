import type { Order } from './dashboard';

const customers = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Barbara Liskov',
  'Edsger Dijkstra',
  'Margaret Hamilton',
  'Donald Knuth',
  'Radia Perlman',
  'Ken Thompson',
  'Frances Allen',
  'Tim Berners-Lee',
];

const plans = ['Starter', 'Growth', 'Scale'];
const statuses: Order['status'][] = ['paid', 'pending', 'refunded'];

export const invoices: Order[] = Array.from({ length: 48 }, (_, index) => {
  const day = 28 - (index % 28);
  return {
    id: `INV-${2100 - index}`,
    customer: customers[index % customers.length]!,
    plan: plans[index % plans.length]!,
    status: statuses[index % 7 === 0 ? 2 : index % 3 === 0 ? 1 : 0]!,
    amount: 240 + ((index * 137) % 43) * 60,
    date: `2026-0${index % 2 === 0 ? 8 : 9}-${String(day).padStart(2, '0')}`,
  };
});
