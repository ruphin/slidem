import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { SlidemDeck } from "./slidem-deck.js";
import { SlidemSlide } from "./slidem-slide.js";

beforeAll(() => {
  customElements.define("test-deck", SlidemDeck);
  customElements.define("test-deck-slide", SlidemSlide);
});

beforeEach(() => {
  history.replaceState({}, "", "/");
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
});

const frame = () => new Promise(requestAnimationFrame);
const settle = (deck: SlidemDeck) => deck.updateComplete;

async function mount(html: string): Promise<SlidemDeck> {
  const template = document.createElement("template");
  template.innerHTML = `<test-deck loading>${html}</test-deck>`;
  document.body.append(template.content.cloneNode(true));
  const deck = document.querySelector("test-deck") as SlidemDeck;
  // The deck routes for the first time after definitions, fonts and a frame,
  // never synchronously, so the listener is in time.
  await new Promise((resolve) =>
    deck.addEventListener("change", resolve, { once: true }),
  );
  await frame();
  return deck;
}

const THREE_SLIDES = `
  <test-deck-slide id="one"><p>1</p></test-deck-slide>
  <test-deck-slide id="two"><p>2</p><p reveal>a</p><p reveal>b</p></test-deck-slide>
  <test-deck-slide id="three"><p>3</p><p slot="notes">Note three</p></test-deck-slide>
`;

describe("SlidemDeck", () => {
  it("collects slides, builds a progress dot per slide and shows the first", async () => {
    const deck = await mount(THREE_SLIDES);
    expect(deck.slides.map((slide) => slide.id)).toEqual([
      "one",
      "two",
      "three",
    ]);
    expect(deck.hasAttribute("loading")).toBe(false);
    const dots = deck.shadowRoot!.querySelectorAll("#progress div");
    expect(dots).toHaveLength(3);
    expect(dots[0]?.classList.contains("active")).toBe(true);
    expect(deck.currentSlide?.id).toBe("one");
    expect(deck.currentSlide?.hasAttribute("active")).toBe(true);
    expect(deck.nextSlide?.hasAttribute("next")).toBe(true);
  });

  it("moves notes out of the slides and up to the deck", async () => {
    const deck = await mount(THREE_SLIDES);
    const note = deck.querySelector('[slot="notes"]')!;
    expect(note.parentElement).toBe(deck);
    expect(note.getAttribute("slide")).toBe("3");
  });

  it("navigates forward through steps and slides, writing the hash", async () => {
    const deck = await mount(THREE_SLIDES);
    deck.forward();
    await settle(deck);
    expect(location.hash).toBe("#slide-2/step-1");
    expect(deck.currentSlide?.id).toBe("two");
    expect(deck.slides[0]?.hasAttribute("previous")).toBe(true);
    expect(deck.slides[0]?.hasAttribute("active")).toBe(false);
    expect(deck.slides[1]?.classList.contains("animate-forward")).toBe(true);

    deck.forward();
    expect(location.hash).toBe("#slide-2/step-2");
    deck.forward();
    expect(location.hash).toBe("#slide-2/step-3");
    deck.forward();
    expect(location.hash).toBe("#slide-3/step-1");
    deck.forward();
    expect(location.hash).toBe("#slide-3/step-1");
    await settle(deck);
    expect(deck.slides[2]?.hasAttribute("active")).toBe(true);
    expect(deck.slides[1]?.hasAttribute("previous")).toBe(true);
    expect(deck.slides[0]?.hasAttribute("previous")).toBe(false);
  });

  it("navigates back to the last step of the previous slide", async () => {
    const deck = await mount(THREE_SLIDES);
    deck.state = { slide: 3, step: 1 };
    await settle(deck);
    deck.back();
    await settle(deck);
    expect(location.hash).toBe("#slide-2/step-3");
    expect(deck.slides[1]?.classList.contains("animate-backward")).toBe(true);
    deck.back();
    deck.back();
    deck.back();
    expect(location.hash).toBe("#slide-1/step-1");
    deck.back();
    expect(location.hash).toBe("#slide-1/step-1");
  });

  it("ignores invalid state", async () => {
    const deck = await mount(THREE_SLIDES);
    deck.state = { slide: Infinity };
    deck.state = { step: NaN };
    expect(location.hash).toBe("");
  });

  it("follows the location hash", async () => {
    const deck = await mount(THREE_SLIDES);
    location.hash = "#slide-3/step-1";
    // happy-dom does not fire hashchange by itself.
    window.dispatchEvent(new Event("hashchange"));
    await settle(deck);
    expect(deck.currentSlide?.id).toBe("three");
    expect(deck.slides[2]?.hasAttribute("active")).toBe(true);
  });

  it("dispatches change on every navigation", async () => {
    const deck = await mount(THREE_SLIDES);
    const onChange = vi.fn();
    deck.addEventListener("change", onChange);
    deck.forward();
    await settle(deck);
    deck.forward();
    await settle(deck);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("shares the location with other windows through localStorage", async () => {
    const deck = await mount(THREE_SLIDES);
    deck.forward();
    expect(localStorage.getItem("location")).toBe("#slide-2/step-1");
  });

  it("puts the slide name in the document title", async () => {
    document.title = "Deck";
    const deck = await mount(`
      <test-deck-slide></test-deck-slide>
      <test-deck-slide name="Second"></test-deck-slide>
    `);
    deck.forward();
    await settle(deck);
    expect(document.title).toBe("Second | Deck");
    deck.back();
    await settle(deck);
    expect(document.title).toBe("Deck");
  });

  it("toggles presenter mode and reflects it in the query string", async () => {
    const deck = await mount(THREE_SLIDES);
    expect(deck.presenter).toBe(false);
    deck.togglePresenter();
    await settle(deck);
    expect(deck.presenter).toBe(true);
    expect(deck.hasAttribute("presenter")).toBe(true);
    expect(location.search).toBe("?presenter=");
    deck.togglePresenter();
    await settle(deck);
    expect(deck.presenter).toBe(false);
    expect(location.search).toBe("");
  });

  it("activates the notes of the current slide in presenter mode", async () => {
    const deck = await mount(THREE_SLIDES);
    deck.togglePresenter();
    deck.state = { slide: 3, step: 1 };
    await settle(deck);
    const note = deck.querySelector('[slot="notes"]')!;
    expect(note.hasAttribute("active")).toBe(true);
    deck.back();
    await settle(deck);
    expect(note.hasAttribute("active")).toBe(false);
  });

  it("runs the presenter timer", async () => {
    const deck = await mount(THREE_SLIDES);
    const timer = deck.shadowRoot!.getElementById("timer")!;
    vi.useFakeTimers();
    try {
      deck.toggleTimer();
      await settle(deck);
      expect(timer.textContent).toBe("00:00");
      vi.advanceTimersByTime(61_000);
      await settle(deck);
      expect(timer.textContent).toBe("01:01");
      deck.toggleTimer();
      await settle(deck);
      expect(timer.textContent).toBe("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("navigates with the keyboard, except inside inputs", async () => {
    const deck = await mount(`${THREE_SLIDES}<input slot="forward">`);
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight" }));
    await settle(deck);
    expect(deck.currentSlide?.id).toBe("two");
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowLeft" }));
    await settle(deck);
    expect(deck.currentSlide?.id).toBe("one");

    deck
      .querySelector("input")!
      .dispatchEvent(
        new KeyboardEvent("keyup", { key: "ArrowRight", bubbles: true }),
      );
    expect(deck.currentSlide?.id).toBe("one");
  });
});
