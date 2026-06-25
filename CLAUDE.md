# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test suite is configured.

## Stack

- **Next.js 14.2** (App Router, `src/` dir, `@/*` alias maps to `src/`)
- **Tailwind CSS v3** with HSL CSS custom properties; dark mode is always active via `className="dark"` on `<html>`
- **Framer Motion** for component-level animation (`motion.*`, `useInView`, `useSpring`, `AnimatePresence`)
- **GSAP + ScrollTrigger** for scroll-pinned parallax sections
- **Geist** loaded as local fonts via `next/font/local`

## Architecture

### Single-page layout (`src/app/page.tsx`)

The entire site is one scrollable page. Section order (top to bottom):

1. `CinematicHero` — GSAP-pinned, `zIndex: 20`
2. `WhyBaserSection` — GSAP-pinned, wrapped in `marginTop: "-100vh"` to eliminate the GSAP pin spacer gap, `zIndex: 10`
3. `HowItWorksSection` → `PricingSection` → `BeforeAfterSection` → `GoodToKnowSection` → `TestimonialsSection` → `BookingSection` — all `zIndex: 5`, plain scroll

**Critical stacking rule**: The two GSAP-pinned sections (`CinematicHero`, `WhyBaserSection`) must keep their explicit `zIndex` values and the `marginTop: "-100vh"` wrapper on `WhyBaserSection`. Removing either breaks the overlap/pin transition. The `marginTop` wrapper must **not** be applied to `HowItWorksSection` or later sections.

### GSAP pin pattern

Both pinned sections use `gsap.context()` / `ctx.revert()` for cleanup and `anticipatePin: 1` to avoid scroll jank. ScrollTrigger is registered once at module level behind a `typeof window !== "undefined"` guard.

### Section navigation (`src/components/ui/section-nav.tsx`)

`SectionNav` is a fixed right-side prev/next + dot nav. It resolves section scroll positions 600 ms after mount by reading `ScrollTrigger.getAll()` pin endpoints. `TOTAL = 8` must match the number of sections in `page.tsx`. If you add or remove a section, update both `TOTAL` and the `setStarts([...])` array in `section-nav.tsx`.

### Colour palette

| Token | Value | Use |
|---|---|---|
| Background | `#0a0a0a` | All section backgrounds (inline style, not Tailwind class) |
| Gold | `#CBA65C` | Primary accent, borders, icons |
| Chrome | `#E4C883` | Highlights, hover states |
| Text | `#E8E8E8` | Body copy |

All non-pinned sections set `backgroundColor: "#0a0a0a"` as an **inline style** (not a Tailwind class) to avoid transparency artifacts during GSAP pin transitions.

### Drag interaction pattern

Any component with drag-to-navigate (before/after slider, testimonial stack) registers `mousemove`/`mouseup`/`touchmove`/`touchend` **synchronously inside the `mousedown` handler** — not via `useEffect` watching state. This avoids React's async state batching gap where fast mouse movements fire before the effect can attach listeners. See `before-after-slider.tsx` and `testimonials-section.tsx` for the pattern.

### Before/After slider clip technique

The "after" layer uses `clipPath: inset(0 ${100 - position}% 0 0)` rather than width resizing, keeping both layers full-size and avoiding layout reflow during drag.
