// Run: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { findClashes } from "./clashes.ts";
import type { Commitment, Resource } from "./types.ts";

const c = (over: Partial<Commitment>): Commitment => ({
  id: Math.random().toString(36).slice(2),
  sourceId: "t",
  quote: "",
  madeBy: "Sam",
  madeTo: "A",
  resourceId: "passes",
  quantity: 1,
  day: null,
  start: null,
  end: null,
  summary: "thing",
  status: "firm",
  ...over,
});

const passes: Resource = { id: "passes", name: "Passes", kind: "countable", capacity: 3, per: "festival" };
const buggy: Resource = { id: "buggy", name: "Buggies", kind: "countable", capacity: 2, per: "day" };
const room: Resource = { id: "room", name: "Room", kind: "exclusive" };
const set: Resource = { id: "set", name: "Set length", kind: "term", unit: "minutes" };

test("over-capacity: fires above capacity, quiet at capacity, ignores tentative", () => {
  assert.equal(findClashes([c({ quantity: 2 }), c({ quantity: 2 })], [passes]).length, 1);
  assert.equal(findClashes([c({ quantity: 2 }), c({ quantity: 1 })], [passes]).length, 0);
  assert.equal(findClashes([c({ quantity: 2 }), c({ quantity: 2, status: "tentative" })], [passes]).length, 0);
});

test("over-capacity per day: counted per day, undated promises count every day", () => {
  const b = (day: string | null, quantity: number) => c({ resourceId: "buggy", day, quantity });
  assert.equal(findClashes([b("2026-12-12", 2), b("2026-12-13", 2)], [buggy]).length, 0);
  assert.equal(findClashes([b("2026-12-12", 2), b(null, 1)], [buggy]).length, 1);
});

test("double-booked: overlap for different parties only", () => {
  const r = (madeTo: string, start: string, end: string) =>
    c({ resourceId: "room", madeTo, day: "2026-12-12", start, end });
  assert.equal(findClashes([r("A", "17:30", "19:00"), r("B", "18:00", "19:30")], [room]).length, 1);
  assert.equal(findClashes([r("A", "17:00", "18:00"), r("B", "18:00", "19:00")], [room]).length, 0);
  assert.equal(findClashes([r("A", "17:30", "19:00"), r("A", "18:00", "19:30")], [room]).length, 0);
});

test("contradiction: same party told different terms", () => {
  const s = (madeTo: string, quantity: number) => c({ resourceId: "set", madeTo, quantity });
  assert.equal(findClashes([s("A", 60), s("A", 75)], [set]).length, 1);
  assert.equal(findClashes([s("A", 60), s("B", 75)], [set]).length, 0);
});

test("unowned: firm promise with no resource", () => {
  assert.equal(findClashes([c({ resourceId: null })], []).length, 1);
  assert.equal(findClashes([c({ resourceId: null, status: "tentative" })], []).length, 0);
});

test("seed data: the six planted clashes are found, and nothing else", () => {
  const read = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
  const ids = findClashes(read("promises.json"), read("festival.json").resources).map((x) => x.id).sort();
  assert.deepEqual(ids, [
    "contra-set-length-Kiri & the Tide",
    "double-s02-p2-s11-p2",
    "double-s05-p3-s07-p2",
    "over-outlet-32a-all",
    "over-parking-all",
    "unowned-s17-p1",
  ]);
});
