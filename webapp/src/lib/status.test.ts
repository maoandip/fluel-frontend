import { describe, it, expect } from "vitest";
import { txStatusClass, giftStatusClass } from "./status";

describe("txStatusClass", () => {
  it("maps tx_history statuses to their class", () => {
    expect(txStatusClass("confirmed")).toBe("statusDone");
    expect(txStatusClass("pending")).toBe("statusPending");
    expect(txStatusClass("submitting")).toBe("statusPending");
    expect(txStatusClass("broadcasted")).toBe("statusPending");
    expect(txStatusClass("reverted")).toBe("statusFailed");
    expect(txStatusClass("failed")).toBe("statusFailed");
    expect(txStatusClass("error")).toBe("statusFailed");
  });

  it("falls back to unknown for unrecognized statuses", () => {
    expect(txStatusClass("")).toBe("statusUnknown");
    expect(txStatusClass("UNKNOWN")).toBe("statusUnknown");
  });
});

describe("giftStatusClass", () => {
  it("maps known statuses to their class", () => {
    expect(giftStatusClass("claimed")).toBe("statusClaimed");
    expect(giftStatusClass("pending")).toBe("statusPending");
    expect(giftStatusClass("expired")).toBe("statusExpired");
  });

  it("falls back to default for unrecognized statuses", () => {
    expect(giftStatusClass("")).toBe("statusDefault");
    expect(giftStatusClass("foo")).toBe("statusDefault");
  });
});
