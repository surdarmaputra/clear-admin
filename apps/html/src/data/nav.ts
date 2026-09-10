export interface NavItem {
  label: string;
  href?: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'house' },
  {
    label: 'Data',
    icon: 'table-2',
    children: [
      { label: 'Tables', href: '/data/tables' },
      { label: 'Spreadsheet', href: '/data/spreadsheet' },
      { label: 'Kanban', href: '/data/kanban' },
    ],
  },
  {
    label: 'Components',
    icon: 'component',
    children: [
      { label: 'Forms', href: '/components/forms' },
      { label: 'Charts', href: '/components/charts' },
      { label: 'Overlays', href: '/components/overlays' },
      { label: 'Feedback', href: '/components/feedback' },
    ],
  },
  { label: 'Files', href: '/files', icon: 'folder' },
  { label: 'Editor', href: '/editor', icon: 'pen-line' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];
