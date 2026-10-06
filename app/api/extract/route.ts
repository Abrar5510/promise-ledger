import festival from "@/data/festival.json";
import { extract } from "@/lib/extract";
import type { Festival, Source } from "@/lib/types";

const MAX_CHARS = 8000;

export async function POST(request: Request) {
  const { text } = await request.json().catch(() => ({}));
  if (typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "Paste an email, call note or contract clause." }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return Response.json({ error: `Too long. Keep it under ${MAX_CHARS} characters.` }, { status: 413 });
  }

  const source: Source = {
    id: `u${Date.now()}`,
    kind: "email",
    date: new Date().toISOString().slice(0, 10),
    from: "",
    to: "",
    subject: "Pasted text",
    body: text,
  };

  try {
    const commitments = await extract(source, festival as Festival);
    return Response.json({ source, commitments });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not read that just now. Try again." }, { status: 502 });
  }
}
