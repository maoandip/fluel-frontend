// Swap composition state machine.
//
// Models only the *composition* of a swap — quoting and confirming. Once the
// backend accepts the submission (SUBMITTED) the machine returns to idle: the
// settling half of the journey is owned by the in-flight swaps store
// (stores/swaps.ts), not the form, so the user can immediately compose
// another swap while earlier ones settle in the background.
//
// States:
//   idle       — no active quote
//   quoting    — fetching a price quote
//   quoted     — have a fresh quote, waiting for the user to confirm
//   confirming — user clicked Swap, posting /confirm

import { createMachine, assign } from "xstate";
import type { QuoteResponse } from "../../types";

export interface SwapContext {
  quote: QuoteResponse | null;
  error: string;
}

export type SwapEvent =
  | { type: "QUOTE_REQUEST" }
  | { type: "QUOTE_SUCCESS"; quote: QuoteResponse }
  | { type: "QUOTE_FAILURE"; error: string }
  | { type: "CLEAR" }
  | { type: "CONFIRM" }
  | { type: "SUBMITTED" }
  | { type: "CONFIRM_FAILURE"; error: string };

export const swapMachine = createMachine({
  id: "swap",
  initial: "idle",
  types: {} as {
    context: SwapContext;
    events: SwapEvent;
  },
  context: {
    quote: null,
    error: "",
  },
  states: {
    idle: {
      on: {
        QUOTE_REQUEST: { target: "quoting" },
      },
    },
    quoting: {
      on: {
        QUOTE_SUCCESS: {
          target: "quoted",
          actions: assign({
            quote: ({ event }) => event.quote,
            error: "",
          }),
        },
        QUOTE_FAILURE: {
          target: "idle",
          actions: assign({
            quote: null,
            error: ({ event }) => event.error,
          }),
        },
        CLEAR: {
          target: "idle",
          actions: assign({ quote: null, error: "" }),
        },
        // Rapid input changes cancel the in-flight fetch and start over.
        QUOTE_REQUEST: { target: "quoting" },
      },
    },
    quoted: {
      on: {
        CONFIRM: { target: "confirming" },
        // Input changed — fetch a new quote.
        QUOTE_REQUEST: { target: "quoting" },
        CLEAR: {
          target: "idle",
          actions: assign({ quote: null, error: "" }),
        },
      },
    },
    confirming: {
      on: {
        // Submission accepted — the swap is now the in-flight store's job.
        // Reset to idle so the form is immediately fresh for the next swap.
        SUBMITTED: {
          target: "idle",
          actions: assign({ quote: null, error: "" }),
        },
        CONFIRM_FAILURE: {
          target: "quoted",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
  },
});
