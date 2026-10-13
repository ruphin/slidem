import { describe, expect, it } from "vitest";
import { SlidemSlide } from "./slidem-slide.js";

describe("elements/slidem-slide", () => {
  it("registers <slidem-slide>", () => {
    expect(customElements.get("slidem-slide")).toBe(SlidemSlide);
    expect(document.createElement("slidem-slide")).toBeInstanceOf(SlidemSlide);
  });
});
