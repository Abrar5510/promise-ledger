# The Promise Ledger

Affinda AI Innovation Challenge, Backstage track.

Fieldday's five staff say "yes" to artists and vendors across emails, calls and contracts. The Promise Ledger
reads those conversations, lists every promise Fieldday made, and flags the ones that can't all be kept.

## Run it

```bash
npm install
cp .env.example .env.local   # then add your Anthropic API key
npm run dev
```

## How it works

- `lib/extract.ts` sends one conversation to Claude and gets back structured promises. Each one carries a
  verbatim quote, and any promise whose quote is not in the source is thrown away.
- `lib/clashes.ts` decides what clashes. Plain code, no AI: sums against capacity, time overlaps,
  contradicting terms, and promises nobody owns.
- `data/sources.json` is the sample correspondence. `data/promises.json` is what was extracted from it.
  Regenerate with `npm run extract-seed`.
- Pasted conversations are kept in the browser's local storage.

## Check it

```bash
npm test
```
