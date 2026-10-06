export type Resource = {
  id: string;
  name: string;
  kind: "countable" | "exclusive" | "term";
  capacity?: number;
  per?: "festival" | "day";
  unit?: string;
};

export type Source = {
  id: string;
  kind: "email" | "call-note" | "contract";
  date: string;
  from: string;
  to: string;
  subject: string;
  body: string;
};

// A promise Fieldday made. Named Commitment so it doesn't shadow the global Promise.
export type Commitment = {
  id: string;
  sourceId: string;
  quote: string;
  madeBy: string;
  madeTo: string;
  resourceId: string | null;
  quantity: number;
  day: string | null; // ISO date; null = whole festival / every day
  start: string | null; // HH:MM, 24h
  end: string | null;
  summary: string;
  status: "firm" | "tentative";
};

export type Clash = {
  id: string;
  type: "over-capacity" | "double-booked" | "contradiction" | "unowned";
  resourceId: string | null;
  commitmentIds: string[];
  headline: string;
};

export type Festival = {
  name: string;
  days: { date: string; label: string; note?: string }[];
  staff: { name: string; role: string }[];
  parties: string[];
  resources: Resource[];
};
