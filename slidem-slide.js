import { SlidemSlideBase } from "./slidem-slide-base.js";

const styleText = document.createTextNode(`
  /* SLIDEM BASIC SLIDE STYLE */
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
`);

const styleNode = document.createElement("style");
styleNode.appendChild(styleText);
document.head.appendChild(styleNode);

export class SlidemSlide extends SlidemSlideBase {
  constructor() {
    super();
    this.backgroundOpacity = 1;
  }
  static get properties() {
    return {
      ...super.properties,
      background: String,
      backgroundOpacity: { type: Number, attribute: "background-opacity" },
      active: Boolean,
      next: Boolean,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    const { background, backgroundOpacity } = this;
    if (background) {
      if (background.match(/^--[a-zA-Z-]*$/)) {
        this.style.background = `var(${background})`;
      } else if (background.match(/^(http|\/|\.)/)) {
        const overlayOpacity = (1 - backgroundOpacity).toFixed(3);
        this.style.backgroundImage = `linear-gradient(rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity})), url(${background})`;
      } else {
        this.style.background = background;
      }
    }

    const layoutNodes = Array.from(this.querySelectorAll("div"));
    layoutNodes.forEach((layoutNode) => {
      if (layoutNode.getAttribute("center") !== null) {
        layoutNode.style.display = "flex";
        layoutNode.style.justifyContent = "center";
        layoutNode.style.alignItems = "center";
      }
    });

    this.textNodes = Array.from(
      this.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, span")
    );

    this.textNodes.forEach((textNode) => {
      if (textNode.getAttribute("font-size") !== null) {
        textNode.style.fontSize = textNode.getAttribute("font-size");
      }
      if (textNode.getAttribute("bold") !== null) {
        textNode.style.fontWeight = "bold";
      }
      if (textNode.getAttribute("underline") !== null) {
        textNode.style.textDecoration = "underline";
      }
      if (textNode.getAttribute("italic") !== null) {
        textNode.style.fontStyle = "italic";
      }
      if (textNode.getAttribute("uppercase") !== null) {
        textNode.style.textTransform = "uppercase";
      }
      if (textNode.getAttribute("center") !== null) {
        textNode.style.textAlign = "center";
      }
      if (textNode.getAttribute("line-height") !== null) {
        textNode.style.lineHeight = textNode.getAttribute("line-height");
      }
      const color = textNode.getAttribute("color");
      if (color !== null) {
        if (color.match(/^--[a-zA-Z-]*$/)) {
          textNode.style.color = `var(${color})`;
        } else {
          textNode.style.color = color;
        }
      }
    });
  }

  updated() {
    requestAnimationFrame(() => {
      const content = this.shadowRoot.querySelector("#content");
      const refWidth = content ? content.clientWidth : this.clientWidth;
      if (refWidth) {
        this.textNodes.forEach((textNode) => {
          if (textNode.getAttribute("fit") !== null) {
            textNode.style.display = "table";
            textNode.style.whiteSpace = "nowrap";
            const refFontSize = parseFloat(
              window
                .getComputedStyle(textNode, null)
                .getPropertyValue("font-size")
            );
            textNode.style.fontSize = `${Math.floor(
              (refFontSize * refWidth) / textNode.clientWidth
            )}px`;
          }
        });
      }
    });
  }
}

customElements.define("slidem-slide", SlidemSlide);
