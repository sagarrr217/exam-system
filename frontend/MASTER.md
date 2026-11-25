# ExamSecure — UI/UX Design System Specification (`MASTER.md`)

## 1. Aesthetic Direction
- **Identity**: *Nordic Academic Precision* (Clean Light Default) paired with *Obsidian Slate* (Dark Mode).
- **Philosophy**: Clarity over ornament. Every typographic weight, border hairline, and interactive state guides student focus and faculty oversight without visual noise.

## 2. Color System (60-30-10 Rule & WCAG AA/AAA Contrast)

### Light Mode (`:root`)
- **Dominant Canvas (60%)**: `#F8FAFC` (`--bg-canvas`)
- **Structural Surfaces (30%)**: `#FFFFFF` (`--bg-surface`), `#F1F5F9` (`--bg-tray`), `1px` borders `rgba(15, 23, 42, 0.10)` (`--border-default`)
- **Text Hierarchy**:
  - Primary Ink: `#0F172A` (`> 16:1` on `#FFFFFF`)
  - Secondary Ink: `#475569` (`> 7.5:1` AAA on `#FFFFFF`)
  - Muted Ink: `#64748B` (`> 4.7:1` AA on `#FFFFFF`)
- **Semantic Accents (10%)**:
  - Primary Brand Action: `#1D4ED8` (hover `#1E40AF`) — `6.7:1` white text contrast
  - Secondary Telemetry: `#0F766E`
  - Verified / Pass: `#047857`
  - Warning / Review: `#B45309`
  - Critical / Error: `#B91C1C`

### Dark Mode (`.dark`)
- **Dominant Canvas (60%)**: `#090E1A` (`--bg-canvas`)
- **Structural Surfaces (30%)**: `#111827` (`--bg-surface`), `#1E293B` (`--bg-tray`), `1px` borders `rgba(255, 255, 255, 0.09)` (`--border-default`)
- **Text Hierarchy**:
  - Primary Ink: `#F8FAFC` (`> 16:1`)
  - Secondary Ink: `#CBD5E1` (`> 11:1`)
  - Muted Ink: `#94A3B8` (`> 6.5:1`)
- **Semantic Accents (10%)**:
  - Primary Brand Action: `#3B82F6` (hover `#2563EB`)
  - Secondary Telemetry: `#14B8A6`
  - Verified / Pass: `#10B981`
  - Warning / Review: `#F59E0B`
  - Critical / Error: `#EF4444`

## 3. Typography & Type Scale (1.25 Ratio)
- **Headings**: `Plus Jakarta Sans` (`letter-spacing: -0.025em`, `line-height: 1.15`) + `Fraunces` italic accent
- **Body**: `Inter` (`16px / 1rem` base, `line-height: 1.6`, readable `45–75ch` measures)
- **Data / Timers / IDs**: `JetBrains Mono` (`tabular-nums`)
- **Scale**:
  - Display: `48px / 52px` (`text-4xl lg:text-5xl`)
  - H1: `36px / 42px`
  - H2: `28px / 34px`
  - H3: `22px / 28px`
  - Body Large: `18px / 28px`
  - Body: `16px / 24px`
  - Body Small: `14px / 20px`
  - Label / Badge Minimum: `12px / 16px` (never below `12px`)

## 4. 8-Point Spacing & Z-Index Scale
- **Spacing**: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`
- **Touch Targets**: All interactive buttons/inputs minimum `44px` height on touch viewports (`sm: 36px`, `md: 44px`, `lg: 48px`)
- **Z-Index Hierarchy**:
  - `--z-sticky: 200`
  - `--z-fixed: 300`
  - `--z-modal-backdrop: 400`
  - `--z-modal: 500`
  - `--z-popover: 600`
  - `--z-toast: 800`

## 5. Accessibility & Motion Rules
- Mandatory `:focus-visible` `2px` high-contrast ring on all interactive controls.
- Zero color-only semantics (every status pairs color + icon + text).
- No hover-only actions; all table/card controls remain visible and accessible.
- Transitions `150ms–250ms` `ease-out`, honoring `@media (prefers-reduced-motion: reduce)`.
