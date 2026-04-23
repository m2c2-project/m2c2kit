import { afterAll } from "@jest/globals";

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalNode = globalThis as any;
  if (typeof globalNode.gc === "function") {
    globalNode.gc();
  }
});
