# Component & Page Tracker

Implementation status for both bundles. HTML ships first (primary target: Laravel,
AdonisJS, and other server-rendered monoliths); React follows to parity.

**Status:** `—` not started · `WIP` in progress · `done` complete

**Priority:** `P0` needed by every page · `P1` core dashboard surface · `P2` specialised

---

## Stack

Two self-contained bundles. No shared code between them — each is copied wholesale
into a consumer project, so each carries its own `theme.css`, Tailwind config, and
dependencies. Consistency is maintained through this tracker and repo co-location,
not through a shared package.

| | `apps/html` | `apps/react` |
|---|---|---|
| Target | Blade, Edge, any server-rendered app | React SPA |
| Output | `dist/` — plain HTML + CSS + JS | copyable source tree |
| Interactivity | Alpine.js | React 19 |
| Primitives | hand-rolled + Alpine | shadcn/ui (Radix) |
| Charts | ApexCharts | Recharts |
| Tables | `@tanstack/table-core` | `@tanstack/react-table` |
| Editor | `lexical` (vanilla) | `@lexical/react` |
| Drag & drop | SortableJS | dnd-kit |
| Router | n/a | TanStack Router |
| Authoring | Astro (build tool only — `.astro` is never shipped) | React + Vite |

Shared across both: Tailwind CSS v4, TypeScript (strict), class-based dark mode,
Motion for animation, Vite.

Pages stay router-agnostic: navigation goes through a `Link` component and a
`useNav()` shim, so swapping TanStack Router for React Router is a one-file change
rather than an edit to every page.

The HTML bundle's `astro build` output doubles as the live demo site — same
artifact, deployed.

---

## Layout

| Component | Priority | HTML | React |
|---|---|---|---|
| App shell / page wrapper | P0 | — | — |
| Sidebar — collapsible, nested nav | P0 | — | — |
| Topbar — breadcrumb, notifications, user menu | P0 | — | — |
| Theme toggle (light/dark) | P0 | — | — |
| Responsive behaviour — mobile drawer nav | P0 | — | — |

## Data display

| Component | Priority | HTML | React |
|---|---|---|---|
| Card | P0 | — | — |
| Stat card / KPI tile | P1 | — | — |
| Badge | P0 | — | — |
| Avatar | P0 | — | — |
| Chart — line | P1 | — | — |
| Chart — bar | P1 | — | — |
| Chart — area | P1 | — | — |
| Chart — pie / donut | P1 | — | — |
| Data table — sortable, paginated | P1 | — | — |
| Pagination | P1 | — | — |
| Data table — server-side filter/sort/paginate | P2 | — | — |
| Data table — resizable columns | P2 | — | — |
| Data table — edit in cell | P2 | — | — |
| Spreadsheet-style table editing | P2 | — | — |

## Feedback & state

| Component | Priority | HTML | React |
|---|---|---|---|
| Alert | P1 | — | — |
| Toast / notification | P1 | — | — |
| Empty state | P1 | — | — |
| Error state | P1 | — | — |
| Loading state / skeleton | P1 | — | — |
| Spinner | P1 | — | — |
| Progress — bar | P1 | — | — |
| Progress — circle | P1 | — | — |

## Overlay

| Component | Priority | HTML | React |
|---|---|---|---|
| Dropdown menu | P0 | — | — |
| Tooltip | P1 | — | — |
| Modal | P1 | — | — |
| Drawer | P1 | — | — |

## Navigation

| Component | Priority | HTML | React |
|---|---|---|---|
| Breadcrumb | P0 | — | — |
| Tabs | P1 | — | — |

## Forms

| Component | Priority | HTML | React |
|---|---|---|---|
| Input | P0 | — | — |
| Textarea | P0 | — | — |
| Select | P0 | — | — |
| Checkbox | P0 | — | — |
| Radio | P0 | — | — |
| Switch | P1 | — | — |
| Date picker | P1 | — | — |
| Rich text editor — Lexical, markdown | P2 | — | — |

## Files & media

| Component | Priority | HTML | React |
|---|---|---|---|
| File upload — drag & drop | P2 | — | — |
| File preview | P2 | — | — |
| Image preview / lightbox | P2 | — | — |

## Interaction

| Component | Priority | HTML | React |
|---|---|---|---|
| Kanban board — drag & drop | P2 | — | — |

---

## Pages

| Page | Priority | HTML | React |
|---|---|---|---|
| Blank page template | P0 | — | — |
| Dashboard — overview | P1 | — | — |
| Login | P1 | — | — |
| Register | P1 | — | — |
| Password reset | P1 | — | — |
| 404 | P1 | — | — |
| Profile | P2 | — | — |
| Settings | P2 | — | — |

---

## Out of scope for v1

- **Map** — cut. Heavy dependency, and provider choice (Leaflet vs Mapbox vs Google)
  pushes licensing decisions onto consumers.
- **Astro / Vue / Angular bundles** — HTML and React only.
- **npm-published component library** — the deliverable is a copyable source tree,
  not a versioned package. Revisit if demand appears.
