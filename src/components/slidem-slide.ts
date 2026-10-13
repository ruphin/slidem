import { type PropertyDeclarations, type PropertyValues } from "@gluon/gluon";
import { fontsReady } from "../lib/fonts.js";
import { SlidemSlideBase } from "./slidem-slide-base.js";

const CONTENT_SELECTOR =
  "h1, h2, h3, h4, h5, h6, p, li, span, em, strong, small";

/**
 * The standard slide. Adds the `background` attribute and the inline styling
 * attributes (`fit`, `uppercase`, `color`, ...) on its content. Pure class
 * with no registration side effect: import "slidem/elements/slidem-slide" to
 * register it as <slidem-slide>, or extend it for a custom slide type.
 */
export class SlidemSlide extends SlidemSlideBase {
  static override properties: PropertyDeclarations = {
    background: { attribute: true },
    darkenBackground: { attribute: true },
  };

  /** A CSS colour, a `--custom-property` name, or the URL of an image. Reflects the `background` attribute. */
  background: string | null = null;

  /** The opacity of a black overlay on a background image. Reflects the `darken-background` attribute. */
  darkenBackground: string | null = null;

  get #contentNodes(): NodeListOf<HTMLElement> {
    return this.querySelectorAll<HTMLElement>(CONTENT_SELECTOR);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    for (const node of this.#contentNodes) this.#styleContentNode(node);
    for (const node of this.querySelectorAll<HTMLElement>("div")) {
      this.#styleLayoutNode(node);
    }
  }

  override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (changed.has("background") || changed.has("darkenBackground")) {
      this.#styleBackground();
    }
    if (changed.has("active") && this.active) {
      this.dispatchEvent(new Event("activated"));
    }
    if (changed.has("active") || changed.has("next")) void this.#rescale();
  }

  #styleBackground(): void {
    const background = this.background;
    if (!background) return;
    if (background.startsWith("--")) {
      this.style.setProperty("background", `var(${background})`);
    } else if (/^(http|\/|\.)/.test(background)) {
      let image = `url(${background})`;
      const darken = this.darkenBackground;
      if (darken) {
        image = `linear-gradient(rgba(0,0,0,${darken}), rgba(0,0,0,${darken})), ${image}`;
      }
      this.style.backgroundImage = image;
    } else {
      this.style.setProperty("background", background);
    }
  }

  #styleContentNode(node: HTMLElement): void {
    const fontSize = node.getAttribute("font-size");
    if (fontSize !== null) node.style.fontSize = fontSize;
    if (node.hasAttribute("bold")) node.style.fontWeight = "bold";
    if (node.hasAttribute("underline")) node.style.textDecoration = "underline";
    if (node.hasAttribute("italic")) node.style.fontStyle = "italic";
    if (node.hasAttribute("uppercase")) node.style.textTransform = "uppercase";
    if (node.hasAttribute("center")) node.style.textAlign = "center";
    const lineHeight = node.getAttribute("line-height");
    if (lineHeight !== null) node.style.lineHeight = lineHeight;
    const color = node.getAttribute("color");
    if (color !== null) {
      node.style.color = color.startsWith("--") ? `var(${color})` : color;
    }
  }

  #styleLayoutNode(node: HTMLElement): void {
    if (node.hasAttribute("center")) {
      node.style.display = "flex";
      node.style.justifyContent = "center";
      node.style.alignItems = "center";
    }
  }

  /** Grows every `fit` element until it spans the content width. */
  async #rescale(): Promise<void> {
    await fontsReady();
    const contentWidth =
      this.renderRoot.querySelector("#content")?.clientWidth ?? 0;
    for (const node of this.#contentNodes) {
      if (!node.hasAttribute("fit")) continue;
      node.style.display = "table";
      node.style.whiteSpace = "nowrap";
      const fontSize = parseFloat(getComputedStyle(node).fontSize);
      if (!contentWidth || !node.clientWidth || !fontSize) continue;
      node.style.fontSize = `${Math.floor((fontSize * contentWidth) / node.clientWidth)}px`;
    }
  }
}
