import { describe, expect, it } from "vitest";
import { fontsReady } from "./fonts.js";

describe("fontsReady", () => {
  it("resolves", async () => {
    await expect(fontsReady()).resolves.not.toBeNull();
  });
});
