import { describe, it, expect, beforeEach } from "vitest";
import { createRoot } from "solid-js";
import { useLocalStorage } from "./useLocalStorage";

// Minimal in-memory localStorage shim for node test env
function installStorageShim() {
  const store = new Map<string, string>();
  const shim = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
  (globalThis as unknown as { localStorage: Storage }).localStorage = shim as unknown as Storage;
}

describe("useLocalStorage", () => {
  beforeEach(() => {
    installStorageShim();
  });

  it("uses the initial value when storage is empty", () => {
    createRoot((dispose) => {
      const [value] = useLocalStorage("fluel:test", "hello");
      expect(value()).toBe("hello");
      dispose();
    });
  });

  it("reads a previously persisted value", () => {
    localStorage.setItem("fluel:test", "from-storage");
    createRoot((dispose) => {
      const [value] = useLocalStorage("fluel:test", "initial");
      expect(value()).toBe("from-storage");
      dispose();
    });
  });

  it("in-memory setter still works even when storage throws", () => {
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage;

    createRoot((dispose) => {
      const [value, setValue] = useLocalStorage<string>("fluel:test", "fallback");
      expect(value()).toBe("fallback");
      expect(() => setValue("next")).not.toThrow();
      expect(value()).toBe("next");
      dispose();
    });
  });
});
