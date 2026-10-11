// Slice the continuous recording into one clip per storyboard frame.
//
// Boundaries are the cumulative frame durations from pacing.json — the same
// numbers written into STORYBOARD.md — so each clip lines up with its
// narration (voice + reading hold) without any manual timing.
//
//   node slice.mjs [path/to/recording.webm]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, "assets");
const VIDEO_DIR = path.join(HERE, "recordings");

// frame → the filename STORYBOARD.md names in asset_candidates
const NAMES = {
  2: "beat-02-reveal",
  3: "beat-03-capacity",
  4: "beat-04-provenance",
  5: "beat-05-green-room",
  6: "beat-06-set-length",
  7: "beat-07-orphan",
  8: "beat-08-paste",
  9: "beat-09-catch",
  10: "beat-10-draft",
  11: "beat-11-mechanism",
  12: "beat-12-top",
};

const input = process.argv[2] ?? fs.readdirSync(VIDEO_DIR).map((f) => path.join(VIDEO_DIR, f))[0];
if (!input || !fs.existsSync(input)) {
  console.error("✗ no recording found — run record.mjs first");
  process.exit(1);
}

const meta = JSON.parse(fs.readFileSync(path.join(HERE, "audio_meta.json"), "utf8"));
const pacing = JSON.parse(fs.readFileSync(path.join(HERE, "pacing.json"), "utf8"));
const voices = [...(meta.voices ?? [])].sort((a, b) => a.frame - b.frame);
if (voices.length !== 12) {
  console.error(`✗ expected 12 voice lines, found ${voices.length}`);
  process.exit(1);
}
const schedule = [...pacing.frames].sort((a, b) => a.frame - b.frame);
if (schedule.length !== 12) {
  console.error(`✗ expected 12 pacing frames, found ${schedule.length}`);
  process.exit(1);
}

fs.mkdirSync(ASSETS, { recursive: true });

// Probe the real duration so we can warn if the recording is short.
const probe = execFileSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", input],
  { encoding: "utf8" },
).trim();
const videoSeconds = Number(probe);

let acc = 0;
let made = 0;
for (const f of schedule) {
  const start = acc;
  const dur = f.duration_s;
  acc += dur;

  const name = NAMES[f.frame];
  if (!name) continue; // frame 1 is the designed title card — no footage

  if (start + dur > videoSeconds + 0.05) {
    console.error(
      `✗ frame ${f.frame} needs ${start.toFixed(1)}–${(start + dur).toFixed(1)}s but recording is only ${videoSeconds.toFixed(1)}s`,
    );
    process.exit(1);
  }

  const out = path.join(ASSETS, `${name}.mp4`);
  // Output-side seek (-ss after -i): decodes from the start and discards to the
  // exact boundary. Input-side seek on this webm can land on an earlier
  // keyframe; frame-exact cuts matter because adjacent clips are hard cuts.
  execFileSync("ffmpeg", [
    "-y",
    "-i", input,
    "-ss", start.toFixed(3),
    "-t", dur.toFixed(3),
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-an",
    out,
  ], { stdio: ["ignore", "ignore", "pipe"] });

  console.log(`✓ ${name}.mp4  ${start.toFixed(1)}s → ${(start + dur).toFixed(1)}s  (${dur.toFixed(1)}s)`);
  made++;
}
console.log(`\n${made} clip(s) → ${ASSETS}`);
