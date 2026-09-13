export interface NavItem {
  label: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'house' },
  {
    label: 'Data',
    icon: 'table-2',
    children: [
      { label: 'Tables', href: '/data/tables' },
      { label: 'Headless table', href: '/data/headless' },
      { label: 'Kanban', href: '/data/kanban' },
    ],
  },
  {
    label: 'Components',
    icon: 'component',
    children: [
      { label: 'Forms', href: '/components/forms' },
      { label: 'Overlays', href: '/components/overlays' },
      { label: 'Feedback', href: '/components/feedback' },
    ],
  },
  {
    label: 'Pages',
    icon: 'file-text',
    children: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'Password reset', href: '/forgot-password' },
      { label: '404', href: '/404' },
    ],
  },
  { label: 'Files', href: '/files', icon: 'folder' },
  { label: 'Editor', href: '/editor', icon: 'pen-line' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];
