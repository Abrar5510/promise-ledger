import { generate } from "@/lib/extract";
import type { Commitment } from "@/lib/types";

export async function POST(request: Request) {
  const { headline, commitments } = await request.json().catch(() => ({}));
  if (typeof headline !== "string" || !Array.isArray(commitments) || commitments.length > 30) {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const lines = (commitments as Commitment[])
    .map((c) => `- ${c.madeBy} promised ${c.madeTo}: ${c.summary}. They wrote: "${String(c.quote).slice(0, 300)}"`)
    .join("\n");

  try {
    const draft = await generate(`Clash: ${headline.slice(0, 300)}\n\nPromises involved:\n${lines}`, {
      systemInstruction:
        "You help Fieldday Events, a five-person festival company, fix promises that clash. " +
        "Given a clash and the promises behind it, suggest the least painful fix in one or two sentences, " +
        "then draft the one email that does the most to resolve it. Start the draft with To: and Subject: lines. " +
        "Be warm, direct and specific about what changes and what is offered instead. " +
        "Plain text only, no markdown. Sign off as the staff member who should send it.",
    });
    return Response.json({ draft });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not draft that just now. Try again." }, { status: 502 });
  }
}
