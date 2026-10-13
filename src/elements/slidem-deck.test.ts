import { describe, expect, it } from "vitest";
import { SlidemDeck } from "./slidem-deck.js";

describe("elements/slidem-deck", () => {
  it("registers <slidem-deck>", () => {
    expect(customElements.get("slidem-deck")).toBe(SlidemDeck);
    expect(document.createElement("slidem-deck")).toBeInstanceOf(SlidemDeck);
  });
});
