#!/usr/bin/env node
// fix-fonts.mjs — normalize typography after frame workers land and after
// assemble-index.mjs rewrites index.html.
//
//   node fix-fonts.mjs frames    # prefix every frame font-family with Geist / Geist Mono
//   node fix-fonts.mjs index     # inject @font-face + host font-family into index.html
//
// Geist woff2 files are staged at assets/fonts/geist-latin.woff2 (+ mono, +ext),
// pulled from the running app's /__nextjs_font/ endpoint, so the headless render
// machine has a real file for every family we name.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const HYPERFRAMES = resolve(process.cwd());
const FONT_DIR = join(HYPERFRAMES, "assets/fonts");
const SANS_FILE = join(FONT_DIR, "geist-latin.woff2");
const SANS_EXT_FILE = join(FONT_DIR, "geist-latin-ext.woff2");
const MONO_FILE = join(FONT_DIR, "geist-mono-latin.woff2");

if (!existsSync(SANS_FILE) || !existsSync(MONO_FILE)) {
  console.error("✗ fix-fonts: missing assets/fonts/geist-latin.woff2 or geist-mono-latin.woff2");
  process.exit(1);
}

const FONT_FACE = `
      @font-face {
        font-family: "Geist";
        font-style: normal;
        font-weight: 400 600;
        font-display: block;
        src: url("assets/fonts/geist-latin.woff2") format("woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
          U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
          U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
        font-family: "Geist";
        font-style: normal;
        font-weight: 400 600;
        font-display: block;
        src: url("assets/fonts/geist-latin-ext.woff2") format("woff2");
        unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
          U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020,
          U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
      }
      @font-face {
        font-family: "Geist Mono";
        font-style: normal;
        font-weight: 400 600;
        font-display: block;
        src: url("assets/fonts/geist-mono-latin.woff2") format("woff2");
      }
`;

const MONO_HINT = /ui-monospace|SF Mono|Menlo|Consolas|monospace/i;

// Rewrite one `font-family:` declaration value.
function rewriteStack(value) {
  if (/\bGeist\b/.test(value)) return value; // already ours
  if (MONO_HINT.test(value)) return `Geist Mono, ${value}`;
  return `Geist, ${value}`;
}

// Frames get their own @font-face block (the linter checks per-file, and a host
// declaration alone is not enough for it). src is project-root relative: the
// assembled index keeps every frame's <style> inline at the root.
const FRAME_FONT_FACE = `
    @font-face {
      font-family: "Geist";
      font-style: normal;
      font-weight: 400 600;
      font-display: block;
      src: url("assets/fonts/geist-latin.woff2") format("woff2");
    }
    @font-face {
      font-family: "Geist Mono";
      font-style: normal;
      font-weight: 400 600;
      font-display: block;
      src: url("assets/fonts/geist-mono-latin.woff2") format("woff2");
    }
`;

function fixFrames() {
  const dir = join(HYPERFRAMES, "compositions/frames");
  if (!existsSync(dir)) {
    console.error(`✗ fix-fonts: ${dir} not found`);
    process.exit(1);
  }
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => join(dir, f));
  const captions = join(HYPERFRAMES, "compositions/captions.html");
  if (existsSync(captions)) files.push(captions);
  let touched = 0;
  for (const p of files) {
    const f = p.slice(p.lastIndexOf("/") + 1);
    let src = readFileSync(p, "utf8");
    let out = src.replace(/font-family:\s*([^;]+);/g, (m, stack) => {
      const next = rewriteStack(stack.trim());
      return next === stack.trim() ? m : `font-family: ${next};`;
    });
    if (!out.includes("@font-face")) {
      const injected = out.replace(/<style>/, `<style>${FRAME_FONT_FACE}`);
      if (injected === out) {
        console.error(`✗ fix-fonts: ${f} has no <style> to inject @font-face into`);
        process.exit(1);
      }
      out = injected;
    }
    if (out !== src) {
      writeFileSync(p, out);
      touched++;
    }
  }
  console.log(`✓ fix-fonts: ${touched}/${files.length} frame file(s) normalized`);
}

function fixIndex() {
  const p = join(HYPERFRAMES, "index.html");
  if (!existsSync(p)) {
    console.error("✗ fix-fonts: index.html not found — run assemble-index.mjs first");
    process.exit(1);
  }
  let html = readFileSync(p, "utf8");
  if (html.includes("@font-face")) {
    console.log("✓ fix-fonts: index.html already declares @font-face");
  } else {
    html = html.replace(/(<style>)/, `$1${FONT_FACE}`);
    if (!html.includes("@font-face")) {
      console.error("✗ fix-fonts: no <style> block in index.html to inject into");
      process.exit(1);
    }
  }
  const before = html;
  html = html.replace(/font-family:\s*Inter,([^;]*);/g, "font-family: Geist,$1;");
  writeFileSync(p, html);
  console.log(
    `✓ fix-fonts: index.html ${before.includes("@font-face") ? "verified" : "got @font-face"} + host family Geist`,
  );
}

const mode = process.argv[2];
if (mode === "frames") fixFrames();
else if (mode === "index") fixIndex();
else {
  console.error("usage: node fix-fonts.mjs frames|index");
  process.exit(2);
}
