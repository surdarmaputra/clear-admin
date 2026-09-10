# Design Tokens

Derived from the Clearbit style reference. We take the **system** — palette, type
behaviour, surface logic, radii — not the **brand**: no logomark, wordmark, or the
reference's product mockups.

The reference is a marketing-site guide. Three things had to be extended for an
application: a dashboard-range type scale, a dark mode, and app-density spacing.
Two things had to be *corrected* — see [Deviations](#deviations-from-the-source).

---

## Colour — brand

Straight from the reference, unchanged.

| Token | Value | Role |
|---|---|---|
| `--color-midnight-ink` | `#091135` | Primary text, headings, nav, links. 18.37:1 on white. |
| `--color-slate` | `#36394a` | Secondary text — metadata, timestamps, helper copy. 11.41:1. |
| `--color-electric-blue` | `#0f77ff` | Focus rings, accent strokes, check icons. **Never text** — 4.12:1 fails AA. |
| `--color-frost-border` | `#e1e9f0` | Hairline borders. The structural line of the system. |
| `--color-mist` | `#b1bbcd` | Focus glows, deeper dividers. |
| `--color-paper` | `#ffffff` | Page canvas, card surfaces. |
| `--color-lavender-wash` | `#f5f3ff` | Section tint — signals a content zone. |
| `--color-graphite` | `#000000` | Icon fills only. Never long-form text. |

**Primary action:** `--color-cobalt` `#1070c9`. This is a correction — see below.

## Colour — semantic

Option A discipline: desaturated, navy-leaning, and used only in **small doses** —
badge text, alert left-border, icon fill. Never as a large surface fill. Every value
clears 4.5:1 AA against its own surface.

| Role | Light | on `#ffffff` | Dark | on `#091135` |
|---|---|---|---|---|
| success | `#0b6b45` | 6.56:1 | `#3fbd85` | 7.72:1 |
| warning | `#8a5300` | 6.33:1 | `#e0a034` | 8.09:1 |
| danger | `#b0242c` | 6.70:1 | `#f2717a` | 6.49:1 |
| info | `#0a5fd0` | 5.90:1 | `#4d9bff` | 6.52:1 |

Semantic colour never carries meaning alone — always paired with an icon and a label.

## Colour — dark mode

An inversion, not a new palette: the system is already navy, so Midnight Ink becomes
the card surface and Paper becomes the ink.

| Role | Light | Dark |
|---|---|---|
| Page plane | `#ffffff` | `#060b21` |
| Surface / card | `#ffffff` | `#091135` |
| Raised / wash | `#f5f3ff` | `#101a42` |
| Border (hairline) | `#e1e9f0` | `#1e2a52` |
| Primary ink | `#091135` | `#f5f7fc` (17.14:1) |
| Secondary ink | `#36394a` | `#9aa5c0` (7.45:1) |
| Accent | `#0f77ff` | `#3a8df5` (5.52:1) |

Class-based (`.dark` on `<html>`), system preference as the initial default.

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

**InterVar**, self-hosted via `@fontsource-variable/inter` — no CDN, so a copied bundle
works offline. Fallback: `ui-sans-serif, system-ui, sans-serif`.

The reference's signature is tracking that *opens* with size (`0.004em → 0.018em`,
plateauing at 32px). The scale below fills the reference's 18→32px hole and extends
downward into dashboard range; intermediate tracking is interpolated on that curve,
not invented.

| Token | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `--text-micro` | 12px | 1.33 | 0.024px | Table cells, dense metadata |
| `--text-caption` | 14px | 1.43 | 0.056px | Labels, helper text |
| `--text-body` | 16px | 1.50 | 0.128px | Body |
| `--text-subheading` | 18px | 1.50 | 0.252px | Card headings |
| `--text-title-sm` | 20px | 1.40 | 0.290px | Section titles |
| `--text-title` | 24px | 1.33 | 0.360px | Page titles |
| `--text-heading-sm` | 32px | 1.25 | 0.512px | Empty-state heroes |
| `--text-heading` | 56px | 1.25 | 1.008px | Marketing only |
| `--text-display` | 64px | 1.25 | 1.152px | Marketing only |

Weights 400 / 500 / 600 / 700. Body carries 400–500; 700 only for single words.
Never negative tracking — the widening is the signature.

## Spacing & density

4px base unit; the reference's scale is kept intact. What changes is **rhythm**: the
reference's 64px section gap is marketing pacing and wastes dashboard viewport.

| Context | Reference | App |
|---|---|---|
| Section gap | 64px | **24px** |
| Card padding | 24px | 24px (unchanged) |
| Element gap | 8–20px | 8–16px |
| Table row height | — | **44px** (already in the scale) |
| Max width | 1200px centred | full-width shell; 1200px cap applies to auth pages and settings forms only |

## Radii

`8px` buttons / inputs / nav · `12px` cards · `9999px` tags.
No intermediate values — no 10px, no 16px.

## Elevation

**No drop shadows on resting surfaces.** Depth is expressed by surface tint and hairline
border. The only shadow in the system is the focus state:

```
0 0 0 1px #0f77ff,
0 1px 2px rgba(12, 43, 100, 0.32),
0 6px 16px rgba(12, 43, 100, 0.32)
```

---

## Charts

Charts are **exempt** from the one-accent rule (decision: chrome stays disciplined,
data visualisation gets colours that communicate). Palette validated with the dataviz
validator against our actual surfaces — `#ffffff` light, `#091135` dark.

| Slot | Hue | Light | Dark |
|---|---|---|---|
| 1 | blue | `#0f77ff` | `#3a8df5` |
| 2 | orange | `#eb6834` | `#d95926` |
| 3 | aqua | `#1baf7a` | `#199e70` |
| 4 | yellow | `#eda100` | `#c98500` |
| 5 | magenta | `#e87ba4` | `#d55181` |
| 6 | green | `#008300` | `#008300` |
| 7 | violet | `#4a3aa7` | `#9085e9` |
| 8 | red | `#e34948` | `#e66767` |

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
- No second chrome accent (charts are the documented exception)
- No negative letter-spacing on display type
- No body text below 12px; no weight 700 beyond a single word
- No pure black for long-form text
- No radii outside 8 / 12 / 9999
- No gradients or decorative backgrounds
