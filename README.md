# Clear Admin

A comprehensive dashboard template in two self-contained bundles — plain HTML for
server-rendered apps, and React for SPAs.

**Status: early.** The HTML bundle has its layout shell; components are landing
milestone by milestone. The React bundle has not started. See
[`docs/components.md`](docs/components.md) for exactly what exists today, and
[RFC-001](docs/rfc/RFC-001-completing-clear-admin-v3.md) for the plan.

## The two bundles

They share **no code**. That is deliberate: you copy one folder into your project
and it works, with no shared package to vendor alongside it. The trade is that
every component is built twice.

|               | `apps/html`                                    | `apps/react`            |
| ------------- | ---------------------------------------------- | ----------------------- |
| For           | Laravel Blade, AdonisJS Edge, any SSR view     | React single-page apps  |
| Output        | `dist/` — plain HTML, CSS, JS                  | copyable source tree    |
| Authoring     | Astro (build tool only — `.astro` never ships) | React 19 + Vite         |
| Interactivity | Alpine.js                                      | React                   |
| Primitives    | hand-rolled + Alpine                           | shadcn/ui (Radix)       |
| Charts        | ApexCharts                                     | Recharts                |
| Tables        | `@tanstack/table-core`                         | `@tanstack/react-table` |
| Editor        | `lexical`                                      | `@lexical/react`        |
| Router        | n/a                                            | TanStack Router         |

Shared across both: Tailwind CSS v4, TypeScript (strict), class-based dark mode,
Motion for animation, Lucide icons.

## Using the HTML bundle

`pnpm build:html` emits `apps/html/dist/` as plain HTML with Alpine attributes
intact and **zero hydration markers** — so you can hand-edit the markup, or chop
it into Blade/Edge partials, without a build step in your own project.

> **Alpine.js is required.** The bundle assumes Alpine is loaded. There are no
> no-JS fallbacks; interactive components are inert without it.

Serving from a subpath? Set `BASE_PATH` at build time:

```bash
BASE_PATH=/my-app/admin pnpm build:html
```

Astro does not rewrite hardcoded links, so app-absolute paths go through the
`withBase` helper in `apps/html/src/lib/url.ts`.

## Development

```bash
pnpm install
pnpm dev:html        # dev server
pnpm build:html      # build to apps/html/dist
pnpm lint            # eslint
pnpm format          # prettier --write
pnpm typecheck       # astro check
pnpm test            # playwright smoke tests against the built output
```

Tests run against `dist/`, not the dev server, because `dist/` is the
deliverable. CI runs all of the above on every pull request; the demo deploys
only from `main`, and only when everything passes.

## Design system

Tokens live in [`docs/design-tokens.md`](docs/design-tokens.md) and are
implemented in `apps/html/src/styles/theme.css`. Two rules matter most:

- **Surfaces form an ordered ladder** — sidebar → page → card → hover. Separation
  between chrome regions is carried by the surface step, never a border.
- **Hairlines are for structure only** — cards, tables, inputs, menu separators.
  A border on the sidebar edge or under the header is a regression.

Chart colours are validated, not eyeballed: the palette clears colourblind and
contrast gates in both themes. Re-run the validator before changing any value.

## Demo

Built from `main` and published to GitHub Pages: the landing page sits at the
root, the HTML bundle beneath `/html/`. The landing page in `demo/` carries its
own copy of the tokens by design — it is marketing, not production code, and is
allowed to drift.

## Contributing

Work proceeds in **page-shaped milestones**: a milestone is done when you can
build a real screen with it, not when a checklist of components is ticked off.
Order and scope are in [RFC-001](docs/rfc/RFC-001-completing-clear-admin-v3.md).

Update [`docs/components.md`](docs/components.md) in the same PR that implements
a component — the tracker is how HTML and React parity stays visible.

## Licence

MIT.
