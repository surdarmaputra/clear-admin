import { useState } from 'react';
import { Archive, Copy, FileJson, FileText, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Drawer } from '@/components/ui/Drawer';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { toast } from '@/lib/toast';

type ModalId = 'confirm-delete' | 'new-customer' | null;
type DrawerId = 'order-detail' | 'filters' | null;

const tabItems = [
  {
    id: 'details',
    label: 'Details',
    content: <p className="text-caption text-ink-secondary">Order #1042 · placed 12 March · paid by card.</p>,
  },
  {
    id: 'members',
    label: 'Members',
    content: <p className="text-caption text-ink-secondary">Ada Lovelace, Grace Hopper and 2 others can see this order.</p>,
  },
  {
    id: 'activity',
    label: 'Activity',
    content: <p className="text-caption text-ink-secondary">Refund requested 2 days ago, still awaiting review.</p>,
  },
];

export function ComponentsOverlaysPage() {
  const [modal, setModal] = useState<ModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);

  return (
    <DashboardLayout
      title="Overlays"
      breadcrumb={[{ label: 'Components' }, { label: 'Overlays' }]}
    >
      <div className="flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-display text-title font-semibold tracking-display">Overlays</h1>
          <p className="mt-1 text-caption text-ink-secondary">
            Everything a CRUD screen layers over the page. Modal and drawer trap focus and return it
            to the trigger on close.
          </p>
        </div>

        <Card title="Dropdown menu" description="Arrow keys move between items; Escape closes.">
          <div className="flex flex-wrap gap-3">
            <Dropdown label="Actions">
              <DropdownItem icon={<Pencil size={16} />} onClick={() => toast.show('Editing order #1042')}>
                Edit order
              </DropdownItem>
              <DropdownItem icon={<Copy size={16} />} onClick={() => toast.show('Duplicated order #1042')}>
                Duplicate
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 size={16} />}
                tone="danger"
                onClick={() => toast.show('Order deleted', 'danger')}
              >
                Delete
              </DropdownItem>
            </Dropdown>

            <Dropdown label="Export" align="end">
              <DropdownItem icon={<FileText size={16} />} onClick={() => toast.show('Exporting CSV', 'success')}>
                CSV
              </DropdownItem>
              <DropdownItem icon={<FileJson size={16} />} onClick={() => toast.show('Exporting JSON', 'success')}>
                JSON
              </DropdownItem>
            </Dropdown>
          </div>
        </Card>

        <Card title="Tooltip" description="Reveals on hover and on keyboard focus, never hover alone.">
          <div className="flex flex-wrap items-center gap-4">
            <Tooltip text="Refresh the table without reloading the page">
              <Button variant="secondary">
                <RefreshCw size={16} /> Refresh
              </Button>
            </Tooltip>

            <Tooltip text="Archived orders stay searchable for 90 days." placement="bottom">
              <Button variant="ghost">
                <Archive size={16} /> Archive
              </Button>
            </Tooltip>
          </div>
        </Card>

        <Card title="Modal" description="A dialog for a decision or a short form.">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModal('confirm-delete')}>Delete order</Button>
            <Button variant="secondary" onClick={() => setModal('new-customer')}>
              New customer
            </Button>
          </div>
        </Card>

        <Card title="Drawer" description="The same contract, anchored to an edge.">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setDrawer('order-detail')}>
              Order details
            </Button>
            <Button variant="secondary" onClick={() => setDrawer('filters')}>
              Filters
            </Button>
          </div>
        </Card>

        <Card title="Tabs" description="Roving tabindex — one Tab stop, arrow keys move between tabs.">
          <Tabs tabs={tabItems} />
        </Card>
      </div>

      {/* Modals */}
      <Modal
        open={modal === 'confirm-delete'}
        onClose={() => setModal(null)}
        title="Delete this order?"
        description="Order #1042 will be removed for everyone. This cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setModal(null);
                toast.show('Order deleted', 'danger');
              }}
            >
              Delete order
            </Button>
          </>
        }
      >
        Refunds already issued against this order are kept for accounting.
      </Modal>

      <Modal
        open={modal === 'new-customer'}
        onClose={() => setModal(null)}
        title="New customer"
        description="They get an invite by email."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setModal(null);
                toast.show('Customer added', 'success');
              }}
            >
              Add customer
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input id="customer-name" label="Full name" placeholder="Ada Lovelace" />
          <Input id="customer-email" label="Email" type="email" placeholder="ada@example.com" />
        </div>
      </Modal>

      {/* Drawers */}
      <Drawer
        open={drawer === 'order-detail'}
        onClose={() => setDrawer(null)}
        title="Order #1042"
        footer={
          <Button variant="secondary" onClick={() => setDrawer(null)}>
            Close
          </Button>
        }
      >
        <dl className="flex flex-col gap-3">
          {[
            ['Customer', 'Ada Lovelace'],
            ['Plan', 'Scale'],
            ['Amount', '$1,240'],
          ].map(([dt, dd]) => (
            <div key={dt} className="flex justify-between gap-4">
              <dt>{dt}</dt>
              <dd className="text-ink-primary tabular">{dd}</dd>
            </div>
          ))}
        </dl>
      </Drawer>

      <Drawer
        open={drawer === 'filters'}
        onClose={() => setDrawer(null)}
        title="Filters"
        side="left"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDrawer(null);
                toast.show('Filters applied');
              }}
            >
              Apply
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input id="filter-customer" label="Customer" placeholder="Any" />
          <Input id="filter-min" label="Minimum amount" type="number" placeholder="0" />
        </div>
      </Drawer>
    </DashboardLayout>
  );
}
