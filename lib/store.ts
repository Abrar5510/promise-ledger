import type { Commitment, Source } from "./types";

// ponytail: single browser only. Move to Supabase when two people need the same ledger.
const KEY = "promise-ledger-added";

export type Added = { sources: Source[]; commitments: Commitment[] };
export const EMPTY: Added = { sources: [], commitments: [] };

export function loadAdded(): Added {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "") as Added;
  } catch {
    return EMPTY;
  }
}

export function saveAdded(added: Added) {
  try {
    localStorage.setItem(KEY, JSON.stringify(added));
  } catch {}
}
