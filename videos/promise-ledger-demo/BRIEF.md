---
workflow: product-launch-video
flow: automation
storyboard: no
message: "The Promise Ledger shows a five-person festival team every promise they've made — and which ones can't all be kept"
destination: youtube
aspect: 1920x1080
language: en
audience: Affinda AI Innovation Challenge judges and Backstage-track viewers on YouTube
length: 4m
angle: show-it-as-is
narration: yes
vo_mode: verbatim
---

## Intent

A recorded demo of The Promise Ledger — not a promo. The app's own screens are the footage: real
clicks, real typing, real Gemini extraction and draft calls, driven in a live browser against
`npm run dev`. Spoken narration is `docs/demo-script.md`'s "Say" column read verbatim, paced so each
on-screen action lands on its narration beat. The user wrote that script themselves — it is the
storyboard; every beat in it stays in.

Tone: dry, confident, engineering-honest. The script's own sign-off is the close.

## Customizations

- **Title card + closing lockup.** Designed opening title (the script's 0:00 row offers "title card
  or the ledger header" — we take the card) and a closing lockup reading "The Promise Ledger — Know
  what you've said yes to." Built typographically from the app's own look; no logo asset exists.
- **No music bed.** Narration only.

## Notes

- **Source script:** `docs/demo-script.md` in the Affinda repo — 12 rows, timestamps, on-screen
  actions, and the verbatim narration column. Aim 4 minutes, hard limit 5.
- **Approved length deviation:** verbatim narration measures 88s; with reading holds the cut is
  **2:05** (`pacing.json`) rather than 4m. Reaching 4:10 would need holds long enough to stall the
  demo — rejected in favour of pace. Script rows and every spoken line stay untouched.
- **Verbatim VO_MODE** — the "Say" lines are spoken as written; only timing flexes to the recording.
- **Pacing direction:** generate narration first, then drive the browser to land each action on its
  narration beat. Capture runs as **one continuous Playwright session** paced to `pacing.json` and
  is sliced afterwards — so footage→footage boundaries are true hard cuts with matching screen
  state (per-beat segments were rejected: every cut would have to fake continuity).
- **Capture resolution:** 1920x1080, per the script's "1280x720 or larger".
- **No brand assets** — `public/` holds only default Next.js/Vercel SVGs. Title cards use the app's
  own typographic style.
- Reset step in the script ("click Remove pasted before any retake") is handled by fresh contexts.
