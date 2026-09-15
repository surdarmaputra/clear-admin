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

|               | `apps/html`                                         | `apps/react`            |
| ------------- | --------------------------------------------------- | ----------------------- |
| Target        | Blade, Edge, any server-rendered app                | React SPA               |
| Output        | `dist/` — plain HTML + CSS + JS                     | copyable source tree    |
| Interactivity | Alpine.js                                           | React 19                |
| Primitives    | hand-rolled + Alpine                                | shadcn/ui (Radix)       |
| Charts        | Chart.js                                            | Chart.js (D12)          |
| Tables        | hand-rolled on Alpine + `@tanstack/table-core` page | `@tanstack/react-table` |
| Editor        | `lexical` (vanilla, editor page only)               | `@lexical/react`        |
| Drag & drop   | SortableJS (kanban page only)                       | dnd-kit                 |
| Router        | n/a                                                 | TanStack Router         |
| Authoring     | Astro (build tool only — `.astro` is never shipped) | React + Vite            |

The HTML table is hand-rolled on Alpine and is the reference implementation. A
second page on `@tanstack/table-core` shipped in M4c under
[RFC-001 D9](rfc/RFC-001-completing-clear-admin-v5.md), so a consumer can pick
an approach; it only carries features the headless core makes materially easier —
faceted filters, column visibility, ordering and pinning. The core is fetched by
a dynamic import, so only that page pays its 17.1 KB gz.

Shared across both: Tailwind CSS v4, TypeScript (strict), class-based dark mode,
Motion for animation, Vite.

Pages stay router-agnostic: navigation goes through a `Link` component and a
`useNav()` shim, so swapping TanStack Router for React Router is a one-file change
rather than an edit to every page.

Lexical, SortableJS and `@tanstack/table-core` are fetched by dynamic import,
keyed on an attribute the page carries, so only the page using one pays for it
([RFC-001 D10](rfc/RFC-001-completing-clear-admin-v6.md)). The lightbox has no
dependency at all: it is a dialog over the same overlay store and focus trap the
modal and drawer use, which measured 17.0 KB gz cheaper than PhotoSwipe (D11).

The HTML bundle's `astro build` output doubles as the live demo site — same
artifact, deployed.

---

## Layout

| Component                                     | Priority | HTML | React |
| --------------------------------------------- | -------- | ---- | ----- |
| App shell / page wrapper                      | P0       | done | done  |
| Sidebar — collapsible, nested nav             | P0       | done | done  |
| Topbar — breadcrumb, notifications, user menu | P0       | done | done  |
| Theme toggle (light/dark)                     | P0       | done | done  |
| Responsive behaviour — mobile drawer nav      | P0       | done | done  |

## Data display

| Component                                     | Priority | HTML | React |
| --------------------------------------------- | -------- | ---- | ----- |
| Card                                          | P0       | done | done  |
| Stat card / KPI tile                          | P1       | done | done  |
| Sparkline                                     | P2       | done | done  |
| Badge                                         | P0       | done | done  |
| Avatar                                        | P0       | done | done  |
| Chart — line                                  | P1       | done | done  |
| Chart — bar                                   | P1       | done | done  |
| Chart — area                                  | P1       | done | done  |
| Chart — pie / donut                           | P1       | done | done  |
| Data table — sortable, paginated              | P1       | done | done  |
| Pagination                                    | P1       | done | done  |
| Data table — server-side filter/sort/paginate | P2       | done | done  |
| Data table — resizable columns                | P2       | done | done  |
| Data table — edit in cell                     | P2       | done | done  |

## Feedback & state

| Component                | Priority | HTML | React |
| ------------------------ | -------- | ---- | ----- |
| Alert                    | P1       | done | done  |
| Toast / notification     | P1       | done | done  |
| Empty state              | P1       | done | done  |
| Error state              | P1       | done | done  |
| Loading state / skeleton | P1       | done | done  |
| Spinner                  | P1       | done | done  |
| Progress — bar           | P1       | done | done  |
| Progress — circle        | P1       | done | done  |

## Overlay

| Component     | Priority | HTML | React |
| ------------- | -------- | ---- | ----- |
| Dropdown menu | P0       | done | done  |
| Tooltip       | P1       | done | done  |
| Modal         | P1       | done | done  |
| Drawer        | P1       | done | done  |

## Navigation

| Component  | Priority | HTML | React |
| ---------- | -------- | ---- | ----- |
| Breadcrumb | P0       | done | done  |
| Tabs       | P1       | done | done  |

## Forms

| Component                            | Priority | HTML | React |
| ------------------------------------ | -------- | ---- | ----- |
| Button                               | P0       | done | done  |
| Input                                | P0       | done | done  |
| Textarea                             | P0       | done | done  |
| Select                               | P0       | done | done  |
| Checkbox                             | P0       | done | done  |
| Radio                                | P0       | done | done  |
| Switch                               | P1       | done | done  |
| Date picker                          | P1       | done | done  |
| Rich text editor — Lexical, markdown | P2       | done | —     |

## Files & media

| Component                 | Priority | HTML | React |
| ------------------------- | -------- | ---- | ----- |
| File upload — drag & drop | P2       | done | —     |
| File preview              | P2       | done | —     |
| Image preview / lightbox  | P2       | done | —     |

## Interaction

| Component                  | Priority | HTML | React |
| -------------------------- | -------- | ---- | ----- |
| Kanban board — drag & drop | P2       | done | done  |

---

## Pages

| Page                  | Priority | HTML | React |
| --------------------- | -------- | ---- | ----- |
| Blank page template   | P0       | done | done  |
| Components — forms    | P1       | done | done  |
| Components — overlays | P1       | done | done  |
| Components — feedback | P1       | done | done  |
| Data — tables         | P2       | done | done  |
| Data — headless table | P2       | done | done  |
| Dashboard — overview  | P1       | done | done  |
| Login                 | P1       | done | done  |
| Register              | P1       | done | done  |
| Password reset        | P1       | done | done  |
| 404                   | P1       | done | done  |
| Profile               | P2       | done | done  |
| Settings              | P2       | done | done  |
| Editor                | P2       | done | —     |
| Files                 | P2       | done | —     |
| Data — kanban         | P2       | done | done  |

---

## Out of scope for v1

- **Spreadsheet-style table editing** — descoped in
  [RFC-001 D1](rfc/RFC-001-completing-clear-admin-v3.md). Cell edit and keyboard
  navigation shipped instead; formulas, fill handle and multi-cell paste are out.
- **Map** — cut. Heavy dependency, and provider choice (Leaflet vs Mapbox vs Google)
  pushes licensing decisions onto consumers.
- **Astro / Vue / Angular bundles** — HTML and React only.
- **npm-published component library** — the deliverable is a copyable source tree,
  not a versioned package. Revisit if demand appears.
