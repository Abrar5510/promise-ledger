# Asset inventory — The Promise Ledger (localhost:3000)

Capture: real, `ok: true`, vision phase `completed`. Source page is a client-rendered Next.js
ledger with **no raster or SVG image assets** — `capture/assets/svgs/` and `capture/assets/fonts/`
are empty, and the page references no `<img>` elements. This inventory is therefore built from the
captured DOM (`page.html`, `visible-text.txt`, `tokens.json`) rather than from captions.

## Visual source of truth

| Asset | Path | Use |
|---|---|---|
| Full-page plate | `capture/screenshots/full-page.png` | 1920×2316 plate of the whole document; base for any scroll shot |
| Scroll position 0% | `capture/screenshots/scroll-000.png` | Header + summary line + Clashes list |
| Scroll position 61% | `capture/screenshots/scroll-061.png` | Capacity bars + "Every promise" table |
| Scroll position 100% | `capture/screenshots/scroll-100.png` | Table tail |
| Contact sheet | `capture/screenshots/contact-sheet.jpg` | Quick reference for all three |

**The primary footage is not these stills.** Per `BRIEF.md`, the video's screens come from a live
browser recording of the running app. These plates are the fallback and the style reference.

## Brand tokens (from `capture/extracted/tokens.json`)

- **Canvas** `#FAFAFA` · **Surface** `#FFFFFF` · **Ink** `#18181B` · **Muted** `#5F5F68`
- **Line** `#E4E4E7` · **Accent (clash red)** `#C2281D` · **Accent soft** `#FDECEA` · **Mark** `#FDE68A`
- **Type:** Geist (400/500/600) · **Figures:** Geist Mono

## No external assets

No logos, product shots, icons, or illustrations were captured. `public/` in the source repo holds
only default Next.js/Vercel SVGs, which are unused on this page. The title card and closing lockup
are therefore typographic, built from the tokens above — as `BRIEF.md` records.
