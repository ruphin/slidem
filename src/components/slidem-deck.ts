import {
  GluonElement,
  type PropertyDeclarations,
  type PropertyValues,
  css,
  html,
} from "@gluon/gluon";
import { fontsReady } from "../lib/fonts.js";
import {
  formatState,
  isValidState,
  parseState,
  sameState,
  type DeckState,
} from "../lib/state.js";
import { formatElapsed } from "../lib/timer.js";
import type { SlidemSlideBase } from "./slidem-slide-base.js";

/** Styles for the document the deck lives in: slide content is light DOM. */
const globalStyles = css`
  body {
    margin: 0;
  }

  slidem-deck [reveal] {
    opacity: 0;
    transition: opacity 0.2s;
  }

  slidem-deck [current],
  slidem-deck [past] {
    opacity: 1;
  }

  slidem-slide h1,
  slidem-slide h2,
  slidem-slide h3,
  slidem-slide h4,
  slidem-slide h5,
  slidem-slide h6,
  slidem-slide p {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  slidem-slide a {
    color: inherit;
    text-decoration: none;
  }

  /* Keyframes are defined here to patch a scoping bug in Chrome */
  @keyframes slidem-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slidem-fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slidem-slide-in-forward {
    from {
      translate: 100vw 0;
    }
    to {
      translate: 0 0;
    }
  }

  @keyframes slidem-slide-in-backward {
    from {
      translate: 0 0;
    }
    to {
      translate: 100vw 0;
    }
  }

  @keyframes slidem-slide-out-forward {
    from {
      translate: 0 0;
    }
    to {
      translate: -100vw 0;
    }
  }

  @keyframes slidem-slide-out-backward {
    from {
      translate: -100vw 0;
    }
    to {
      translate: 0 0;
    }
  }
`;

// The constructed sheet for `globalStyles`, made when the first deck connects.
let globalSheet: CSSStyleSheet | undefined;

/** How long the deck waits for fonts and slide definitions before it shows. */
const LOADING_TIMEOUT = 2000;

/** Key under which the current location is shared between windows. */
const LOCATION_KEY = "location";

function isInInputLike(event: Event): boolean {
  return event
    .composedPath()
    .some(
      (node) =>
        node instanceof HTMLInputElement ||
        (node instanceof Element && node.hasAttribute("contenteditable")),
    );
}

function changeLocation({
  search = location.search,
  hash = location.hash,
}: {
  search?: string;
  hash?: string;
}): void {
  const url = new URL(location.href);
  url.search = new URLSearchParams(search).toString();
  url.hash = hash;
  history.pushState({}, "", url.toString());
  dispatchEvent(new Event("location-changed"));
  localStorage.setItem(LOCATION_KEY, location.hash);
}

/**
 * The deck: routes the location hash to a slide and step, animates the
 * transitions, and provides presenter mode. Pure class with no registration
 * side effect: import "slidem/elements/slidem-deck" to register it as
 * <slidem-deck>.
 */
export class SlidemDeck extends GluonElement {
  static override styles = css`
      :host {
        /* inset for active slide */
        --active-inset-block-start: calc(25% - 20px);
        --active-inset-block-end: calc(25% - 20px);
        --active-inset-inline-start: calc(5% - 20px);
        --active-inset-inline-end: calc(45% - 20px);

        /* inset for next slide */
        --presenter-inset-block-start: calc(32.5% - 20px);
        --presenter-inset-block-end: calc(32.5% - 20px);
        --presenter-inset-inline-start: calc(60.5% - 20px);
        --presenter-inset-inline-end: calc(4.5% - 20px);
      }

      :host {
        display: block;
        overflow: hidden;
        position: absolute;
        inset: 0 0 0 0;
        font-family: "sans-serif";
        font-size: 56px;
        line-height: 1;
      }

      #slides ::slotted(*) {
        position: absolute;
        inset: 0 0 0 0;
        animation-duration: 0.4s;
        animation-fill-mode: both;
        animation-timing-function: ease-in-out;
      }

      #slides ::slotted(:not([active]):not([previous]):not([next])) {
        display: none;
      }

      :host(:not([presenter])) #slides ::slotted([next]:not([previous])) {
        display: none;
      }

      #progress {
        position: absolute;
        inset-block-end: 0;
        inset-inline-start: 0;
        inset-inline-end: 0;
        height: 50px;
        text-align: center;
        display: flex;
        flex-flow: row;
        justify-content: center;
        z-index: 10;
      }

      #progress div {
        height: 8px;
        width: 8px;
        border-radius: 50%;
        border: 2px solid white;
        margin-left: 6px;
        margin-right: 6px;
        background: transparent;
        transition:
          background 0.2s,
          scale 0.2s;
      }

      #progress div.active {
        background: white;
        scale: 1.3;
      }

      :host([progress="dark"]) #progress div {
        border: 2px solid black;
      }

      :host([progress="dark"]) #progress div.active {
        background: black;
      }

      :host([progress="none"]) #progress {
        display: none;
      }

      #timer {
        display: none;
        position: absolute;
        inset-block-start: 5%;
        inset-inline-end: 5%;
        color: white;
        font-size: 4vw;
        font-weight: bold;
        font-family: Helvetica, Arial, sans-serif;
      }

      :host([presenter]) #timer {
        display: inline;
      }

      :host([presenter]) {
        background: black;
      }

      /* White box around active slide */
      :host([presenter])::before,
      :host([presenter])::after {
        display: block;
        position: absolute;
        content: "";
        border: 2px solid white;
      }

      :host([presenter])::before {
        inset-block: var(--active-inset-block-start) var(--active-inset-block-end);
        inset-inline: var(--active-inset-inline-start)
          var(--active-inset-inline-end);
      }

      /* White box around next slide */
      :host([presenter])::after {
        inset-block: var(--presenter-inset-block-start)
          var(--presenter-inset-block-end);
        inset-inline: var(--presenter-inset-inline-start)
          var(--presenter-inset-inline-end);
      }

      :host([presenter]) #slides ::slotted(*) {
        animation: none !important; /* Block user-configured animations */
      }

      :host([presenter]) #slides ::slotted([previous]:not([next])) {
        display: none;
      }

      :host([presenter]) #slides ::slotted([active]) {
        translate: -20% 0;
        scale: 0.5 !important; /* Force presenter layout */
      }

      :host([presenter]) #slides ::slotted([next]) {
        translate: 28% 0;
        scale: 0.35 !important; /* Force presenter layout */
      }

      :host([presenter]) #progress {
        translate: -20% 25vh;
        scale: 0.5;
      }

      #notes {
        font-size: 18px;
        position: absolute;
        inset-block-start: calc(
          var(--presenter-inset-block-start) + var(--presenter-inset-block-end) +
            80px
        );
        inset-inline-start: var(--presenter-inset-inline-start);
      }

      :host(:not([presenter])) #notes,
      #notes ::slotted(:not([active])) {
        display: none !important;
      }

      #slides ::slotted([active]) {
        z-index: 2;
      }

      #slides ::slotted([previous]) {
        z-index: 0;
      }

      #slides ::slotted([in="fade"][active].animate-forward) {
        animation-name: slidem-fade-in;
      }

      #slides ::slotted([in="fade"][previous].animate-backward) {
        animation-name: slidem-fade-out;
        z-index: 3;
      }

      #slides ::slotted([out="fade"][active].animate-backward) {
        animation-name: slidem-fade-in;
      }

      #slides ::slotted([out="fade"][previous].animate-forward) {
        animation-name: slidem-fade-out;
        z-index: 3;
      }

      #slides ::slotted([in="slide"][active].animate-forward) {
        animation-name: slidem-slide-in-forward;
      }

      #slides ::slotted([in="slide"][previous].animate-backward) {
        animation-name: slidem-slide-in-backward;
        z-index: 3;
      }

      #slides ::slotted([out="slide"][active].animate-backward) {
        animation-name: slidem-slide-out-backward;
      }

      #slides ::slotted([out="slide"][previous].animate-forward) {
        animation-name: slidem-slide-out-forward;
        z-index: 3;
      }

      @keyframes slidem-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slidem-fade-out {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      @keyframes slidem-slide-in-forward {
        from {
          translate: 100vw 0;
        }
        to {
          translate: 0 0;
        }
      }

      @keyframes slidem-slide-in-backward {
        from {
          translate: 0 0;
        }
        to {
          translate: 100vw 0;
        }
      }

      @keyframes slidem-slide-out-forward {
        from {
          translate: 0 0;
        }
        to {
          translate: -100vw 0;
        }
      }

      @keyframes slidem-slide-out-backward {
        from {
          translate: -100vw 0;
        }
        to {
          translate: 0 0;
        }
      }
  `;

  static override properties: PropertyDeclarations = {
    presenter: { type: Boolean, attribute: true, reflect: true },
    font: { attribute: true },
    slides: { type: Array },
    slide: { type: Number },
    step: { type: Number },
    timerText: {},
  };

  /** Whether presenter mode is on. Reflects the `presenter` attribute. */
  presenter = false;

  /** The font family of the deck. Reflects the `font` attribute. */
  font: string | null = null;

  /** The slides, in order. Collected from the deck's children on connect. */
  slides: SlidemSlideBase[] = [];

  /** The 1-based index of the slide on screen, from the location hash. */
  slide = 1;

  /** The 1-based step of the slide on screen, from the location hash. */
  step = 1;

  /** The elapsed time shown in presenter mode, empty while the timer is off. */
  timerText = "";

  #timerInterval: ReturnType<typeof setInterval> | undefined;
  #autoTimer: ReturnType<typeof setInterval> | undefined;

  // The 1-based number of the slide that is marked active, once routed.
  #shownSlide: number | undefined;
  // Whether a route change is waiting for the next update to be applied.
  #pendingRoute = false;

  // The document title before the deck started adding slide names to it.
  readonly #originalTitle = document.title;

  /** The 1-based slide and step from the location hash. Setting it navigates. */
  get state(): DeckState {
    return parseState(location.hash);
  }
  set state(next: Partial<DeckState>) {
    const old = this.state;
    const state = {
      slide: next.slide ?? old.slide,
      step: next.step ?? old.step,
    };
    if (!isValidState(state) || sameState(state, old)) return;
    changeLocation({ hash: formatState(state) });
  }

  get currentStepIndex(): number {
    return this.state.step - 1;
  }

  get currentSlideIndex(): number {
    return this.state.slide - 1;
  }

  get previousSlide(): SlidemSlideBase | null {
    return this.slides[this.currentSlideIndex - 1] ?? null;
  }

  get currentSlide(): SlidemSlideBase | null {
    return this.slides[this.currentSlideIndex] ?? null;
  }

  get nextSlide(): SlidemSlideBase | null {
    return this.slides[this.currentSlideIndex + 1] ?? null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#listen();
    if (!globalSheet) {
      globalSheet = new CSSStyleSheet();
      globalSheet.replaceSync(globalStyles);
    }
    if (!document.adoptedStyleSheets.includes(globalSheet)) {
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        globalSheet,
      ];
    }
    // Presenter mode starts on when the page is opened with `?presenter`.
    if (new URLSearchParams(location.search).has("presenter")) {
      this.presenter = true;
    }

    // Every child without a slot is a slide. They are not necessarily
    // upgraded yet; #init waits for their definitions before routing.
    this.slides = Array.from(this.children).filter(
      (child) => !child.hasAttribute("slot"),
    ) as unknown as SlidemSlideBase[];

    this.slides.forEach((slide, i) => {
      for (const note of slide.querySelectorAll('[slot="notes"]')) {
        note.setAttribute("slide", String(i + 1));
        this.append(note);
      }
    });

    void this.#init();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.#autoTimer);
    this.#autoTimer = undefined;
  }

  /** Installs the window and document listeners for the time the deck is connected. */
  #listen(): void {
    const signal = this.disconnectSignal;
    const route = () => this.#onRouteChange();
    window.addEventListener("hashchange", route, { signal });
    window.addEventListener("location-changed", route, { signal });
    window.addEventListener("popstate", route, { signal });

    // Shared navigation between browser windows: follow location changes
    // that other windows of this deck write to localStorage.
    window.addEventListener(
      "storage",
      ({ key, newValue }) => {
        if (
          key === LOCATION_KEY &&
          newValue !== null &&
          location.hash !== newValue
        ) {
          changeLocation({ hash: newValue });
        }
      },
      { signal },
    );

    window.addEventListener("keyup", (event) => this.#onKey(event), { signal });

    // Gesture navigation: a horizontal swipe moves between slides.
    let touchX = 0;
    let touchY = 0;
    document.addEventListener(
      "touchstart",
      ({ touches }) => {
        const touch = touches[0];
        if (!touch) return;
        touchX = touch.clientX;
        touchY = touch.clientY;
      },
      { signal },
    );
    document.addEventListener(
      "touchend",
      ({ changedTouches }) => {
        const touch = changedTouches[0];
        if (!touch) return;
        const xMove = touch.clientX - touchX;
        const yMove = touch.clientY - touchY;
        if (Math.abs(xMove) > 60 && Math.abs(xMove) > Math.abs(yMove)) {
          if (xMove < 0) this.forward();
          else this.back();
        }
      },
      { signal },
    );
  }

  /**
   * Waits until the slide elements are defined and fonts are loaded, or
   * until the timeout, then removes the `loading` attribute and routes.
   */
  async #init(): Promise<void> {
    await Promise.race([
      this.#untilDefined(),
      fontsReady(),
      new Promise((resolve) => setTimeout(resolve, LOADING_TIMEOUT)),
    ]);
    await fontsReady();
    await new Promise(requestAnimationFrame);
    if (!this.isConnected) return;
    this.removeAttribute("loading");
    this.#onRouteChange();
  }

  async #untilDefined(): Promise<void> {
    await Promise.all(
      this.slides
        .filter((slide) => slide.localName.includes("-"))
        .map((slide) => customElements.whenDefined(slide.localName)),
    );
  }

  #onKey(event: KeyboardEvent): void {
    if (isInInputLike(event)) return;
    switch (event.key) {
      case "PageDown":
      case "ArrowRight":
      case "j":
      case "l":
        this.forward();
        break;
      case "PageUp":
      case "ArrowLeft":
      case "h":
      case "k":
        this.back();
        break;
      case "t":
        if (this.presenter) this.toggleTimer();
        break;
      case "p":
        this.togglePresenter();
    }
  }

  /** Mirrors the location into the `slide` and `step` properties; `updated()` shows them. */
  #onRouteChange(): void {
    const { slide, step } = this.state;
    if (!this.slides[slide - 1]) return;
    this.slide = slide;
    this.step = step;
    // Every navigation is applied, even one back to the same step.
    this.#pendingRoute = true;
    this.requestUpdate();
  }

  override render(): unknown {
    return html`
      <div id="slides" part="slides">
        <slot></slot>
      </div>

      <div id="progress" part="progress">
        <slot name="progress">
          ${this.slides.map(
            (_, i) =>
              html`<div class=${i === this.slide - 1 ? "active" : ""}></div>`,
          )}
        </slot>
      </div>

      <div id="notes" part="notes">
        <slot name="notes"></slot>
      </div>

      <div id="timer" part="timer">${this.timerText}</div>

      <div id="forward" @click=${this.forward}>
        <slot name="forward"></slot>
      </div>

      <div id="backward" @click=${this.back}>
        <slot name="backward"></slot>
      </div>
    `;
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("font")) this.style.fontFamily = this.font ?? "";
    const current = this.slides[this.slide - 1];
    if (!current || (!this.#pendingRoute && this.#shownSlide === undefined)) {
      // Nothing is shown before #init has routed for the first time.
      return;
    }
    const routed = this.#pendingRoute;
    this.#pendingRoute = false;
    const slideChanged = this.#shownSlide !== this.slide;
    if (routed && slideChanged) {
      this.#showSlide(this.#shownSlide);
      this.#shownSlide = this.slide;
    }
    if (routed) current.step = this.step;
    if (slideChanged || changed.has("presenter")) {
      this.#updateTitle();
      this.#updateNotes();
    }
    if (routed) this.dispatchEvent(new Event("change"));
  }

  /** Marks the slides around the one on screen, so the deck's styles can animate them. */
  #showSlide(previousNumber: number | undefined): void {
    const currentIndex = this.slide - 1;
    const current = this.slides[currentIndex]!;
    const previous =
      previousNumber === undefined
        ? undefined
        : this.slides[previousNumber - 1];

    clearInterval(this.#autoTimer);
    this.#autoTimer = undefined;
    if (current.auto) {
      this.#autoTimer = setInterval(() => {
        const { steps, step } = current;
        current.step = step === steps + 1 ? 1 : step + 1;
      }, current.auto);
    }

    for (const slide of this.slides) {
      if (slide !== current && slide !== previous) {
        slide.removeAttribute("previous");
        slide.removeAttribute("next");
      }
    }
    if (previous) {
      const forward = previousNumber! < this.slide;
      for (const slide of [previous, current]) {
        slide.classList.toggle("animate-forward", forward);
        slide.classList.toggle("animate-backward", !forward);
      }
      previous.removeAttribute("active");
      previous.removeAttribute("next");
      previous.setAttribute("previous", "");
    }
    current.removeAttribute("previous");
    current.removeAttribute("next");
    current.setAttribute("active", "");
    this.slides[currentIndex + 1]?.setAttribute("next", "");
  }

  #updateTitle(): void {
    const name = this.currentSlide?.getAttribute("name");
    document.title = name
      ? `${name} | ${this.#originalTitle}`
      : this.#originalTitle;
  }

  /** Sets the `active` attribute on the notes for the current slide. */
  #updateNotes(): void {
    if (!this.presenter) return;
    const slide = String(this.slide);
    const notes = this.renderRoot.querySelector<HTMLSlotElement>("#notes slot");
    for (const note of notes?.assignedElements() ?? []) {
      note.toggleAttribute("active", note.getAttribute("slide") === slide);
    }
  }

  /** Goes to the next step, or the first step of the next slide. */
  forward(): void {
    const current = this.currentSlide;
    if (!current) return;
    const { slide, step } = this.state;
    if (current.steps && step <= current.steps) {
      this.state = { slide, step: step + 1 };
    } else if (this.nextSlide) {
      this.state = { slide: slide + 1, step: 1 };
    }
  }

  /** Goes to the previous step, or the last step of the previous slide. */
  back(): void {
    const current = this.currentSlide;
    const previous = this.previousSlide;
    if (!current) return;
    const { slide, step } = this.state;
    if (current.steps && step > 1) {
      this.state = { slide, step: step - 1 };
    } else if (previous) {
      this.state = { slide: slide - 1, step: previous.steps + 1 };
    }
  }

  togglePresenter(): void {
    this.presenter = !this.presenter;
    changeLocation({ search: this.presenter ? "?presenter" : "" });
  }

  toggleTimer(): void {
    if (this.#timerInterval) {
      clearInterval(this.#timerInterval);
      this.#timerInterval = undefined;
      this.timerText = "";
    } else {
      this.timerText = formatElapsed(0);
      const begin = Date.now();
      this.#timerInterval = setInterval(() => {
        this.timerText = formatElapsed(Date.now() - begin);
      }, 1000);
    }
  }
}

declare global {
  interface WindowEventMap {
    "location-changed": Event;
  }
}
