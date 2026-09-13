import { Banknote, Package, UserMinus, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Chart } from '@/components/charts/Chart';
import {
  orders,
  ordersByChannel,
  revenue,
  sessions,
  trafficSources,
  trend,
} from '@/data/dashboard';

const topCustomers = [
  { name: 'Ada Lovelace', plan: 'Scale', revenue: '$9,600' },
  { name: 'Katherine Johnson', plan: 'Scale', revenue: '$7,200' },
  { name: 'Grace Hopper', plan: 'Growth', revenue: '$3,560' },
  { name: 'Barbara Liskov', plan: 'Starter', revenue: '$1,160' },
];

const statusTone = {
  paid: 'success' as const,
  pending: 'warning' as const,
  refunded: 'danger' as const,
};

export function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard" breadcrumb={[{ label: 'Dashboard' }]}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-title tracking-display font-semibold">Overview</h1>
          <p className="text-caption text-ink-secondary mt-1">
            Revenue, traffic and orders for the current period.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Revenue"
            value="$71,400"
            change="+8.0%"
            caption="vs last month"
            icon={<Banknote size={16} />}
            tone={1}
            trend={trend.revenue}
          />
          <StatCard
            label="Orders"
            value="3,873"
            change="+4.2%"
            caption="vs last month"
            icon={<Package size={16} />}
            tone={3}
            trend={trend.orders}
          />
          <StatCard
            label="Active users"
            value="12,840"
            change="+1.9%"
            caption="vs last month"
            icon={<Users size={16} />}
            tone={7}
            trend={trend.users}
          />
          <StatCard
            label="Churn"
            value="2.1%"
            change="+0.3%"
            higherIsBetter={false}
            caption="vs last month"
            icon={<UserMinus size={16} />}
            tone={2}
            trend={trend.churn}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Chart
            className="xl:col-span-2"
            title="Revenue vs target"
            description="Monthly, current year"
            type="line"
            series={revenue.series}
            categories={revenue.categories}
            slots={[1, 2]}
            height={300}
            valuePrefix="$"
          />
          <Chart
            title="Traffic sources"
            description="Sessions by acquisition channel"
            type="donut"
            series={trafficSources.series}
            labels={trafficSources.labels}
            slots={[1, 2, 3, 4]}
            height={300}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Chart
            title="Sessions"
            description="Last 7 days"
            type="area"
            series={sessions.series}
            categories={sessions.categories}
            slots={[1]}
            height={260}
          />
          <Chart
            title="Orders by channel"
            description="Last 30 days"
            type="bar"
            series={ordersByChannel.series}
            categories={ordersByChannel.categories}
            slots={[3]}
            height={260}
          />
        </div>

        {/* Orders table */}
        <div className="rounded-card border-hairline bg-surface-card shadow-card overflow-hidden border">
          <div className="border-hairline border-b p-5">
            <h2 className="text-title-sm font-semibold">Recent orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="text-caption w-full">
              <thead>
                <tr className="border-hairline bg-surface-sidebar border-b">
                  <th className="text-ink-secondary px-4 py-2 text-left font-medium">Invoice</th>
                  <th className="text-ink-secondary px-4 py-2 text-left font-medium">Customer</th>
                  <th className="text-ink-secondary px-4 py-2 text-left font-medium">Plan</th>
                  <th className="text-ink-secondary px-4 py-2 text-left font-medium">Status</th>
                  <th className="text-ink-secondary px-4 py-2 text-right font-medium">Amount</th>
                  <th className="text-ink-secondary px-4 py-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((row) => (
                  <tr
                    key={row.id}
                    className="border-hairline hover:bg-surface-hover border-b last:border-0"
                  >
                    <td className="tabular px-4 py-2 font-medium">{row.id}</td>
                    <td className="px-4 py-2">{row.customer}</td>
                    <td className="text-ink-secondary px-4 py-2">{row.plan}</td>
                    <td className="px-4 py-2">
                      <Badge tone={statusTone[row.status]}>{row.status}</Badge>
                    </td>
                    <td className="tabular px-4 py-2 text-right">
                      ${row.amount.toLocaleString('en-US')}
                    </td>
                    <td className="tabular text-ink-secondary px-4 py-2 text-right">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Card title="Top customers" description="By revenue this quarter">
          <ul className="divide-hairline flex flex-col divide-y">
            {topCustomers.map((customer) => (
              <li key={customer.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={customer.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-caption truncate font-medium">{customer.name}</p>
                  <p className="text-micro text-ink-secondary">{customer.plan}</p>
                </div>
                <p className="tabular text-caption font-medium">{customer.revenue}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
