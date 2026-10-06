"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import festivalJson from "@/data/festival.json";
import seedCommitments from "@/data/promises.json";
import seedSources from "@/data/sources.json";
import { findClashes, promisedTotal } from "@/lib/clashes";
import { EMPTY, loadAdded, saveAdded, type Added } from "@/lib/store";
import type { Clash, Commitment, Festival, Source } from "@/lib/types";

const festival = festivalJson as Festival;

const EXAMPLE = `From: Mei Tanaka
To: DJ Ostara
Subject: Re: getting my decks to Stage B

Hi Ost,

Sorted. You've got a buggy on Saturday to get your decks from the gate to Stage B.

Mei`;

const dayLabel = (date: string | null) => festival.days.find((d) => d.date === date)?.label ?? date ?? "";
const button =
  "rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium transition active:translate-y-px hover:border-foreground/40 disabled:opacity-50";
const primary =
  "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition active:translate-y-px hover:opacity-85 disabled:opacity-50";

export default function Ledger() {
  const [added, setAdded] = useState<Added>(EMPTY);
  const [openClash, setOpenClash] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Commitment | null>(null);
  const [adding, setAdding] = useState(false);
  const [staff, setStaff] = useState<string | null>(null);

  useEffect(() => setAdded(loadAdded()), []);

  const sources = useMemo(() => [...(seedSources as Source[]), ...added.sources], [added]);
  const commitments = useMemo(() => [...(seedCommitments as Commitment[]), ...added.commitments], [added]);
  const clashes = useMemo(() => findClashes(commitments, festival.resources), [commitments]);
  const firm = commitments.filter((c) => c.status === "firm");
  const byId = (id: string) => commitments.find((c) => c.id === id)!;

  const update = (next: Added) => {
    setAdded(next);
    saveAdded(next);
  };

  const shown = staff ? commitments.filter((c) => c.madeBy === staff) : commitments;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">The Promise Ledger</h1>
          <p className="mt-1 text-sm text-muted">
            {festival.name}, {festival.days[1].label} to {festival.days[3].label}. Everything Fieldday has said yes to.
          </p>
        </div>
        <div className="flex gap-2">
          {added.sources.length > 0 && (
            <button className={button} onClick={() => update(EMPTY)}>
              Remove pasted ({added.sources.length})
            </button>
          )}
          <button className={primary} onClick={() => setAdding(true)}>
            Add a conversation
          </button>
        </div>
      </header>

      <p className="mt-8 text-lg">
        <span className="font-mono font-semibold">{commitments.length}</span> promises found in{" "}
        <span className="font-mono font-semibold">{sources.length}</span> emails, call notes and contracts.{" "}
        <span className={clashes.length ? "font-semibold text-accent" : "font-semibold"}>
          {clashes.length === 0 ? "No clashes." : `${clashes.length} can't all be kept.`}
        </span>
      </p>

      <section className="mt-8" aria-labelledby="clashes">
        <h2 id="clashes" className="text-sm font-semibold">
          Clashes
        </h2>
        {clashes.length === 0 ? (
          <p className="mt-3 rounded-md border border-line bg-surface p-4 text-sm text-muted">
            Nothing clashes. Add a conversation to check it against the ledger.
          </p>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-md border border-line bg-surface">
            {clashes.map((clash) => (
              <ClashRow
                key={clash.id}
                clash={clash}
                commitments={clash.commitmentIds.map(byId)}
                open={openClash === clash.id}
                onToggle={() => setOpenClash(openClash === clash.id ? null : clash.id)}
                onView={setViewing}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10" aria-labelledby="capacity">
        <h2 id="capacity" className="text-sm font-semibold">
          Promised against what exists
        </h2>
        <div className="mt-3 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {festival.resources
            .filter((r) => r.kind === "countable")
            .map((r) => {
              const days = r.per === "day" ? festival.days.map((d) => d.date) : [null];
              const peak = days
                .map((day) => ({ day, total: promisedTotal(firm, r, day) }))
                .sort((a, b) => b.total - a.total)[0];
              const over = peak.total > r.capacity!;
              return (
                <div key={r.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span>
                      {r.name}
                      {peak.day && <span className="text-muted">, busiest day {dayLabel(peak.day)}</span>}
                    </span>
                    <span className={`font-mono ${over ? "font-semibold text-accent" : ""}`}>
                      {peak.total} of {r.capacity}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-md bg-line" role="presentation">
                    <div
                      className={`h-full rounded-md ${over ? "bg-accent" : "bg-foreground/70"}`}
                      style={{ width: `${Math.min(100, (peak.total / r.capacity!) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="all" className="text-sm font-semibold">
            Every promise
          </h2>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by who promised">
            {[null, ...festival.staff.map((s) => s.name)].map((name) => (
              <button
                key={name ?? "all"}
                aria-pressed={staff === name}
                onClick={() => setStaff(name)}
                className={`rounded-md px-2.5 py-1 text-sm transition ${
                  staff === name ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                }`}
              >
                {name ? name.split(" ")[0] : "Everyone"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 overflow-x-auto rounded-md border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Promised to</th>
                <th className="px-3 py-2 font-medium">What</th>
                <th className="px-3 py-2 font-medium">By</th>
                <th className="px-3 py-2 font-medium">
                  <span className="sr-only">Source</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2 whitespace-nowrap">{c.madeTo}</td>
                  <td className="px-3 py-2">
                    {c.summary}
                    {c.status === "tentative" && <span className="ml-2 text-muted">(not counted)</span>}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted">{c.madeBy}</td>
                  <td className="px-3 py-2 text-right">
                    <button className="whitespace-nowrap underline underline-offset-2" onClick={() => setViewing(c)}>
                      See where
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {viewing && (
        <SourceSheet
          commitment={viewing}
          source={sources.find((s) => s.id === viewing.sourceId)!}
          onClose={() => setViewing(null)}
        />
      )}
      {adding && (
        <AddSheet
          onClose={() => setAdding(false)}
          onAdded={(source, found) =>
            update({ sources: [...added.sources, source], commitments: [...added.commitments, ...found] })
          }
        />
      )}
    </main>
  );
}

function ClashRow({
  clash,
  commitments,
  open,
  onToggle,
  onView,
}: {
  clash: Clash;
  commitments: Commitment[];
  open: boolean;
  onToggle: () => void;
  onView: (c: Commitment) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const people = new Set(commitments.map((c) => c.madeBy));

  const writeDraft = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline: clash.headline, commitments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDraft(data.draft);
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <li className="border-b border-line last:border-0">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-baseline justify-between gap-4 px-4 py-3 text-left hover:bg-accent-soft"
      >
        <span className="font-medium text-accent">{clash.headline}</span>
        <span className="shrink-0 text-sm text-muted">
          {commitments.length} {commitments.length === 1 ? "promise" : "promises"}, {people.size}{" "}
          {people.size === 1 ? "person" : "people"}
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-4 py-4">
          <ul className="grid gap-3">
            {commitments.map((c) => (
              <li key={c.id} className="text-sm">
                <p>
                  <span className="font-medium">{c.madeBy}</span> to{" "}
                  <span className="font-medium">{c.madeTo}</span>: {c.summary}
                </p>
                <p className="mt-0.5 text-muted">
                  &ldquo;{c.quote}&rdquo;{" "}
                  <button className="underline underline-offset-2" onClick={() => onView(c)}>
                    See where
                  </button>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <button className={button} onClick={writeDraft} disabled={state === "loading"}>
              {state === "loading" ? "Drafting..." : draft ? "Draft again" : "Draft a fix"}
            </button>
            {state === "error" && (
              <span className="text-sm text-accent" role="alert">
                Could not draft that just now. Try again.
              </span>
            )}
          </div>
          {state === "loading" && !draft && <div className="mt-3 h-32 animate-pulse rounded-md bg-line" />}
          {draft && (
            <div className="mt-3">
              <pre className="rounded-md border border-line bg-background p-3 font-sans text-sm whitespace-pre-wrap">
                {draft}
              </pre>
              <p className="mt-1.5 text-sm text-muted">A draft for you to edit and send. Nothing has been sent.</p>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-lg border-l border-line bg-surface p-0 text-foreground"
    >
      <div className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className={button} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}

function SourceSheet({ commitment, source, onClose }: { commitment: Commitment; source: Source; onClose: () => void }) {
  const at = source.body.toLowerCase().indexOf(commitment.quote.toLowerCase());
  return (
    <Sheet title={source.subject} onClose={onClose}>
      <p className="text-sm text-muted">
        {source.kind === "call-note" ? "Call note" : source.kind === "contract" ? "Contract" : "Email"}, {source.date}
        {source.from && `. From ${source.from} to ${source.to}.`}
      </p>
      <p className="mt-4 text-sm whitespace-pre-wrap leading-relaxed">
        {at < 0 ? (
          source.body
        ) : (
          <>
            {source.body.slice(0, at)}
            <mark className="rounded-sm bg-mark px-0.5 text-foreground">
              {source.body.slice(at, at + commitment.quote.length)}
            </mark>
            {source.body.slice(at + commitment.quote.length)}
          </>
        )}
      </p>
      <p className="mt-6 border-t border-line pt-4 text-sm">
        Read as: <span className="font-medium">{commitment.madeBy}</span> promised{" "}
        <span className="font-medium">{commitment.madeTo}</span> {commitment.summary}
        {commitment.status === "tentative" && " (not confirmed, so not counted)"}.
      </p>
    </Sheet>
  );
}

function AddSheet({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: (source: Source, commitments: Commitment[]) => void;
}) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.commitments.length === 0) {
        setMessage("No promises in that one. Nothing was added.");
      } else {
        onAdded(data.source, data.commitments);
        onClose();
      }
    } catch (error) {
      setMessage(error instanceof Error && error.message ? error.message : "Could not read that just now. Try again.");
    }
    setState("idle");
  };

  return (
    <Sheet title="Add a conversation" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor="text" className="text-sm font-medium">
          Email, call note or contract clause
        </label>
        <textarea
          id="text"
          required
          rows={12}
          maxLength={8000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="rounded-md border border-line bg-background p-3 text-sm focus:outline-2 focus:outline-foreground"
        />
        <p className="text-sm text-muted">
          Paste it as it is. Promises are pulled out and checked against everything already in the ledger.
        </p>
        {message && (
          <p className="text-sm text-accent" role="alert">
            {message}
          </p>
        )}
        <div className="mt-2 flex gap-2">
          <button type="submit" className={primary} disabled={state === "loading"}>
            {state === "loading" ? "Reading..." : "Read it"}
          </button>
          <button type="button" className={button} onClick={() => setText(EXAMPLE)}>
            Use an example
          </button>
        </div>
      </form>
    </Sheet>
  );
}
