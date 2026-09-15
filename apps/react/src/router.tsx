import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
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
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const DataTablesPage = lazy(() =>
  import('./pages/DataTablesPage').then((m) => ({ default: m.DataTablesPage })),
);
const HeadlessTablePage = lazy(() =>
  import('./pages/HeadlessTablePage').then((m) => ({ default: m.HeadlessTablePage })),
);
const KanbanPage = lazy(() =>
  import('./pages/KanbanPage').then((m) => ({ default: m.KanbanPage })),
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
  component: () => (
    <Lazy>
      <DashboardPage />
    </Lazy>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <Lazy>
      <LoginPage />
    </Lazy>
  ),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => (
    <Lazy>
      <RegisterPage />
    </Lazy>
  ),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: () => (
    <Lazy>
      <ForgotPasswordPage />
    </Lazy>
  ),
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/404',
  component: () => (
    <Lazy>
      <NotFoundPage />
    </Lazy>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <Lazy>
      <ProfilePage />
    </Lazy>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => (
    <Lazy>
      <SettingsPage />
    </Lazy>
  ),
});

const dataTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data/tables',
  component: () => (
    <Lazy>
      <DataTablesPage />
    </Lazy>
  ),
});

const dataHeadlessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data/headless',
  component: () => (
    <Lazy>
      <HeadlessTablePage />
    </Lazy>
  ),
});

const dataKanbanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data/kanban',
  component: () => (
    <Lazy>
      <KanbanPage />
    </Lazy>
  ),
});

const ComponentsFormsPage = lazy(() =>
  import('./pages/ComponentsFormsPage').then((m) => ({ default: m.ComponentsFormsPage })),
);
const ComponentsOverlaysPage = lazy(() =>
  import('./pages/ComponentsOverlaysPage').then((m) => ({ default: m.ComponentsOverlaysPage })),
);
const ComponentsFeedbackPage = lazy(() =>
  import('./pages/ComponentsFeedbackPage').then((m) => ({ default: m.ComponentsFeedbackPage })),
);

const componentsFormsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components/forms',
  component: () => (
    <Lazy>
      <ComponentsFormsPage />
    </Lazy>
  ),
});

const componentsOverlaysRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components/overlays',
  component: () => (
    <Lazy>
      <ComponentsOverlaysPage />
    </Lazy>
  ),
});

const componentsFeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components/feedback',
  component: () => (
    <Lazy>
      <ComponentsFeedbackPage />
    </Lazy>
  ),
});

const FilesPage = lazy(() =>
  import('./pages/FilesPage').then((m) => ({ default: m.FilesPage })),
);
const EditorPage = lazy(() =>
  import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })),
);

const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files',
  component: () => (
    <Lazy>
      <FilesPage />
    </Lazy>
  ),
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/editor',
  component: () => (
    <Lazy>
      <EditorPage />
    </Lazy>
  ),
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

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.BASE_URL,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
