# Design Tokens

Derived from the Clearbit style reference. We take the **system** — palette, type
behaviour, surface logic, radii — not the **brand**: no logomark, wordmark, or the
reference's product mockups.

The reference is a marketing-site guide. Three things had to be extended for an
application: a dashboard-range type scale, a dark mode, and app-density spacing.
Two things had to be _corrected_ — see [Deviations](#deviations-from-the-source).

---

## Colour — brand

Straight from the reference, unchanged.

| Token                   | Value     | Role                                                                        |
| ----------------------- | --------- | --------------------------------------------------------------------------- |
| `--color-midnight-ink`  | `#091135` | Primary text, headings, nav, links. 18.37:1 on white.                       |
| `--color-slate`         | `#36394a` | Secondary text — metadata, timestamps, helper copy. 11.41:1.                |
| `--color-electric-blue` | `#0f77ff` | Focus rings, accent strokes, check icons. **Never text** — 4.12:1 fails AA. |
| `--color-frost-border`  | `#e1e9f0` | Hairline borders. The structural line of the system.                        |
| `--color-mist`          | `#b1bbcd` | Focus glows, deeper dividers.                                               |
| `--color-paper`         | `#ffffff` | Page canvas, card surfaces.                                                 |
| `--color-lavender-wash` | `#f5f3ff` | Section tint — signals a content zone.                                      |
| `--color-graphite`      | `#000000` | Icon fills only. Never long-form text.                                      |

**Primary action:** `--color-cobalt` `#1070c9`. This is a correction — see below.

## Colour — semantic

Option A discipline: desaturated, navy-leaning, and used only in **small doses** —
badge text, alert left-border, icon fill. Never as a large surface fill. Every value
clears 4.5:1 AA against its own surface.

| Role    | Light     | on `#ffffff` | Dark      | on `#091135` |
| ------- | --------- | ------------ | --------- | ------------ |
| success | `#0b6b45` | 6.56:1       | `#3fbd85` | 7.72:1       |
| warning | `#8a5300` | 6.33:1       | `#e0a034` | 8.09:1       |
| danger  | `#b0242c` | 6.70:1       | `#f2717a` | 6.49:1       |
| info    | `#0a5fd0` | 5.90:1       | `#4d9bff` | 6.52:1       |

Semantic colour never carries meaning alone — always paired with an icon and a label.

## Surfaces — the elevation ladder

Four steps, ordered: **sidebar** (recessed) → **page** → **card** → **hover**. The
sidebar is the darkest plane in both modes; the header shares the page surface so it
reads as part of the canvas rather than a separate bar.

| Role              | Light              | Dark               |
| ----------------- | ------------------ | ------------------ |
| Sidebar           | `#f2f4f7`          | `#08090c`          |
| Page (and header) | `#ffffff`          | `#101217`          |
| Card              | `#ffffff`          | `#171a20`          |
| Hover             | `#eceef2`          | `#1f232a`          |
| Hairline          | `#eef1f6`          | `#1e2128`          |
| Primary ink       | `#091135` (18.4:1) | `#f2f3f5` (17.4:1) |
| Secondary ink     | `#36394a` (11.4:1) | `#9ba1ad` (7.4:1)  |
| Accent            | `#0f77ff`          | `#3a8df5` (5.8:1)  |

An active nav item takes the **card** surface, so it lifts off the recessed sidebar in
both modes without needing a border.

Class-based (`.dark` on `<html>`), system preference as the initial default.

### Why dark mode is not the navy inversion

The first pass made Midnight Ink the dark surface. Navy at full strength across every
plane reads as a blue cast rather than as dark — so the surfaces moved to near-neutral
(RGB spread of 4–5, down from 27) and the brand identity now lives in the accent and
the ink. Midnight Ink stays the light-mode ink, unchanged.

Semantic and chart colours were re-validated against these surfaces: all four semantic
roles clear 4.5:1 on both dark planes, and the chart palette passes all six checks
against `#171a20`.

## Borders

Chrome carries **no** borders. Separation between the sidebar, header, and content is
carried entirely by the surface step. Hairlines are reserved for:

- card and panel edges
- table row and column rules
- input and control outlines
- menu section separators

A border on the sidebar edge or under the header is a regression, not a detail.

---

## Deviations from the source

Both are accessibility failures in the reference, measured not guessed.

**1. Primary button fill.** The reference specifies Cobalt `#127ee3` with white text
at 16px weight 500. That measures **4.10:1** — below the 4.5:1 AA floor, and 16px/500
does not qualify as WCAG large text (which needs 18.66px bold or 24px regular). Changed
to **`#1070c9`** → 5.02:1. Visually near-identical; the brand read is intact.

**2. Electric Blue as text.** `#0f77ff` is 4.12:1 on white — fails AA. Restricted to
focus rings, strokes, and icon fills. The reference already routes link colour to
Midnight Ink, so nothing else conflicts.

**3. CTA contradiction resolved.** The reference states three incompatible things about
the action colour. Ruling: **Cobalt = filled CTA background; Electric Blue = focus ring
and accent stroke.** This matches the Components section and the reference's own shadow
token, which uses `#0f77ff` for the ring. The Agent Prompt Guide's "no distinct primary
action color was observed" is treated as an extraction artifact.

---

## Typography

Two faces, both self-hosted via `@fontsource-variable` — no CDN, so a copied bundle
works offline.

| Token            | Face                         | Used by                                           |
| ---------------- | ---------------------------- | ------------------------------------------------- |
| `--font-sans`    | Inter Variable               | Everything — body, labels, controls, table cells  |
| `--font-display` | Bricolage Grotesque Variable | Headings, page titles, hero numbers, the wordmark |

The pair is borrowed from `levelup-starter`. The split is strict: Inter carries the UI,
the grotesque carries the voice, and the two never meet at the same size — so the
hierarchy reads from the face as well as from the weight.

Display type sets **tight** (`--tracking-display: -0.022em`), against the optical
tracking that opens with size below. That curve is tuned for Inter at UI sizes; the
grotesque at heading sizes needs the opposite, so display headings opt out of it.

`--tracking-label: 0.06em` pairs with uppercase micro type for table headers and stat
labels, where the extra letterspacing is what keeps small caps legible.

Body sets `font-optical-sizing: auto` and Inter's `cv01` / `ss03` / `zero` — a
disambiguated `l`, a single-storey `a`, and a slashed zero, which matters in a UI that
is mostly numbers.

The reference's signature is tracking that _opens_ with size (`0.004em → 0.018em`,
plateauing at 32px). The scale below fills the reference's 18→32px hole and extends
downward into dashboard range; intermediate tracking is interpolated on that curve,
not invented.

| Token               | Size | Line height | Tracking | Use                         |
| ------------------- | ---- | ----------- | -------- | --------------------------- |
| `--text-micro`      | 12px | 1.33        | 0.024px  | Table cells, dense metadata |
| `--text-caption`    | 14px | 1.43        | 0.056px  | Labels, helper text         |
| `--text-body`       | 16px | 1.50        | 0.128px  | Body                        |
| `--text-subheading` | 18px | 1.50        | 0.252px  | Card headings               |
| `--text-title-sm`   | 20px | 1.40        | 0.290px  | Section titles              |
| `--text-title`      | 24px | 1.33        | 0.360px  | Page titles                 |
| `--text-heading-sm` | 32px | 1.25        | 0.512px  | Empty-state heroes          |
| `--text-heading`    | 56px | 1.25        | 1.008px  | Marketing only              |
| `--text-display`    | 64px | 1.25        | 1.152px  | Marketing only              |

Weights 400 / 500 / 600 / 700. Body carries 400–500; 700 only for single words.
Never negative tracking — the widening is the signature.

## Spacing & density

4px base unit; the reference's scale is kept intact. What changes is **rhythm**: the
reference's 64px section gap is marketing pacing and wastes dashboard viewport.

| Context          | Reference      | App                                                                        |
| ---------------- | -------------- | -------------------------------------------------------------------------- |
| Section gap      | 64px           | **24px**                                                                   |
| Card padding     | 24px           | 24px (unchanged)                                                           |
| Element gap      | 8–20px         | 8–16px                                                                     |
| Table row height | —              | **44px** (already in the scale)                                            |
| Max width        | 1200px centred | full-width shell; 1200px cap applies to auth pages and settings forms only |

## Radii

`8px` buttons / inputs / nav · `12px` cards · `9999px` tags.
No intermediate values — no 10px, no 16px.

## Elevation

**Revised.** The original system carried no resting shadows — depth came from surface
tint and hairline alone. In practice a dashboard of stacked cards read as flat, so
cards now take a shadow, and the hairline lightened to compensate
(`#e6e9ef → #eef1f6` light, `#23262d → #1e2128` dark): the edge and the shadow
together do the work the edge used to do alone.

The shadows are **ambient, not elevated**: wide blur, low opacity, almost no offset,
and a negative spread so the blur never crowds the card's own edge. A card should read
as sitting in soft light, not propped above the page.

| Token             | Light                                                                              | Dark                                                                | Use                          |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------- |
| `--shadow-card`   | `0 2px 8px -2px rgba(9,17,53,.04), 0 12px 32px -8px rgba(9,17,53,.08)`             | `0 2px 8px -2px rgba(0,0,0,.3), 0 12px 32px -8px rgba(0,0,0,.45)`   | Resting cards, panels, table |
| `--shadow-raised` | `0 4px 16px -4px rgba(9,17,53,.05), 0 28px 64px -16px rgba(9,17,53,.14)`           | `0 4px 16px -4px rgba(0,0,0,.35), 0 28px 64px -16px rgba(0,0,0,.6)` | Auth card, hover, modals     |
| `--shadow-focus`  | `0 0 0 1px #0f77ff, 0 1px 2px rgba(12,43,100,.32), 0 6px 16px rgba(12,43,100,.32)` | same                                                                | Focus ring only              |

Dark mode gets its own values: a blue-tinted shadow is invisible on a dark ground, so
those steps are neutral and heavier.

The resting shadows sit deliberately far below the focus ring in strength — the ring
must stay the loudest thing on the page.

---

## Charts

Charts are **exempt** from the one-accent rule (decision: chrome stays disciplined,
data visualisation gets colours that communicate). Palette validated with the dataviz
validator against our actual surfaces — `#ffffff` light, `#091135` dark.

| Slot | Hue     | Light     | Dark      |
| ---- | ------- | --------- | --------- |
| 1    | blue    | `#0f77ff` | `#3a8df5` |
| 2    | orange  | `#eb6834` | `#d95926` |
| 3    | aqua    | `#1baf7a` | `#199e70` |
| 4    | yellow  | `#eda100` | `#c98500` |
| 5    | magenta | `#e87ba4` | `#d55181` |
| 6    | green   | `#008300` | `#008300` |
| 7    | violet  | `#4a3aa7` | `#9085e9` |
| 8    | red     | `#e34948` | `#e66767` |

Slot 1 is the brand blue — the palette opens on-brand and diverges only as series count
demands.

**Validator results — both modes pass all six checks.**

- Adjacent-pair (lines, bars, stacks): all 8 slots pass. Worst CVD ΔE 9.1 light / 8.4 dark
  (≥8 target); worst normal-vision ΔE 19.6 light / 19.3 dark (≥15 floor).
- All-pairs (scatter, bubble, small multiples): **capped at 3 slots.** Worst CVD ΔE 9.2
  light / 9.4 dark. Past three, fold to "Other" or facet.
- **Relief rule, light mode:** aqua (2.82:1), yellow (2.17:1), magenta (2.69:1) sit below
  3:1 on white. Charts using those slots must ship visible direct labels or a table view.
  Not optional.

Assign hues in fixed slot order, never cycled. Colour follows the entity, never its rank.
Status colours are reserved and never reused as a series.

Re-run before changing any value:

```
node scripts/validate_palette.js "<hex,...>" --mode light  --surface "#ffffff"
node scripts/validate_palette.js "<hex,...>" --mode dark   --surface "#091135"
```

---

## Rules

**Do**

- Midnight Ink for all primary text — never drift to true black for long passages
- One accent in the chrome; Electric Blue only on focus, strokes, and check icons
- Separate sections with Lavender Wash tint and Frost Border hairlines
- Open tracking as size increases — this is the signature
- Float real UI in hero zones, not abstract illustration

**Don't**

- No drop shadows on resting cards — tint and hairline only
- No borders on chrome — the sidebar edge and header underline are carried by surface
  step alone
- No second chrome accent (charts are the documented exception)
- No negative letter-spacing on display type
- No body text below 12px; no weight 700 beyond a single word
- No pure black for long-form text
- No radii outside 8 / 12 / 9999
- No gradients or decorative backgrounds
