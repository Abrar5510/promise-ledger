import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import { z } from "zod";
import type { Commitment, Festival, Source } from "./types";

// Reads GEMINI_API_KEY (or GOOGLE_API_KEY) from the environment.
const ai = new GoogleGenAI({});
// Tried in order: the free tier often answers 503 or 429 on one model while another is fine.
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.8-flash"];

// timeoutMs is per model: an overloaded model can hang for a minute, so give up and try the next.
export async function generate(contents: string, config: GenerateContentConfig, timeoutMs = 10_000) {
  let lastError: unknown;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { ...config, httpOptions: { timeout: timeoutMs } },
      });
      if (response.text) return response.text;
    } catch (error) {
      console.warn(model, "failed:", String(error).slice(0, 160));
      lastError = error;
    }
  }
  throw lastError ?? new Error("Every model returned an empty response");
}

const systemPrompt = (f: Festival) => `You read correspondence from Fieldday Events, the five-person company running the ${f.name} festival, and list every promise Fieldday staff made to an artist or vendor.

A promise is an entitlement a Fieldday staff member granted: a quantity of something, a space, a time slot, a term. Capture it whether it was said in an email, noted after a call, or written in a contract.

In a contract, "the Promoter" is Fieldday. A clause granting the artist or vendor something is a firm promise made by the staff member who signed.

Not promises, leave these out:
- requests from artists or vendors that nobody at Fieldday answered
- general information (trading hours, deadlines, directions)
- follow-up actions ("I'll send the map", "will come back to you")
- internal chatter between staff

Status:
- "firm": the staff member said yes.
- "tentative": they said maybe, or that they need to check ("I'll see if", "might be able to", "no promises yet"). Include these, marked tentative.

If one source revises its own earlier promise (a reply later in the same thread), return only the final version, quoting the sentence that states the final terms.

Never reconcile across sources. Treat each source on its own and report what it promises, even when another source says something different to the same person. Those contradictions are exactly what the reader needs to see.

Fieldday staff: ${f.staff.map((s) => `${s.name} (${s.role})`).join(", ")}.
Known artists and vendors: ${f.parties.join(", ")}. Use these exact names when one matches; otherwise use the name as written.
Dates: ${f.days.map((d) => `${d.label} = ${d.date}${d.note ? ` (${d.note})` : ""}`).join(", ")}.

Resources, by id:
${f.resources.map((r) => `- ${r.id}: ${r.name}${r.unit ? ` (${r.unit})` : ""}`).join("\n")}

You may be given several sources at once, each under a line like "=== SOURCE s01 ===".

For each promise:
- sourceId: the id of the source it came from.
- quote: one contiguous span copied character for character from the text, the shortest span that states the promise. It is checked against the source and the promise is discarded if it does not match exactly.
- madeBy: the Fieldday staff member who made it. madeTo: the artist or vendor it was made to.
- resourceId: the matching id above, or null if the promise is for something not on the list.
- quantity: how many. For set-length, the number of minutes. Use 1 for a single space or slot.
- day: ISO date if the promise is for one day, null if it covers the whole festival or every day.
- start, end: 24-hour HH:MM if times are given, otherwise null.
- summary: a short plain phrase, e.g. "4 parking passes" or "Gate 2 load-in, Thursday 7am to 8am".

If there are no promises, return an empty list.`;

// Whitespace and letter case are forgiven; wording is not.
const squash = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

// One request for any number of sources: the free tier allows only 20 requests a day per model.
export async function extract(sources: Source[], festival: Festival): Promise<Commitment[]> {
  const resourceIds = festival.resources.map((r) => r.id) as [string, ...string[]];
  const Schema = z.object({
    promises: z.array(
      z.object({
        sourceId: z.enum(sources.map((s) => s.id) as [string, ...string[]]),
        quote: z.string(),
        madeBy: z.string(),
        madeTo: z.string(),
        resourceId: z.enum(resourceIds).nullable(),
        quantity: z.number(),
        day: z.string().nullable(),
        start: z.string().nullable(),
        end: z.string().nullable(),
        summary: z.string(),
        status: z.enum(["firm", "tentative"]),
      }),
    ),
  });

  const text = await generate(
    sources
      .map(
        (s) =>
          `=== SOURCE ${s.id} ===\nKind: ${s.kind}\nDate: ${s.date}\nFrom: ${s.from}\nTo: ${s.to}\nSubject: ${s.subject}\n\n${s.body}`,
      )
      .join("\n\n"),
    {
      systemInstruction: systemPrompt(festival),
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(Schema),
    },
    20_000 + sources.length * 5_000,
  );
  const { promises } = Schema.parse(JSON.parse(text));

  // Anti-hallucination guard: a promise only counts if its quote is really in its source.
  const body = new Map(sources.map((s) => [s.id, squash(s.body)]));
  const count = new Map<string, number>();
  return promises
    .filter((p) => {
      const real = body.get(p.sourceId)?.includes(squash(p.quote));
      if (!real) console.warn("Dropped, quote not in source:", p.sourceId, JSON.stringify(p.quote));
      return real;
    })
    .map((p) => {
      const n = (count.get(p.sourceId) ?? 0) + 1;
      count.set(p.sourceId, n);
      return { ...p, id: `${p.sourceId}-p${n}` };
    });
}
