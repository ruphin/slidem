import { LitElement, css, html } from "lit";

export class SlidemSlideBase extends LitElement {
  static get properties() {
    return {
      fullscreen: Boolean,
    };
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: row;
        overflow: hidden;
        align-items: center;
        background-size: cover;
        background-position: center;
      }

      :host([zoom-in]) #content,
      :host([zoom-out]) #content {
        animation-duration: 0.4s;
        animation-fill-mode: both;
        animation-timing-function: ease-in-out;
      }

      @keyframes zoom-in {
        from {
          opacity: 0;
          transform: scale(0);
        }
        to {
          opacity: 1;
          transform: scale(var(--slidem-content-scale, 1));
        }
      }

      @keyframes zoom-out {
        from {
          opacity: 1;
          transform: scale(var(--slidem-content-scale, 1));
        }
        to {
          opacity: 0;
          transform: scale(0);
        }
      }

      :host([zoom-in][active].animate-forward) #content {
        animation-name: zoom-in;
      }

      :host([zoom-in][previous].animate-backward) #content {
        animation-name: zoom-out;
      }

      :host([zoom-out][previous].animate-forward) #content {
        animation-name: zoom-out;
      }

      :host([zoom-out][active].animate-backward) #content {
        animation-name: zoom-in;
      }

      #iefix {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      #content {
        width: var(--slidem-content-width, 1760px);
        max-height: var(--slidem-content-height, 990px);
        overflow: hidden;
        flex-shrink: 0;
      }

      :host(:not([center])) #content {
        height: var(--slidem-content-height, 990px);
      }
    `;
  }

  render() {
    return this.fullscreen || this.constructor.fullscreen
      ? this.content
        ? this.content()
        : html`<slot id="slot"></slot>`
      : html`
          <div id="iefix" part="container">
            <div id="content" part="content">
              ${this.content ? this.content() : html`<slot id="slot"></slot>`}
            </div>
          </div>
        `;
  }

  constructor() {
    super();
    this._stepNodes = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._stepNodes = [
      ...this.querySelectorAll("[reveal]"),
      ...this.shadowRoot.querySelectorAll("[reveal]"),
    ];
    this._resizeContentContainer();
    let resizeTimeout;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this._resizeContentContainer();
      }, 200);
    });
  }

  set step(newStep) {
    this._step = Math.min(newStep, this.steps + 1);
    this._stepNodes.forEach((stepNode, i) => {
      if (i < newStep - 1) {
        stepNode.style.opacity = 1;
      } else {
        stepNode.style.opacity = 0;
      }
    });
  }

  get step() {
    return this._step;
  }

  get steps() {
    return this._stepNodes.length;
  }

  _resizeContentContainer() {
    requestAnimationFrame(() => {
      const documentStyle = window.getComputedStyle(document.documentElement);
      const width = Number(
        (
          documentStyle.getPropertyValue("--slidem-content-width") || "1760px"
        ).slice(0, -2)
      );
      const height = Number(
        (
          documentStyle.getPropertyValue("--slidem-content-height") || "990px"
        ).slice(0, -2)
      );
      const scale = Math.min(
        window.innerHeight / 1.09 / height,
        window.innerWidth / 1.09 / width,
        1
      );

      const contentContainer = this.shadowRoot.querySelector("#content");
      if (contentContainer) {
        contentContainer.style.transform = `scale(${scale})`;
      }
      document.documentElement.style.setProperty(
        "--slidem-content-scale",
        scale
      );
    });
  }
}
