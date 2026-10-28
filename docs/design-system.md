# Design System Detail

Full detail behind the condensed token table and two-colour rule in the root `CLAUDE.md`. Applies to every screen in the product, logged-in app and public site alike.

The look is clean, bright and professional, in the spirit of Google's own web products: generous white space, a calm blue accent, crisp type, and nothing decorative. It must be unique and instantly recognisable while using only two colours.

## Two-colour rule

- **Colour 1: Blue.** The only accent colour. Flat shades and tints of this one blue are allowed.
- **Colour 2: White.** Pure white `#FFFFFF` and clean backgrounds `#F8FAFD`.
- **Neutrals** (near-black text and light cool greys for borders and secondary text) are allowed and do not count as colours.
- **NO RED. NO GREEN.** No other hues at all (also no amber, orange, purple, yellow). Errors, success, warnings and failures are communicated by **icon, label and shape**, never by red or green.
- **NO GRADIENTS**: Zero gradients anywhere (backgrounds, buttons, charts, hero sections, loaders). Use flat solid fills, crisp borders and subtle flat overlays.

## Colour tokens (single source in `frontend/src/theme/`)

| Token | Value | Use |
|---|---|---|
| `--iv-blue` | `#1A73E8` | Primary accent: primary buttons, links, active tab, focus ring |
| `--iv-blue-hover` | `#1765CC` | Hover and pressed |
| `--iv-blue-deep` | `#174EA6` | Strong emphasis, headings that need accent, selected text |
| `--iv-blue-100` | `#D2E3FC` | Selected state, active chips (flat tint) |
| `--iv-blue-50` | `#E8F0FE` | Row hover, panels, info banners (flat tint) |
| `--iv-white` | `#FFFFFF` | Cards, surfaces, inputs |
| `--iv-bg` | `#F8FAFD` | Page background |
| `--iv-text` | `#202124` | Primary text (neutral) |
| `--iv-text-2` | `#5F6368` | Secondary text (neutral) |
| `--iv-border` | `#DADCE0` | 1px borders and dividers (neutral) |

Tokens are defined once; components must reference tokens, never raw hex values. (`--iv-` = Ivory prefix.)

## Unique signature (what makes it RootTrace Ivory)

- **Evidence Rail**: a persistent right-hand panel on every failure that lists source citations. Clicking one scrolls to and highlights the exact line in the evidence viewer.
- **Confidence Meter**: a segmented bar made of 10 flat blocks (filled blue vs outlined) with the percentage as text. Never a gradient bar.
- **Trace Ring**: the brand mark is a flat blue ring with a notch and a single trace line leaving it (root cause traced back to its source); reused as the loading indicator (rotating flat ring) and the empty-state illustration.
- **Case-file layout**: each failure opens as a "case file" with a bold title, a status strip, then tabs (Evidence, Diagnosis, History, Export).
- **Taxonomy chips**: the 6 categories are shown as flat chips distinguished by icon and label (filled vs outlined vs dashed border), not by colour.
- **Search-first header**: a wide, prominent search bar at the top of the app (find a run, test or failure signature), in the clean Google-style manner.

## Landing-page visual rules

(See root `CLAUDE.md`'s "Never do" and landing-page rules for the standing version of these - full rationale here.)

- **One nav border**: the header's bottom border is the only border in that region - no second border/line from a child element producing a visible double line.
- **One link colour token**: every nav/footer link uses the same colour token for its default state (currently `--iv-text-2`-equivalent muted text), with only the primary CTA using `--iv-blue`. No raw hex, no browser-default link colour.
- **Body text >= 14px, WCAG AA**: all body copy, footer links, card/step descriptions are at least 14px and meet WCAG AA contrast against their background.
- **Fixed section-spacing scale**: vertical spacing between landing-page sections follows one consistent scale (the existing 8px scale used elsewhere), not ad hoc values.
- **Single container width**: every section's content sits inside the same `<Container>` max-width - no section sets its own.

## Typography, layout and components

- Typography: **Inter** (or Roboto) for the interface and a monospace for logs and stack traces. Bold headings, 4 clear sizes, strong hierarchy.
- Layout: lots of white space, light top bar, left navigation, content on white cards over the `--iv-bg` background.
- High-density data tables with sticky headers; row hover is a flat `--iv-blue-50` tint.
- Shape: pill-shaped (fully rounded) primary buttons, 8px radius on inputs and cards, 1px `--iv-border` borders, very light flat shadows only (no glow, no gradient shadow).
- Explicit status badges, always **icon plus text**, no red or green:
  - `queued`: outlined badge, clock icon.
  - `processing`: blue-tint badge, spinning ring icon.
  - `completed`: filled blue badge, check icon.
  - `failed`: white badge with deep-blue border, cross icon and the word "Failed".
  - Warnings and errors in forms: deep-blue text with an alert icon and a left border bar.
- Motion (Framer Motion): short (150 to 250 ms), purposeful transitions only (panel slide, row expand). Respect `prefers-reduced-motion`.
- States: every screen has loading, empty, error and access-denied states in the same two-colour style.
- Accessibility: text/background contrast at least WCAG AA, visible focus rings (2px `--iv-blue`), full keyboard navigation, never rely on colour alone.
- Responsive: desktop-first, usable on tablet and mobile widths.

## App layout rules (logged-in app)

- **Shell**: every logged-in route renders inside `<AppLayout>` (`frontend/src/components/app/AppLayout.tsx`): a left `Sidebar` (240px, collapsing to a 64px icon rail below `lg:`) plus a sticky `TopBar` (search, notifications, avatar menu) above the page content. No page renders its own nav, top bar, or sidebar.
- **Container**: every page's content sits inside exactly one `<PageContainer>` (`frontend/src/components/app/PageContainer.tsx`, `mx-auto max-w-[1280px] px-6 py-8`), used as the direct child of `<AppLayout>`. No page may set its own top-level width or offset (no competing `max-w-*`/`mx-auto` wrapping or replacing it) - this is what keeps every page's content starting at the same left edge, and is checked automatically by `frontend/src/pages/pageLayout.test.ts`. A page needing a narrower reading width (Settings, Profile, export forms) nests an inner `<div className="max-w-2xl">` *inside* the full-width `PageContainer`, never passed in via a `className` prop (conflicting Tailwind width utilities resolve by order in the compiled stylesheet, not by prop order, so a `className="max-w-2xl"` on `PageContainer` can silently lose to its own hardcoded `max-w-[1280px]`).
- **Page header**: every page's title uses the shared `<PageHeader>` (`frontend/src/components/app/PageHeader.tsx`) - optional breadcrumbs, an `<h1>` title, optional description, optional right-aligned action - instead of a hand-rolled `<h1>`.
- **Spacing**: stick to the 8px scale (`gap-2`, `gap-4`, `gap-6`, `px-6`, `py-8`, …) already used by `PageContainer`/`PageHeader`/`Card`; don't introduce one-off spacing values.
- **Empty states**: use the shared `<EmptyState>` (`frontend/src/components/app/EmptyState.tsx`) - Trace Ring + message + optional action - instead of ad hoc "no data" text.
- **Wizard pattern**: a multi-step flow (for example Import run) uses the shared `<Stepper>` (`frontend/src/components/app/Stepper.tsx`) inside a centred `max-w-[880px]` column within `PageContainer`, with step labels hidden below `sm:` (icon-only circles) to avoid horizontal overflow on narrow screens.
- **Verification**: after changing any app-shell page, screenshot it at 1440/1024/390px and check `document.documentElement.scrollWidth === clientWidth` at each width (no horizontal overflow) before considering the change done.
