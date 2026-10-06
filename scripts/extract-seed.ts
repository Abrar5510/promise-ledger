// Runs the real extraction over data/sources.json and writes data/promises.json.
// Run: npm run extract-seed   (needs GEMINI_API_KEY in .env.local)
import { readFileSync, writeFileSync } from "node:fs";
import { findClashes } from "../lib/clashes.ts";
import { extract } from "../lib/extract.ts";
import type { Festival, Source } from "../lib/types.ts";

const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const festival: Festival = read("festival.json");
const sources: Source[] = read("sources.json");

const commitments = await extract(sources, festival);
for (const s of sources) console.log(s.id, commitments.filter((c) => c.sourceId === s.id).length, "promises");
writeFileSync(new URL("../data/promises.json", import.meta.url), JSON.stringify(commitments, null, 2) + "\n");
console.log(`\n${commitments.length} promises written. Clashes:`);
for (const c of findClashes(commitments, festival.resources)) console.log(" -", c.headline);
