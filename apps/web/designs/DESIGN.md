---
name: Operational B2B Distribution
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0f0069'
  on-tertiary-container: '#7671ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#e2dfff'
  tertiary-fixed-dim: '#c3c0ff'
  on-tertiary-fixed: '#0f0069'
  on-tertiary-fixed-variant: '#3323cc'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  numeric-metric:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.03em
  tabular-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for high-throughput enterprise B2B wholesale distribution, taking visual cues from the precision, quiet confidence, and structural discipline of platforms like Linear, Stripe, and Vercel. The interface operates as an invisible, frictionless utility for supply chain operators, procurement managers, and logistics dispatchers navigating high-stakes commerce.

The aesthetic combines **clean minimalism** with **structural precision**:
- **High functional density:** Compact vertical rhythms optimize screen real estate for dense inventory matrices, bulk ledger reconciliations, and complex consignment tracking without visual fatigue.
- **Utilitarian clarity:** Form follows utility. Decorative gradients, exaggerated shadows, and non-semantic flourishes are stripped away in favor of crisp 1px delineation lines, strict typographic hierarchy, and unambiguous status communication.
- **Localized operational fidelity:** Purpose-built for commercial hubs handling Nigerian enterprise commerce, accommodating specific currency semantics (`₦` Nigerian Naira formatted with tabular numerals), multi-warehouse inventories, batch-level SKU tracking, and real-time distribution states.

## Colors

The palette balances cool, surgical neutrals with highly targeted semantic accents to ensure that operational status signals cut through dense transactional data immediately.

### Foundation & Surfaces
- **Canvas Base:** `#F8FAFC` (Slate-50) serves as the subdued, low-contrast backdrop that eliminates eye strain under extended warehouse and procurement workflows.
- **Card & Component Surfaces:** `#FFFFFF` (White) establishes sharp elevation through material contrast against the Slate-50 canvas.
- **Structural Dividers:** `#E2E8F0` (Slate-200) defines every grid, header, table cell, and panel perimeter with absolute 1px mechanical precision.
- **Secondary Surfaces:** `#F1F5F9` (Slate-100) handles table hover states, subtle badge containers, and disabled form controls.

### Typography & Neutrals
- **Primary Text:** `#0F172A` (Slate-900) ensures authoritative, maximum-contrast legibility across all primary labels, metric totals, and line items.
- **Secondary Text:** `#475569` (Slate-600) for metadata, table column headers, and ancillary descriptive notes.
- **Muted / Placeholder Text:** `#94A3B8` (Slate-400) for empty states, breadcrumbs, and input placeholders.

### Brand Accents
- **Primary Operational Tone:** `#0F172A` (Deep Slate) is the anchor for primary buttons, active global navigation, and key focal points.
- **Secondary Logistics Tone:** `#059669` (Deep Emerald-600) evokes capital settlement, successful inventory intake, and financial solvency.
- **Tertiary Accent:** `#4F46E5` (Indigo-600) is reserved for analytical focal points, active interactive tabs, and primary action highlights.

### Strict Semantic Status Tokens
Every status badge adheres to a low-saturation tinted background paired with a high-contrast text color:
- **Completed / Paid / Stocked:** `#ECFDF5` background, `#047857` text, `#A7F3D0` border (Emerald).
- **Pending / In Review / Attention Required:** `#FFFBEB` background, `#B45309` text, `#FDE68A` border (Amber).
- **Failed / Refunded / Stockout:** `#FFF1F2` background, `#BE123C` text, `#FECDD3` border (Rose).
- **In-Transit / Dispatched / Allocated:** `#F0F9FF` background, `#0369A1` text, `#BAE6FD` border (Sky).

## Typography

Inter serves as the singular typographic workhorse across the entire system. Its tall x-height, clear aperture openings, and robust tabular numeric features ensure zero ambiguity when reviewing high-volume SKU codes, batch barcodes, and multi-digit financial metrics.

### Key Rules & Conventions
- **Tabular Figures (`tnum`):** All monetary amounts (e.g., `₦14,850,200.00`), stock counts, weights, and dates must enforce CSS `font-variant-numeric: tabular-nums` to ensure numerical alignment across table columns.
- **Currency Presentation:** The Naira symbol (`₦`) is set at identical weight and tracking to adjacent numbers, with no trailing space between the symbol and the opening digit (e.g., `₦450,000`).
- **Data Table Headers:** Styled with `label-sm`, rendered in uppercase with tight letter-spacing (`0.04em`) in `#64748B` to distinguish schema definitions from underlying record values.
- **Hierarchy Restraint:** Avoid oversized display fonts. Interface headers max out at 24px (`headline-lg`) on operational pages, reserving 30px (`display-lg`) solely for executive overview dashboards.

## Layout & Spacing

The layout philosophy follows a **strict 8px baseline grid** with an allowed 4px micro-substep for compact components (`space-xs: 4px`, `space-sm: 8px`, `space-md: 12px`, `space-lg: 16px`, `space-xl: 24px`).

### Layout Architecture
- **Global Structure:** A fixed left sidebar (240px desktop, collapsed to 64px icon-rail on small desktop), a persistent top operational bar (52px height), and a fluid primary content canvas.
- **Data Tables & Feeds:** Maximize horizontal viewport width without fixed container clipping; content spans full available width to support multi-column logistics schedules.
- **Form Panels & Sliders:** Slide-over contextual sheets (480px width) anchor to the right margin for batch edits, avoiding full page navigations during order fulfilment.

### Breakpoint Adjustments
- **Desktop (≥ 1280px):** Permanent 240px navigation bar, multi-column metric cards, 16px (`1rem`) gutters between dashboard widgets, full 12-column layout.
- **Tablet (768px – 1279px):** Collapsed navigation rail, metric cards wrap to 2-column pairs, data tables implement sticky horizontal scrolling with frozen SKU/ID columns.
- **Mobile (< 768px):** Single-column stack, bottom-sheet interactions replace flyout drawers, data cards replace dense desktop tables, margin reduced to 16px (`1rem`).

## Elevation & Depth

Visual hierarchy is established through **tonal separation and crisp 1px borders** rather than deep skeuomorphic shadows, replicating the flat, high-density discipline of Vercel and Linear.

### Surface Hierarchy
1. **Canvas Layer (0dp):** `#F8FAFC` (Slate-50) forms the base viewport background.
2. **Structural Layer (1dp):** `#FFFFFF` (White) panels framed by a mandatory `1px solid #E2E8F0` (Slate-200) border. No ambient shadow is applied to standard resting cards.
3. **Elevated Floating Layer (2dp):** Contextual popovers, date-pickers, autocomplete dropdowns, and flyout navigation draw a subtle ambient containment shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`, enclosed with a `1px solid #CBD5E1` outline.
4. **Modal / Overlay Layer (3dp):** Confirmation dialogs and bulk export modals float above a backdrop blur overlay (`backdrop-filter: blur(4px); background-color: rgba(15, 23, 42, 0.40)`), bounded by `0 10px 15px -3px rgba(15, 23, 42, 0.08)`.

### Border Interactions
Interactive cards and table rows do not translate or elevate on hover. Instead, state transitions rely purely on surface fill shifts (`#FFFFFF` to `#F8FAFC`) and border highlighting (`#E2E8F0` to `#CBD5E1`).

## Shapes

The design system maintains a **soft, controlled geometric profile** (`roundedness: 1`), keeping corners compact and industrial to avoid child-like or consumer-app softness.

### Corner Radius Standards
- **Buttons, Text Inputs, and Select Boxes:** 6px radius (`rounded-md`), ensuring input controls maintain a sharp, compact posture.
- **Cards, Panels, and Table Enclosures:** 8px radius (`rounded-lg`), providing clean containment while preserving vertical alignment along 8px grid boundaries.
- **Status Badges & Pill Counters:** 4px radius (`rounded-sm`) or 9999px fully rounded pills for standalone count tags. Micro-badges within table rows strictly use 4px (`rounded-sm`) to maximize horizontal line economy.
- **Dropdown Menus & Modals:** 8px radius (`rounded-lg`).

## Components

### Buttons
- **Primary:** Solid `#0F172A` background, `#FFFFFF` text, 6px radius, height 36px (compact) or 32px (dense). Hover: `#1E293B`. Focus: `2px ring #0F172A` with 2px offset.
- **Secondary / Outline:** `#FFFFFF` background, 1px solid `#E2E8F0`, `#0F172A` text. Hover: `#F8FAFC` and border `#CBD5E1`.
- **Destructive:** `#FFFFFF` background, 1px solid `#FECDD3`, `#BE123C` text. Hover: `#FFF1F2`.
- **Ghost:** Transparent background, `#475569` text. Hover: `#F1F5F9`.

### Badges & Status Indicators
Badges are compact (height 20px, font size 11px, weight 600, uppercase letter-spacing 0.04em, padding 2px 6px):
- **Completed / Paid:** Background `#ECFDF5`, text `#047857`, border `1px solid #A7F3D0`. Includes a 6px solid emerald dot prefix.
- **Pending / Attention:** Background `#FFFBEB`, text `#B45309`, border `1px solid #FDE68A`. Includes a 6px solid amber dot prefix.
- **Failed / Refunded / Stockout:** Background `#FFF1F2`, text `#BE123C`, border `1px solid #FECDD3`. Includes a 6px solid rose dot prefix.
- **In-Transit / Dispatched:** Background `#F0F9FF`, text `#0369A1`, border `1px solid #BAE6FD`. Includes a 6px solid sky dot prefix.

### Data Tables (The Primary Operational Workhorse)
- **Container:** Wrapped in a `1px solid #E2E8F0` border with an 8px corner radius and white background.
- **Header:** Height 36px, background `#F8FAFC`, border-bottom `1px solid #E2E8F0`. Typography: `label-sm` in `#64748B`.
- **Row:** Height 44px (default operational) or 36px (condensed), border-bottom `1px solid #F1F5F9`. Hover: background `#F8FAFC`.
- **Cell Padding:** 8px horizontal, 0px vertical (aligned via flex/line-height). Numbers right-aligned with tabular figures.

### Form Inputs
- **Base Input:** 36px height, white background, `1px solid #CBD5E1` border, 6px radius, padding 8px 12px, font size 13px.
- **Currency Field (Naira ₦):** Displays a fixed left addon badge containing `₦` in `#64748B` with a `1px solid #E2E8F0` separator. Input strictly formats numbers with commas on blur.
- **Focus State:** Border color shifts to `#0F172A` with an ambient `0 0 0 1px #0F172A` ring; no bright blue glow.

### Cards & Metric Tiles
- **Structure:** Solid `#FFFFFF` fill with `1px solid #E2E8F0` border and 8px radius. Padding is uniformly 16px (`space-lg`).
- **Metric Tile Content:** Title in `label-sm` (`#64748B`), secondary metric delta badge (+4.2% vs last week) in the top-right, large monetary or unit value in `numeric-metric` (`#0F172A`), followed by warehouse location tag below.

### Wholesale-Specific Components
- **SKU Barcode Indicator:** A compact inline tag pairing monospace alphanumeric batch IDs with a copy-to-clipboard action.
- **Fulfilment Stepper:** A linear, thin-stroke horizontal milestone bar showing 5 operational phases: *Order Placed → Payment Confirmed → Allocation / Picking → Waybill Issued / Dispatched → Delivered*.
- **Waybill / Manifest Row:** Specialized expandable summary row detailing driver contact, truck registration plate, and destination depot.