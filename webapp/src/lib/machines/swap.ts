// Swap flow state machine.
//
// Models the lifecycle of a cross-chain gas swap as a finite state machine
// so invalid state combinations (e.g. "quoting" + "pending") become
// structurally impossible. The component orchestrates the async work
// (debounced fetch, status polling) and drives the machine via events.
//
// States:
//   idle       — no active quote
//   quoting    — fetching a price quote
//   quoted     — have a fresh quote, waiting for user to confirm
//   confirming — user clicked swap, posting /confirm
//   submitting — /confirm accepted, waiting for txHash via /api/tx polling
//   pending    — tx hash known, polling /api/status for LI.FI progress
//   done       — tx complete
//   failed     — tx or confirm failed; retry transitions back to confirming

import { createMachine, assign } from "xstate";
import type { QuoteResponse } from "../../types";

export interface SwapContext {
  quote: QuoteResponse | null;
  submitId: string;
  txHash: string;
  statusMsg: string;
  error: string;
}

export type SwapEvent =
  | { type: "QUOTE_REQUEST" }
  | { type: "QUOTE_SUCCESS"; quote: QuoteResponse }
  | { type: "QUOTE_FAILURE"; error: string }
  | { type: "CLEAR" }
  | { type: "CONFIRM" }
  | { type: "SUBMIT_ACCEPTED"; submitId: string }
  | { type: "TX_HASH_READY"; txHash: string }
  | { type: "CONFIRM_FAILURE"; error: string }
  | { type: "STATUS_UPDATE"; message: string }
  | { type: "STATUS_DONE"; message?: string }
  | { type: "STATUS_FAILED"; message?: string }
  | { type: "RESET" };

export const swapMachine = createMachine({
  id: "swap",
  initial: "idle",
  types: {} as {
    context: SwapContext;
    events: SwapEvent;
  },
  context: {
    quote: null,
    submitId: "",
    txHash: "",
    statusMsg: "",
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
        SUBMIT_ACCEPTED: {
          target: "submitting",
          actions: assign({
            submitId: ({ event }) => event.submitId,
            statusMsg: "Submitting transaction...",
          }),
        },
        CONFIRM_FAILURE: {
          target: "quoted",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    submitting: {
      on: {
        TX_HASH_READY: {
          target: "pending",
          actions: assign({
            txHash: ({ event }) => event.txHash,
            statusMsg: "Transaction submitted...",
          }),
        },
        // Idempotent confirm hits a row that's already complete or failed.
        STATUS_DONE: {
          target: "done",
          actions: assign({
            statusMsg: ({ event }) => event.message ?? "Your gas has arrived!",
          }),
        },
        STATUS_FAILED: {
          target: "failed",
          actions: assign({
            statusMsg: ({ event }) => event.message ?? "Swap failed",
          }),
        },
        STATUS_UPDATE: {
          actions: assign({ statusMsg: ({ event }) => event.message }),
        },
      },
    },
    pending: {
      on: {
        STATUS_UPDATE: {
          actions: assign({ statusMsg: ({ event }) => event.message }),
        },
        STATUS_DONE: {
          target: "done",
          actions: assign({
            statusMsg: ({ event }) => event.message ?? "Your gas has arrived!",
          }),
        },
        STATUS_FAILED: {
          target: "failed",
          actions: assign({
            statusMsg: ({ event }) => event.message ?? "Swap failed",
          }),
        },
      },
    },
    done: {
      on: {
        RESET: { target: "idle", actions: assign(() => initialContext()) },
      },
    },
    failed: {
      on: {
        RESET: { target: "idle", actions: assign(() => initialContext()) },
        // Retry: go back to quoted so the user can re-confirm with the
        // existing quote data (if still valid) or re-quote and retry.
        QUOTE_REQUEST: { target: "quoting" },
      },
    },
  },
});

function initialContext(): SwapContext {
  return { quote: null, submitId: "", txHash: "", statusMsg: "", error: "" };
}
