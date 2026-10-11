---
format: 1920x1080
duration: 2m05
message: "The Promise Ledger shows a five-person festival team every promise they've made — and which ones can't all be kept"
arc: Demo Loop — context → evidence → live test → mechanism → sign-off
audience: Affinda AI Innovation Challenge judges and Backstage-track viewers on YouTube
mode: autonomous
music: none
---

**Source of truth:** `docs/demo-script.md` (copied to `user_script.txt`). `vo_mode: verbatim` —
the shot order, the on-screen actions, and every spoken word are the user's own and are not
reordered, merged, or reword. Blueprints are tagged only where a shape genuinely fits; the ten
footage frames are recordings of the real app and carry a time-coded action sequence instead.

**Footage:** one continuous Playwright session against `npm run dev` at 1920×1080, paced to the
frame windows, then sliced at the frame boundaries below. Continuous capture means
footage→footage boundaries are true hard cuts with matching screen state.

**Pacing (deliberate post-sync edit, `pacing.json`).** `sync-durations` set every frame equal to
its voice line — 88.0s total, too fast to read the UI and well under the brief's 4m. Approved
pacing: voice + reading holds → **125.0s (2:05)**. Each frame = its voice line plus a settled hold
after the spoken word (the on-screen action runs at the frame start; the hold is dead air for
reading). The frame durations below, `record.mjs`, and `slice.mjs` all read `pacing.json`, which is
the source of truth; if audio is regenerated, re-derive holds from it rather than re-running
`sync-durations` blind.

## Video direction

**Palette — `frame.md` by role, nothing invented.** Ground is `bg-primary` paper (#FAFAFA); cards and the source panel take `bg-secondary` white. `text-primary` ink carries every headline and display line; `text-secondary` muted gray carries body. `line` is the only structural device — one hairline, never a thick border. `accent` alarm red is rationed: clashes, over-capacity figures, and the single word worth emphasising in a lockup. No hue outside this set appears at any point, including on the two designed cards.

**Motion grammar + reveal model.** Long-tail `power3` settles everywhere — smooth, never bouncy, no overshoot. Reveals are VO-paced: at t=0 a frame carries only what the voice is saying then; each further piece arrives on its spoken cue, weighted to the back ~50%. On the ten footage frames the recording itself is the reveal — it was paced to the narration window, so the shot already develops across its full duration instead of front-loading. A settled frame holds still: subtle jitter at most, no breathing, no back-half pan or push.

**Rhythm / held frames.** Frame 1 (title) and Frame 12 (sign-off) are the deliberate stills — bookended holds that let the piece breathe. Frames 9 and 10 are the two short single-action beats: they reveal, settle, and read. Frames 3, 5, 6 and 11 are the long runs, one on-screen action paced per spoken clause.

**Negative list.** No gradients beyond the paper ground, no glassmorphism, no purple-blue "AI" glow, no decorative bokeh, no drop shadows (the system is zero-shadow), no bouncy entrances, no infinite or `repeat` motion, no randomised or wall-clock timing. Both failure modes banned: nothing front-loads then freezes (**slideshow**), and nothing drifts independently of the voice (**screensaver**).

## Frame 1 — Title card

- scene: Paper-white card, the ledger's own hairline rule, "The Promise Ledger" set large in Geist with the festival line beneath
- voiceover: "Fieldday is five people running a 15,000-a-day festival. For ten weeks they say yes: in emails, on calls, in contracts. Nobody writes those promises down in one place."
- duration: 17.5s
- transition_in: cut
- status: animated
- src: compositions/frames/01-title-card.html
- type: hook
- persuasion: Stakes framing — scale before product
- beat: unease → recognition
- blueprint: titlecard-reveal

narrativeRole: Establish the stakes in outcome language — five people, ten weeks, 15,000 a day —
before any interface appears, so the app lands as the answer to a stated problem.
keyMessage: Five people say yes all day and nobody holds the list.

Scene 1 (0.0–5.0s): Paper-white ground only; "The Promise Ledger" seats large in Geist display, centered ~40% of frame, the ledger's hairline rule sweeping in beneath it on a long-tail power3 settle — the name lands as the VO opens on Fieldday's scale. Centered template, ink on paper.
Scene 2 (5.0–11.5s): the stakes line reveals clause-by-clause under the rule — "five people", "15,000 a day", "ten weeks of yes" — each on its spoken cue, weighted into the lower third of the top 83%. Asymmetric 60/40 beneath the wordmark.
Scene 3 (11.5–17.5s): "Nobody writes those promises down in one place." resolves as the single accent line; hold the read still — no drift, no breathing, the card only sits.
## Frame 2 — The reveal

- scene: Live app. The summary line reads 39 promises / 25 conversations / "Six of them can't all be kept"; the six clashes are listed beneath
- voiceover: "We gave it 25 real-looking conversations. It found 39 promises. Six of them can't all be kept."
- duration: 10.0s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-reveal.html
- type: product_intro
- persuasion: Show-don't-tell proof — the output, unedited
- beat: curiosity → clarity
- asset_candidates: assets/beat-02-reveal.mp4 — full-width view of the ledger summary line and the six-clash list on load
- blueprint: compose
- focal: assets/beat-02-reveal.mp4
- roles: beat-02-reveal = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: Land the message by beat 2: the whole value in one sentence backed by the product's
own numbers on screen.
keyMessage: Feed it the correspondence, get one list and a short list of what breaks.

Scene 1 (0.0–4.5s): full-bleed app footage (mounted 0,0 / 1920×1080 / opacity 1, undimmed); the focal is the summary line in the upper-third — "39 promises · 25 conversations · 6 can't all be kept" — settling as the VO names 25 conversations, then 39 promises.
Scene 2 (4.5–7.6s): the six-clash list resolves beneath the summary as the VO lands "six of them can't all be kept" — accent alarm red on the count, list filling mid-canvas.
Scene 3 (7.6–10.0s): hold — footage parked on the settled view, no added motion, letting the numbers read.
## Frame 3 — Capacity

- scene: Live app. The "Crew parking passes: 41 promised, 30 exist" clash expands to show ten promises from five people
- voiceover: "Five different people each handed out a few parking passes. Every one was reasonable. Together it's 41 passes for a 30-space lot."
- duration: 12.5s
- transition_in: cut
- status: animated
- src: compositions/frames/03-capacity.html
- type: feature_showcase
- persuasion: Accumulation — individually reasonable, collectively impossible
- beat: mounting tension
- asset_candidates: assets/beat-03-capacity.mp4 — cursor expanding the parking-pass capacity clash, ten promises fanning out beneath
- blueprint: compose
- focal: assets/beat-03-capacity.mp4
- roles: beat-03-capacity = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: First concrete clash. Proves the core claim — the problem isn't one bad decision, it
is five good ones added together.
keyMessage: Nobody broke a rule; the lot is still full.

Scene 1 (0.0–4.0s): full-bleed footage; the "Crew parking passes: 41 promised, 30 exist" clash row is the focal in the upper-third as the VO opens "five different people".
Scene 2 (4.0–9.3s): the row expands and ten promises fan out beneath it clause-by-clause as the VO counts "every one was reasonable… 41 passes for a 30-space lot" — the over-capacity figure holds accent red. Asymmetric, expanded panel fills mid-canvas.
Scene 3 (9.3–12.5s): hold the expanded read still — cursor parked, no drift.
## Frame 4 — Provenance

- scene: Live app. A "See where" link on a promise opens the source conversation with the exact sentence highlighted
- voiceover: "Every promise links back to the exact sentence it came from, so you never have to trust the AI's word for it."
- duration: 9.0s
- transition_in: cut
- status: animated
- src: compositions/frames/04-provenance.html
- type: feature_showcase
- persuasion: Risk reversal — verifiability over trust
- beat: skepticism → trust
- asset_candidates: assets/beat-04-provenance.mp4 — "See where" clicked, source panel opens with the verbatim quote marked
- blueprint: compose
- focal: assets/beat-04-provenance.mp4
- roles: beat-04-provenance = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: Answers the judge's obvious objection — "how do I know the model didn't invent this?"
before it is asked.
keyMessage: Every promise carries its receipt.

Scene 1 (0.0–3.2s): full-bleed footage; a "See where" link on a promise is the focal as the VO says "every promise links back".
Scene 2 (3.2–6.7s): the source panel opens and the verbatim sentence highlights as the VO says "the exact sentence it came from" — split-screen, source panel foregrounded right, proof over claim.
Scene 3 (6.7–9.0s): hold — "so you never have to trust the AI's word" reads on the settled highlight; stillness.
## Frame 5 — Double-booking

- scene: Live app. The Stage B green room clash expands — Marlo Vance 5:30–7, Halfmoon Parade from 6
- voiceover: "Priya gave Marlo Vance the green room from 5:30. Sam gave Halfmoon Parade the same room from 6. Neither knew."
- duration: 11.0s
- transition_in: cut
- status: animated
- src: compositions/frames/05-green-room.html
- type: feature_showcase
- persuasion: Negative contrast — two valid actions colliding
- beat: tension
- asset_candidates: assets/beat-05-green-room.mp4 — green-room clash expanded showing both bookings and their overlapping window
- blueprint: compose
- focal: assets/beat-05-green-room.mp4
- roles: beat-05-green-room = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: Second clash type — time overlap between two people who never spoke. Broadens the
problem from counting to scheduling.
keyMessage: The clash exists between two people, not inside either one.

Scene 1 (0.0–3.8s): full-bleed footage; the Stage B green-room clash row is the focal as the VO names Priya's 5:30 booking.
Scene 2 (3.8–8.2s): the row expands showing both bookings and their overlapping window as the VO names Sam's 6:00 and "neither knew" — the overlap is the hero, accent on the collision. Asymmetric 60/40.
Scene 3 (8.2–11.0s): hold the overlap read; still.
## Frame 6 — Contradiction

- scene: Live app. The set-length clash expands — contract 60 minutes against a later email saying 75
- voiceover: "The contract says 60 minutes. A friendly email a week later says 75. The artist will hold us to the email."
- duration: 11.0s
- transition_in: cut
- status: animated
- src: compositions/frames/06-set-length.html
- type: feature_showcase
- persuasion: Authority by consequence — which document wins
- beat: tension → unease
- asset_candidates: assets/beat-06-set-length.mp4 — set-length clash expanded, 60-minute contract against 75-minute email
- blueprint: compose
- focal: assets/beat-06-set-length.mp4
- roles: beat-06-set-length = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: Third clash type — one commitment contradicted by a later revision, with a named
consequence.
keyMessage: The newest message wins whether or not anyone noticed.

Scene 1 (0.0–4.5s): full-bleed footage; the set-length clash row is the focal as the VO states "the contract says 60 minutes".
Scene 2 (4.5–8.5s): the row expands — 60-minute contract against the 75-minute email — as the VO lands "a friendly email says 75"; the two figures sit as a split-screen comparison, the later one accent-red.
Scene 3 (8.5–11.0s): hold "the artist will hold us to the email" on the settled contradiction; stillness.
## Frame 7 — Orphan promise

- scene: Live app. The "Nobody owns this: Vegan catering" clash expands — a single promise with no owner
- voiceover: "And this one: \"we'll sort a vegan caterer.\" Promised by the director, owned by nobody."
- duration: 7.5s
- transition_in: cut
- status: animated
- src: compositions/frames/07-orphan.html
- type: feature_showcase
- persuasion: Scarcity of accountability — the unowned commitment
- beat: dry dread
- asset_candidates: assets/beat-07-orphan.mp4 — the unowned vegan-catering clash expanded, showing the single promise and its absent owner
- blueprint: compose
- focal: assets/beat-07-orphan.mp4
- roles: beat-07-orphan = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: Fourth clash type and the driest punchline — authority without ownership.
keyMessage: The most dangerous promise is the one nobody is holding.

Scene 1 (0.0–3.5s): full-bleed footage; the "Nobody owns this: Vegan catering" row is the focal as the VO quotes "we'll sort a vegan caterer".
Scene 2 (3.5–5.7s): the row expands to one promise with no owner as the VO lands "promised by the director, owned by nobody" — single centered panel, the absence is the point.
Scene 3 (5.7–7.5s): hold the dry punchline; still, no motion.
## Frame 8 — Paste

- scene: Live app. "Add a conversation" opens, "Use an example" fills Mei's buggy email, "Read it" sends it to Gemini and the extraction returns
- voiceover: "Now a new email comes in. Mei promises a buggy for Saturday. All four buggies were already promised."
- duration: 10.5s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/08-paste.html
- type: feature_showcase
- persuasion: Live demonstration — the product under test
- beat: anticipation
- asset_candidates: assets/beat-08-paste.mp4 — modal opened, example email loaded, "Read it" pressed, extraction resolving
- blueprint: compose
- focal: assets/beat-08-paste.mp4
- roles: beat-08-paste = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: The turn from "here is what it found" to "watch it find one." Section boundary —
the only beat where the AI is actually invoked on screen.
keyMessage: A new promise is checked the moment it is made.

Scene 1 (0.0–3.0s): full-bleed footage; "Add a conversation" opens and "Use an example" fills Mei's buggy email as the VO says "a new email comes in" — modal is the focal, centered over the dimmed app.
Scene 2 (3.0–6.5s): "Read it" fires and the Gemini extraction resolves as the VO names "Mei promises a buggy for Saturday" — the return state is the reveal, weighted to the back.
Scene 3 (6.5–10.5s): the extraction lands and the modal closes onto the updated ledger as the VO says "all four buggies were already promised"; hold on the settled result.
## Frame 9 — The catch

- scene: Live app. The buggies capacity bar flips red — 4 promised against what exists — and a new clash joins the list
- voiceover: "The ledger catches it the moment it's said, not on show day."
- duration: 6.0s
- transition_in: cut
- status: animated
- src: compositions/frames/09-catch.html
- type: benefit_highlight
- persuasion: Future pacing — the failure you no longer have
- beat: relief
- asset_candidates: assets/beat-09-catch.mp4 — new buggies clash appearing and the capacity bar turning red
- blueprint: compose
- focal: assets/beat-09-catch.mp4
- roles: beat-09-catch = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: The payoff of the live test, and the thesis of the whole product stated as a benefit.
keyMessage: Found now, not on show day.

Scene 1 (0.0–3.5s): full-bleed footage; the buggies capacity bar flips to accent red and the new clash joins the list as the VO delivers "the ledger catches it the moment it's said" — the red bar is the focal, lower-mid.
Scene 2 (3.5–6.0s): hold the caught state — "not on show day" reads on the still red bar; single-action beat, no added motion.
## Frame 10 — Draft

- scene: Live app. "Draft a fix" opens on a clash and the fixing email is written into the panel
- voiceover: "It drafts the awkward email for you. It never sends anything."
- duration: 8.0s
- transition_in: cut
- status: animated
- src: compositions/frames/10-draft.html
- type: feature_showcase
- persuasion: Friction reduction — the hard part automated, the decision kept human
- beat: ease → control
- asset_candidates: assets/beat-10-draft.mp4 — "Draft a fix" pressed on a clash, the resolution email drafting into the panel
- blueprint: compose
- focal: assets/beat-10-draft.mp4
- roles: beat-10-draft = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: Shows the product closing the loop on the problem it raises, while drawing the
safety line explicitly.
keyMessage: It writes the awkward email; a person still sends it.

Scene 1 (0.0–4.0s): full-bleed footage; "Draft a fix" is pressed and the fixing email writes into the panel as the VO says "it drafts the awkward email for you" — the draft panel is the focal, filling mid-canvas.
Scene 2 (4.0–6.0s): the draft settles complete as the VO lands "it never sends anything" — the "Nothing has been sent" line is the hero.
Scene 3 (6.0–8.0s): hold the completed draft; still.
## Frame 11 — How it works

- scene: Live app. Scroll to the "Every promise" table, filter by one staff member, the rows narrowing to their promises
- voiceover: "How it works: the AI only reads and extracts. Plain code does the counting and decides what clashes, so a hallucination can't invent a problem or hide one."
- duration: 15.0s
- transition_in: cut
- status: animated
- src: compositions/frames/11-mechanism.html
- type: benefit_highlight
- persuasion: Authority by architecture — the division of labour is the guarantee
- beat: confidence → control
- asset_candidates: assets/beat-11-mechanism.mp4 — table scrolled into view, staff filter clicked, rows narrowing to one person
- blueprint: compose
- focal: assets/beat-11-mechanism.mp4
- roles: beat-11-mechanism = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: The judge's architectural question answered while the table proves the claims are
structured data, not prose.
keyMessage: The model reads; plain code counts; neither can fake the other's job.

Scene 1 (0.0–5.0s): full-bleed footage; the page scrolls to the "Every promise" table as the VO opens "the AI only reads and extracts" — the table is the focal, full-width.
Scene 2 (5.0–11.4s): the Priya staff filter is clicked and the rows narrow to her promises as the VO lands "plain code does the counting and decides what clashes" — the narrowing is the reveal, proving structured data, weighted to the back.
Scene 3 (11.4–15.0s): hold the filtered table as the VO finishes "a hallucination can't invent a problem or hide one"; stillness.
## Frame 12 — Sign-off

- scene: App returns to the header, then the closing lockup resolves — "The Promise Ledger" over the hairline rule with "Know what you've said yes to."
- voiceover: "The Promise Ledger. Know what you've said yes to."
- duration: 7.0s
- transition_in: crossfade
- status: animated
- src: compositions/frames/12-signoff.html
- type: branding
- persuasion: Identity resolution — the name earns its meaning
- beat: resolution → calm
- blueprint: kinetic-type-beats
- asset_candidates: assets/beat-12-top.mp4 — page scrolled back to the ledger header as the lockup resolves
- focal: assets/beat-12-top.mp4
- roles: beat-12-top = background (full-bleed, undimmed — the recording is the subject)

narrativeRole: Names the product at the moment its promise has been demonstrated, so the sign-off
reads as a summary rather than a slogan.
keyMessage: Know what you've said yes to.

Scene 1 (0.0–2.0s): full-bleed footage (mounted 0,0 / 1920×1080 / opacity 1) scrolls back to the ledger header as the VO says "The Promise Ledger" — the header is the focal, upper-third.
Scene 2 (2.0–4.5s): the closing lockup resolves over the hairline rule — "The Promise Ledger" set large with "Know what you've said yes to." beneath — kinetic type seating on its spoken cue, centered ~50% of frame, accent on the one emphasised word.
Scene 3 (4.5–7.0s): hold the lockup still — resolution, no drift; the sign-off breathes only via the caption.
