import {
  GluonElement,
  type PropertyDeclarations,
  type PropertyValues,
  type Styles,
  css,
  html,
} from "@gluon/gluon";

const DEFAULT_AUTO_INTERVAL = 5000;
const DEFAULT_CONTENT_WIDTH = 1760;
const DEFAULT_CONTENT_HEIGHT = 990;

/** The `auto` attribute: present without a value means the default interval. */
const autoConverter = {
  fromAttribute: (value: string | null): number | false =>
    value === null ? false : parseInt(value, 10) || DEFAULT_AUTO_INTERVAL,
  toAttribute: (value: unknown): string | null =>
    typeof value === "number" && !Number.isNaN(value) ? String(value) : null,
};

/**
 * Behaviour shared by every slide: a scaled content box, `reveal` steps and
 * the `auto` timer. Pure class with no registration side effect; it is the
 * base for `SlidemSlide` and `SlidemVideoSlide`, and for custom slide types.
 */
export class SlidemSlideBase extends GluonElement {
  static override styles: Styles = css`
    :host {
      display: flex;
      flex-direction: row;
      overflow: hidden;
      align-items: center;
      background: var(--background, white);
      background-size: cover;
      background-position: center;
    }

    :host([in="zoom"]) #content,
    :host([out="zoom"]) #content {
      animation-duration: 0.4s;
      animation-fill-mode: both;
      animation-timing-function: ease-in-out;
    }

    :host([in="zoom"][active].animate-forward) #content {
      animation-name: zoom-in;
    }

    :host([in="zoom"][previous].animate-backward) #content {
      animation-name: zoom-out;
    }

    :host([out="zoom"][previous].animate-forward) #content {
      animation-name: zoom-out;
    }

    :host([out="zoom"][active].animate-backward) #content {
      animation-name: zoom-in;
    }

    #container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    #content {
      width: var(--slidem-content-width, 1760px);
      max-height: var(--slidem-content-height, 990px);
      flex-shrink: 0;
    }

    :host(:not([center])) #content {
      height: var(--slidem-content-height, 990px);
    }

    @keyframes zoom-in {
      from {
        opacity: 0;
        scale: 0;
      }
      to {
        opacity: 1;
        scale: var(--slidem-content-scale, 1);
      }
    }

    @keyframes zoom-out {
      from {
        opacity: 1;
        scale: var(--slidem-content-scale, 1);
      }
      to {
        opacity: 0;
        scale: 0;
      }
    }
  `;

  static override properties: PropertyDeclarations = {
    auto: { attribute: true, reflect: true, converter: autoConverter },
    step: { type: Number, attribute: true, reflect: true },
    steps: { type: Number },
    active: { type: Boolean, attribute: true, reflect: true },
    previous: { type: Boolean, attribute: true, reflect: true },
    next: { type: Boolean, attribute: true, reflect: true },
    contentScale: { type: Number },
  };

  /**
   * Milliseconds between automatic step advances, or `false` when the slide
   * does not advance by itself. Reflects the `auto` attribute.
   */
  auto: number | false = false;

  /** Number of `reveal` steps on this slide, excluding the initial state. */
  steps = 0;

  /** Whether this is the slide on screen. The deck sets it, as the `active` attribute. */
  active = false;

  /** Whether this slide was on screen before the active one. */
  previous = false;

  /** Whether this slide comes after the active one. */
  next = false;

  /** The scale that fits the content box into the window. */
  contentScale = 1;

  #step = 1;
  #stepElements: Element[] = [];

  /** The current 1-based step, clamped to one past the last reveal. Reflects the `step` attribute. */
  get step(): number {
    return this.#step;
  }
  set step(step: number) {
    this.#step = Math.max(1, Math.min(Number(step) || 1, this.steps + 1));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.#resizeContent(), 200);
      },
      { signal: this.disconnectSignal },
    );
    this.defineSteps(this.querySelectorAll("[reveal]"));
  }

  /**
   * Imperatively defines the list of step elements for this slide. Slides
   * collect their light DOM `[reveal]` children on connect; call this when
   * the steps live elsewhere, for example in a declarative shadow root:
   *
   * ```ts
   * class DeclarativeShadowSlide extends SlidemSlideBase {
   *   override connectedCallback() {
   *     super.connectedCallback();
   *     this.defineSteps(this.shadowRoot!.querySelectorAll("[reveal]"));
   *   }
   * }
   * ```
   */
  defineSteps(nodes: Iterable<Element> | null | undefined): void {
    this.#stepElements = Array.from(nodes ?? []);
    this.steps = this.#stepElements.length;
    this.#resizeContent();
    this.#stepElements.forEach((element, i) =>
      element.setAttribute("step", String(i + 2)),
    );
    this.#stepElements[0]?.previousElementSibling?.setAttribute("step", "1");
    this.#markSteps();
  }

  override render(): unknown {
    return html`
      <div id="container">
        <div id="content" part="content" style=${`scale: ${this.contentScale}`}>
          ${this.renderContent()}
        </div>
      </div>
    `;
  }

  /** What goes inside the content box. The slotted light DOM by default; override it in a custom slide. */
  protected renderContent(): unknown {
    return html`<slot></slot>`;
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("step") || changed.has("steps")) {
      // The step may have been set before the steps were known.
      this.step = this.#step;
      this.#markSteps();
    }
  }

  /** Sets `past` and `current` on the step elements for the current step. */
  #markSteps(): void {
    const step = this.#step;
    this.querySelector('[step="1"]')?.toggleAttribute("past", step > 1);
    this.#stepElements.forEach((element, i) => {
      const elementStep = i + 2;
      element.toggleAttribute("past", elementStep < step);
      element.toggleAttribute("current", elementStep === step);
    });
  }

  #resizeContent(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const width =
      parseFloat(documentStyle.getPropertyValue("--slidem-content-width")) ||
      DEFAULT_CONTENT_WIDTH;
    const height =
      parseFloat(documentStyle.getPropertyValue("--slidem-content-height")) ||
      DEFAULT_CONTENT_HEIGHT;
    const scale = Math.min(
      1,
      window.innerHeight / 1.09 / height,
      window.innerWidth / 1.09 / width,
    );
    document.documentElement.style.setProperty(
      "--slidem-content-scale",
      String(scale),
    );
    this.contentScale = scale;
  }
}
