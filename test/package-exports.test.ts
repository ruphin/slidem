import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Guards the packaging contract: every registering module must be
// reachable as a subpath export and marked as having side effects.
const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  sideEffects: unknown;
  exports: Record<string, unknown>;
};

describe("package.json", () => {
  it("does not claim the whole package is side-effect free", () => {
    expect(pkg.sideEffects).not.toBe(false);
    expect(pkg.sideEffects).toContain("./dist/elements/*.js");
  });

  it("exposes every element module as a subpath export", () => {
    expect(pkg.exports["./elements/*"]).toBeDefined();
    const elements = globSync("src/elements/*.ts").filter(
      (f) => !f.endsWith(".test.ts"),
    );
    expect(elements.length).toBeGreaterThan(0);
  });
});
