// Live screen recording of The Promise Ledger.
//
// One continuous Playwright session against `npm run dev`, paced so each beat's
// on-screen action happens inside its frame window. Windows come from
// pacing.json — the deliberate post-sync edit (voice + reading holds, 125s) —
// not raw voice durations. The action runs at the frame start; the remaining
// time is a settled hold after the spoken line. slice.mjs cuts at the same
// cumulative boundaries, so every clip aligns with its audio exactly.
//
//   node record.mjs
//
// Requires: dev server on :3000, pacing.json, audio_meta.json (12 voices).

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = "http://localhost:3000";
const VIDEO_DIR = path.join(HERE, "recordings");
const VW = 1920;
const VH = 1080;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── schedule ────────────────────────────────────────────────────────────────
const meta = JSON.parse(fs.readFileSync(path.join(HERE, "audio_meta.json"), "utf8"));
const pacing = JSON.parse(fs.readFileSync(path.join(HERE, "pacing.json"), "utf8"));
const voices = [...(meta.voices ?? [])].sort((a, b) => a.frame - b.frame);
if (voices.length !== 12) {
  console.error(`✗ expected 12 voice lines, found ${voices.length} — run audio first`);
  process.exit(1);
}
const voiceByFrame = Object.fromEntries(voices.map((v) => [v.frame, v.duration_s]));
const frames = [...pacing.frames].sort((a, b) => a.frame - b.frame);
if (frames.length !== 12) {
  console.error(`✗ expected 12 pacing frames, found ${frames.length}`);
  process.exit(1);
}
const starts = {};
const budget = {}; // full frame window (action + hold)
const voice = {}; // spoken-line length inside the window
let acc = 0;
for (const f of frames) {
  starts[f.frame] = acc;
  budget[f.frame] = f.duration_s;
  voice[f.frame] = voiceByFrame[f.frame] ?? f.voice_s;
  acc += f.duration_s;
}
const TOTAL = acc;
const VOICE_TOTAL = Object.values(voice).reduce((a, b) => a + b, 0);
console.log(
  `schedule: 12 frames · ${TOTAL.toFixed(1)}s total (voice ${VOICE_TOTAL.toFixed(1)}s + ${(TOTAL - VOICE_TOTAL).toFixed(1)}s holds)`,
);

// ── page helpers ────────────────────────────────────────────────────────────
async function moveMouseTo(page, locator) {
  const box = await locator.boundingBox();
  if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 22 });
}

async function clickLike(page, locator, { settle = 650 } = {}) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(200);
  await moveMouseTo(page, locator);
  await page.waitForTimeout(340);
  await locator.click({ timeout: 8000 });
  await page.waitForTimeout(settle);
}

async function scrollToward(page, locator, ms = 750) {
  await locator
    .evaluate(
      (el, ms) =>
        new Promise((res) => {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
          setTimeout(res, ms);
        }),
      ms,
    )
    .catch(() => {});
}

async function openClash(page, re) {
  const row = page.locator('li button[aria-expanded]', { hasText: re }).first();
  await clickLike(page, row, { settle: 850 });
}

// ── the beats ───────────────────────────────────────────────────────────────
const beats = {
  // 1 — title card. The app just loads underneath and settles at the top.
  1: async () => {},

  // 2 — summary line: 39 promises, 25 conversations, 6 can't all be kept.
  2: async (page) => {
    const summary = page.getByText(/promises found in/).first();
    await summary.scrollIntoViewIfNeeded().catch(() => {});
    await moveMouseTo(page, summary);
    await page.waitForTimeout(900);
    await moveMouseTo(page, page.getByRole("heading", { name: "Clashes" }).first());
    await page.waitForTimeout(600);
  },

  // 3 — click the crew parking capacity clash.
  3: async (page) => openClash(page, /Crew parking passes/),

  // 4 — "See where" on one promise, then dismiss the source panel.
  4: async (page) => {
    const seeWhere = page.locator('div.border-t button:has-text("See where")').first();
    await clickLike(page, seeWhere, { settle: 1100 });
    const close = page.locator('dialog[open] button:has-text("Close")').first();
    await clickLike(page, close, { settle: 700 });
  },

  // 5 — green room double-booking.
  5: async (page) => openClash(page, /Stage B green room/),

  // 6 — set length contradiction.
  6: async (page) => openClash(page, /Set length/),

  // 7 — the orphan promise.
  7: async (page) => openClash(page, /Nobody owns this/),

  // 8 — Add a conversation → Use an example → Read it → Gemini extracts.
  8: async (page) => {
    await clickLike(page, page.getByRole("button", { name: "Add a conversation" }), { settle: 800 });
    await clickLike(page, page.getByRole("button", { name: "Use an example" }), { settle: 650 });
    await clickLike(page, page.getByRole("button", { name: "Read it" }), { settle: 200 });
    await page.locator("dialog[open]").waitFor({ state: "detached", timeout: 20000 });
    await page.waitForTimeout(500);
  },

  // 9 — the new clash is in the list; the buggies bar has gone red.
  9: async (page) => {
    const clashes = page.getByRole("heading", { name: "Clashes" }).first();
    await scrollToward(page, clashes, 700);
    const added = page.locator('li button[aria-expanded]', { hasText: /Site buggies/ }).first();
    await moveMouseTo(page, added);
    await page.waitForTimeout(900);
    const bar = page.locator('section[aria-labelledby="capacity"] .grid > div', {
      hasText: "Site buggies",
    }).first();
    await scrollToward(page, bar, 800);
    await moveMouseTo(page, bar);
    await page.waitForTimeout(900);
  },

  // 10 — Draft a fix on the buggies clash.
  10: async (page) => {
    const clashes = page.getByRole("heading", { name: "Clashes" }).first();
    await scrollToward(page, clashes, 700);
    const row = page.locator('li button[aria-expanded]', { hasText: /Site buggies/ }).first();
    if ((await row.getAttribute("aria-expanded")) !== "true") {
      await clickLike(page, row, { settle: 750 });
    } else {
      await moveMouseTo(page, row);
    }
    const draftBtn = page.locator('div.border-t button:has-text("Draft a fix")').first();
    await clickLike(page, draftBtn, { settle: 200 });
    await page
      .getByText("A draft for you to edit and send")
      .first()
      .waitFor({ state: "visible", timeout: 20000 });
    await page.waitForTimeout(600);
  },

  // 11 — scroll to the table, filter by one person.
  11: async (page) => {
    const table = page.getByRole("heading", { name: "Every promise" }).first();
    await scrollToward(page, table, 850);
    await page.waitForTimeout(500);
    await clickLike(page, page.getByRole("button", { name: "Priya", exact: true }), {
      settle: 1400,
    });
  },

  // 12 — back to the top.
  12: async (page) => {
    await page.evaluate(
      () =>
        new Promise((res) => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(res, 1000);
        }),
    );
    await moveMouseTo(page, page.getByRole("heading", { name: "The Promise Ledger" }).first());
    await page.waitForTimeout(500);
  },
};

// ── run ─────────────────────────────────────────────────────────────────────
fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: VW, height: VH },
  deviceScaleFactor: 1,
  recordVideo: { dir: VIDEO_DIR, size: { width: VW, height: VH } },
});
const page = await context.newPage();

// Synthetic cursor so the viewer can follow the clicks. Recording-time overlay
// only — the app's own source is untouched. It re-parents into any <dialog>,
// because a top-layer modal would otherwise paint over it.
await page.addInitScript(() => {
  const mount = () => {
    let d = document.getElementById("__rec_cursor");
    if (!d) {
      d = document.createElement("div");
      d.id = "__rec_cursor";
      d.style.cssText =
        "position:fixed;left:0;top:0;width:20px;height:20px;border-radius:50%;" +
        "background:rgba(24,24,27,.92);box-shadow:0 0 0 2.5px rgba(255,255,255,.95);" +
        "pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%);" +
        "opacity:0;transition:opacity .18s";
      (document.body || document.documentElement).appendChild(d);
      window.addEventListener(
        "mousemove",
        (e) => {
          d.style.left = e.clientX + "px";
          d.style.top = e.clientY + "px";
          d.style.opacity = "1";
        },
        true,
      );
      const sync = () => {
        const open = document.querySelector("dialog[open]");
        const want = open || document.body;
        if (want && d.parentElement !== want) want.appendChild(d);
      };
      new MutationObserver(sync).observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      sync();
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
});

const t0 = Date.now();
await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 60000 });

let overruns = 0;
for (let f = 1; f <= 12; f++) {
  const targetMs = starts[f] * 1000;
  const wait = targetMs - (Date.now() - t0);
  if (wait > 0) await sleep(wait);
  const began = Date.now();
  await beats[f](page);
  const took = (Date.now() - began) / 1000;
  const flag = took > budget[f] ? "⚠ OVERRUN" : "ok";
  if (took > budget[f]) overruns++;
  console.log(
    `frame ${String(f).padStart(2)}  action ${took.toFixed(1)}s / budget ${budget[f].toFixed(1)}s  ${flag}`,
  );
}

// Hold the tail so the last slice has its full length.
const tail = TOTAL * 1000 - (Date.now() - t0);
if (tail > 0) await sleep(tail);

await context.close();
await browser.close();

const file = fs.readdirSync(VIDEO_DIR).find((f) => f.endsWith(".webm"));
console.log(`\nrecorded → ${path.join(VIDEO_DIR, file)}`);
console.log(`wall clock ${((Date.now() - t0) / 1000).toFixed(1)}s · scheduled ${TOTAL.toFixed(1)}s`);
if (overruns) {
  console.log(`⚠ ${overruns} beat(s) overran their narration window — re-record before slicing`);
  process.exit(2);
}
