import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Commitment, Festival, Source } from "./types";

export const MODEL = "claude-opus-5-5";
// Opus 5.5 can decline a request; this lets the API re-run it on a fallback model in the same call.
export const FALLBACK: { betas: Anthropic.Beta.AnthropicBeta[]; fallbacks: "default" } = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};

export const client = new Anthropic();

const systemPrompt = (f: Festival) => `You read correspondence from Fieldday Events, the five-person company running the ${f.name} festival, and list every promise Fieldday staff made to an artist or vendor.

A promise is an entitlement a Fieldday staff member granted: a quantity of something, a space, a time slot, a term. Capture it whether it was said in an email, noted after a call, or written in a contract.

Not promises, leave these out:
- requests from artists or vendors that nobody at Fieldday answered
- general information (trading hours, deadlines, directions)
- follow-up actions ("I'll send the map", "will come back to you")
- internal chatter between staff

Status:
- "firm": the staff member said yes.
- "tentative": they said maybe, or that they need to check ("I'll see if", "might be able to", "no promises yet"). Include these, marked tentative.

If a thread revises an earlier promise, return only the final version, quoting the sentence that states the final terms.

Fieldday staff: ${f.staff.map((s) => `${s.name} (${s.role})`).join(", ")}.
Known artists and vendors: ${f.parties.join(", ")}. Use these exact names when one matches; otherwise use the name as written.
Dates: ${f.days.map((d) => `${d.label} = ${d.date}${d.note ? ` (${d.note})` : ""}`).join(", ")}.

Resources, by id:
${f.resources.map((r) => `- ${r.id}: ${r.name}${r.unit ? ` (${r.unit})` : ""}`).join("\n")}

For each promise:
- quote: one contiguous span copied character for character from the text, the shortest span that states the promise. It is checked against the source and the promise is discarded if it does not match exactly.
- madeBy: the Fieldday staff member who made it. madeTo: the artist or vendor it was made to.
- resourceId: the matching id above, or null if the promise is for something not on the list.
- quantity: how many. For set-length, the number of minutes. Use 1 for a single space or slot.
- day: ISO date if the promise is for one day, null if it covers the whole festival or every day.
- start, end: 24-hour HH:MM if times are given, otherwise null.
- summary: a short plain phrase, e.g. "4 parking passes" or "Gate 2 load-in, Thursday 7am to 8am".

If there are no promises, return an empty list.`;

const squash = (s: string) => s.replace(/\s+/g, " ").trim();

export async function extract(source: Source, festival: Festival): Promise<Commitment[]> {
  const resourceIds = festival.resources.map((r) => r.id) as [string, ...string[]];
  const Schema = z.object({
    promises: z.array(
      z.object({
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

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    system: systemPrompt(festival),
    output_config: { effort: "medium", format: betaZodOutputFormat(Schema) },
    messages: [
      {
        role: "user",
        content: `Kind: ${source.kind}\nDate: ${source.date}\nFrom: ${source.from}\nTo: ${source.to}\nSubject: ${source.subject}\n\n${source.body}`,
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error(`Extraction failed for ${source.id} (${response.stop_reason})`);
  }

  // Anti-hallucination guard: a promise only counts if its quote is really in the source.
  const haystack = squash(source.body);
  return response.parsed_output.promises
    .filter((p) => haystack.includes(squash(p.quote)))
    .map((p, i) => ({ ...p, id: `${source.id}-p${i + 1}`, sourceId: source.id }));
}
