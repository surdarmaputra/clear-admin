import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const PlaceholderPage = lazy(() =>
  import('./pages/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })),
);

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Lazy><DashboardPage /></Lazy>,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <Lazy><LoginPage /></Lazy>,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => <Lazy><RegisterPage /></Lazy>,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: () => <Lazy><ForgotPasswordPage /></Lazy>,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: () => <Lazy><NotFoundPage /></Lazy>,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => <Lazy><PlaceholderPage title="Profile" /></Lazy>,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => <Lazy><PlaceholderPage title="Settings" /></Lazy>,
});

const dataTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data/tables',
  component: () => <Lazy><PlaceholderPage title="Tables" /></Lazy>,
});

const dataHeadlessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data/headless',
  component: () => <Lazy><PlaceholderPage title="Headless table" /></Lazy>,
});

const dataKanbanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data/kanban',
  component: () => <Lazy><PlaceholderPage title="Kanban" /></Lazy>,
});

const componentsFormsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components/forms',
  component: () => <Lazy><PlaceholderPage title="Forms" /></Lazy>,
});

const componentsOverlaysRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components/overlays',
  component: () => <Lazy><PlaceholderPage title="Overlays" /></Lazy>,
});

const componentsFeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components/feedback',
  component: () => <Lazy><PlaceholderPage title="Feedback" /></Lazy>,
});

const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files',
  component: () => <Lazy><PlaceholderPage title="Files" /></Lazy>,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor',
  component: () => <Lazy><PlaceholderPage title="Editor" /></Lazy>,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  notFoundRoute,
  profileRoute,
  settingsRoute,
  dataTablesRoute,
  dataHeadlessRoute,
  dataKanbanRoute,
  componentsFormsRoute,
  componentsOverlaysRoute,
  componentsFeedbackRoute,
  filesRoute,
  editorRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
