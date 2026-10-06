# Devpost: About the project (draft, rewrite in your own words)

**Team:** <team name>
**Track:** Backstage

## The problem and the user

The user is Fieldday's production team: five people with ten weeks to deliver a three-day festival for
15,000 people a day. To keep artists and vendors happy they say yes many times a day, in emails, on calls
and in contracts. Each yes is reasonable. Nobody can see all of them at once, so five people can hand out
41 parking passes for a 30-space lot, or promise the same green room to two artists, and only find out on
show day.

## What we built

The Promise Ledger reads Fieldday's correspondence and builds one list of everything the team has promised:
who promised it, to whom, how much, and when. It then checks those promises against each other and against
what physically exists, and puts the ones that can't all be kept at the top.

- Every promise links to the exact sentence it came from.
- Four kinds of clash: over capacity, double-booked, two people telling one artist different things, and
  promises nobody owns.
- Paste in a new email or call note and the ledger updates straight away.
- For any clash it drafts the email that fixes it. It never sends anything.

## How AI is used

- Claude reads each conversation and returns structured promises. This is the part only a language model
  can do: "three passes is fine", "told him Gate 2 is his from 7", and a contract clause are all promises.
- It tells firm promises from maybes ("I'll check if we can") and uses the final version when a thread
  revises an earlier number.
- The model does not decide what clashes. Plain code does the counting and the time-overlap checks.
- Every promise must quote the source word for word. If the quote isn't in the source, the promise is
  discarded.
- Claude also drafts the fix email for a human to edit and send.

## Ideas we considered

- An advancing desk that reads vendor insurance certificates and riders. Useful, but close to what
  document tools already do.
- A dress rehearsal that simulates load-in day with AI agents. Dramatic, but hard to make believable.
- No-forms vendor onboarding by photo. Strong on a phone, but vendors only.
- Ripple: re-planning when a headliner is delayed. A show-day tool, and the brief is about the ten weeks before.

We chose promises because <your reason>.

## Tools

Next.js, Tailwind, the Claude API (Opus 5.5) with structured outputs, Vercel, Claude Code.

## What's next

Connect it to the team's real inboxes, and let a change (a delayed headliner, a lost car park) show which
promises it breaks.
