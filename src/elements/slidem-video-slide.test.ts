import { describe, expect, it } from "vitest";
import { SlidemVideoSlide } from "./slidem-video-slide.js";

describe("elements/slidem-video-slide", () => {
  it("registers <slidem-video-slide>", () => {
    expect(customElements.get("slidem-video-slide")).toBe(SlidemVideoSlide);
    expect(document.createElement("slidem-video-slide")).toBeInstanceOf(
      SlidemVideoSlide,
    );
  });
});
