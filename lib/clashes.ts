import type { Clash, Commitment, Resource } from "./types";

const dayLabel = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).replace(",", "");

export function promisedTotal(firm: Commitment[], res: Resource, day: string | null) {
  return firm
    .filter((c) => c.resourceId === res.id && (res.per !== "day" || !day || !c.day || c.day === day))
    .reduce((sum, c) => sum + c.quantity, 0);
}

// The model extracts; this decides. Pure arithmetic and interval overlap, no AI.
export function findClashes(commitments: Commitment[], resources: Resource[]): Clash[] {
  const firm = commitments.filter((c) => c.status === "firm");
  const clashes: Clash[] = [];

  for (const res of resources) {
    const mine = firm.filter((c) => c.resourceId === res.id);

    if (res.kind === "countable" && res.capacity != null) {
      const dated = [...new Set(mine.map((c) => c.day).filter((d): d is string => !!d))].sort();
      const days: (string | null)[] = res.per === "day" && dated.length ? dated : [null];
      for (const day of days) {
        const total = promisedTotal(firm, res, day);
        if (total > res.capacity) {
          clashes.push({
            id: `over-${res.id}-${day ?? "all"}`,
            type: "over-capacity",
            resourceId: res.id,
            commitmentIds: mine.filter((c) => !day || !c.day || c.day === day).map((c) => c.id),
            headline: `${res.name}${day ? `, ${dayLabel(day)}` : ""}: ${total} promised, ${res.capacity} exist`,
          });
        }
      }
    }

    if (res.kind === "exclusive") {
      for (let i = 0; i < mine.length; i++) {
        for (let j = i + 1; j < mine.length; j++) {
          const [a, b] = [mine[i], mine[j]];
          if (a.madeTo === b.madeTo || a.day !== b.day) continue;
          if (!a.start || !a.end || !b.start || !b.end) continue;
          if (a.start < b.end && b.start < a.end) {
            clashes.push({
              id: `double-${a.id}-${b.id}`,
              type: "double-booked",
              resourceId: res.id,
              commitmentIds: [a.id, b.id],
              headline: `${res.name} double-booked${a.day ? ` ${dayLabel(a.day)}` : ""}: ${a.madeTo} and ${b.madeTo}`,
            });
          }
        }
      }
    }

    if (res.kind === "term") {
      for (const party of new Set(mine.map((c) => c.madeTo))) {
        const theirs = mine.filter((c) => c.madeTo === party);
        const values = [...new Set(theirs.map((c) => c.quantity))].sort((a, b) => a - b);
        if (values.length > 1) {
          clashes.push({
            id: `contra-${res.id}-${party}`,
            type: "contradiction",
            resourceId: res.id,
            commitmentIds: theirs.map((c) => c.id),
            headline: `${party} told two different things. ${res.name}: ${values.join(" and ")} ${res.unit ?? ""}`.trim(),
          });
        }
      }
    }
  }

  for (const c of firm.filter((c) => c.resourceId === null)) {
    clashes.push({
      id: `unowned-${c.id}`,
      type: "unowned",
      resourceId: null,
      commitmentIds: [c.id],
      headline: `Nobody owns this: ${c.summary}`,
    });
  }

  return clashes;
}
