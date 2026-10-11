#!/usr/bin/env node
// restore-videos.mjs — put the approved frame videos back into the frame files.
//
// assemble-index.mjs hoists each approved `<video data-frame-video="approved">`
// out of its frame and into index.html, then rewrites the frame file with a
// marker comment in its place. That means index.html can only ever be assembled
// ONCE per restore: a second assemble finds frames with no video and emits an
// index.html with no footage. Run this before every (re-)assembly:
//
//   node restore-videos.mjs && node <skill>/scripts/assemble-index.mjs …

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const HYPERFRAMES = resolve(process.cwd());
const DIR = join(HYPERFRAMES, "compositions/frames");
const MARKER = "<!-- approved frame video hoisted by assemble-index -->";

// frame_id → [clip, frame duration]
const CLIPS = {
  "02-reveal": ["beat-02-reveal.mp4", "10"],
  "03-capacity": ["beat-03-capacity.mp4", "12.5"],
  "04-provenance": ["beat-04-provenance.mp4", "9"],
  "05-green-room": ["beat-05-green-room.mp4", "11"],
  "06-set-length": ["beat-06-set-length.mp4", "11"],
  "07-orphan": ["beat-07-orphan.mp4", "7.5"],
  "08-paste": ["beat-08-paste.mp4", "10.5"],
  "09-catch": ["beat-09-catch.mp4", "6"],
  "10-draft": ["beat-10-draft.mp4", "8"],
  "11-mechanism": ["beat-11-mechanism.mp4", "15"],
  "12-signoff": ["beat-12-top.mp4", "7"],
};

let restored = 0;
let already = 0;
const missing = [];

for (const [id, [clip, dur]] of Object.entries(CLIPS)) {
  const p = join(DIR, `${id}.html`);
  if (!existsSync(p)) {
    missing.push(`${id}.html (frame file missing)`);
    continue;
  }
  if (!existsSync(join(HYPERFRAMES, "assets", clip))) {
    missing.push(`assets/${clip} (clip missing)`);
    continue;
  }
  const src = readFileSync(p, "utf8");
  if (src.includes('data-frame-video="approved"')) {
    already++;
    continue;
  }
  const video = `<video data-frame-video="approved" data-start="0" data-duration="${dur}" data-track-index="0" data-frame-video-x="0" data-frame-video-y="0" data-frame-video-width="1920" data-frame-video-height="1080" data-frame-video-fit="cover" src="assets/${clip}" muted playsinline></video>`;
  let out;
  if (src.includes(MARKER)) {
    out = src.replace(MARKER, video);
  } else if (src.includes("</style>")) {
    out = src.replace("</style>", `</style>\n    ${video}`);
  } else {
    missing.push(`${id}.html (no marker and no </style> to anchor in)`);
    continue;
  }
  writeFileSync(p, out);
  restored++;
}

console.log(`✓ restore-videos: ${restored} restored, ${already} already present`);
if (missing.length) {
  console.error(`✗ restore-videos: ${missing.length} problem(s):\n  - ${missing.join("\n  - ")}`);
  process.exit(1);
}
