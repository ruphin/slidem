import { describe, expect, it } from "vitest";
import { formatState, isValidState, parseState, sameState } from "./state.js";

describe("parseState", () => {
  it("reads slide and step from a hash", () => {
    expect(parseState("#slide-3/step-4")).toEqual({ slide: 3, step: 4 });
  });

  it("falls back to the first step of the first slide", () => {
    expect(parseState("")).toEqual({ slide: 1, step: 1 });
    expect(parseState("#")).toEqual({ slide: 1, step: 1 });
    expect(parseState("#something-else")).toEqual({ slide: 1, step: 1 });
  });

  it("accepts a slide without a step", () => {
    expect(parseState("#slide-7")).toEqual({ slide: 7, step: 1 });
  });
});

describe("formatState", () => {
  it("round-trips through parseState", () => {
    const state = { slide: 12, step: 2 };
    expect(formatState(state)).toBe("#slide-12/step-2");
    expect(parseState(formatState(state))).toEqual(state);
  });
});

describe("sameState", () => {
  it("compares both parts", () => {
    expect(sameState({ slide: 1, step: 2 }, { slide: 1, step: 2 })).toBe(true);
    expect(sameState({ slide: 1, step: 2 }, { slide: 1, step: 3 })).toBe(false);
    expect(sameState({ slide: 1, step: 2 }, { slide: 2, step: 2 })).toBe(false);
  });
});

describe("isValidState", () => {
  it("rejects non-finite and non-positive values", () => {
    expect(isValidState({ slide: 1, step: 1 })).toBe(true);
    expect(isValidState({ slide: Infinity, step: 1 })).toBe(false);
    expect(isValidState({ slide: 1, step: NaN })).toBe(false);
    expect(isValidState({ slide: 0, step: 1 })).toBe(false);
    expect(isValidState({ slide: 1 })).toBe(false);
  });
});
