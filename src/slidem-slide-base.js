import { GluonElement, html } from '../@gluon/gluon/gluon.js';

const globalStyles = new CSSStyleSheet();
globalStyles.replaceSync(`
  /* SLIDEM SLIDE GLOBAL STYLES */

  [reveal] {
    opacity: 0;
    transition: opacity 0.2s;
  }

  [current],
  [past] {
    opacity: 1;
  }
`);

document.adoptedStyleSheets = [...document.adoptedStyleSheets, globalStyles];

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(`
  :host {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    align-items: center;
    background: var(--background);
    background-size: cover;
    background-position: center;
  }

  :host([zoom-in]) #content, :host([zoom-out]) #content {
    animation-duration: 0.4s;
    animation-fill-mode: both;
    animation-timing-function: ease-in-out;
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
    flex-shrink: 0;
  }

  :host(:not([center])) #content {
    height: var(--slidem-content-height, 990px);
  }
`);

export class SlidemSlideBase extends GluonElement {
  get template() {
    if (this.getAttribute('fullscreen') !== null || this.constructor.fullscreen) {
      return html`
        ${(this.constructor.name !== 'SlidemSlide' && this.content) || html`<slot id="slot"></slot>`}
      `;
    } else {
      return html`
        <div id="iefix" part="container">
          <div id="content" part="content">
            ${(this.constructor.name !== 'SlidemSlide' && this.content) || html`<slot id="slot"></slot>`}
          </div>
        </div>
      `;
    }
  }

  #steps;

  connectedCallback() {
    super.connectedCallback();
    this.#steps = Array.from(this.querySelectorAll('[reveal]'));
    this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, styleSheet];
    this.steps = this.#steps.length;
    this.#resizeContent();
    this.#steps.forEach((step, i) => step.setAttribute('step', i + 2));
    if (this.#steps.length)
      this.#steps[0].previousElementSibling?.setAttribute('step', 1);
    let resizeTimeout;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.#resizeContent();
      }, 200);
    });
  }

  static get observedAttributes() {
    return ['auto', 'step'];
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (attr === 'step') {
      const step = Number(newVal);
      if (step > this.steps + 1) {
        this.setAttribute('step', this.steps + 1);
        return;
      }
      this.#setStep(step);
    }
  }

  get auto() {
    if (!this.hasAttribute('auto'))
      return false;
    else
      return parseInt(this.getAttribute('auto')) || 5000;
  }

  set auto(v) {
    if (!(typeof v === 'number') || Number.isNaN(v))
      this.removeAttribute('auto');
    else
      this.setAttribute('auto', v.toString())
  }

  set step(step) {
    this.setAttribute('step', step);
  }

  get step() {
    return Number(this.getAttribute('step')) || 1;
  }

  #setStep(step) {
    this.querySelector('[step="1"]')?.toggleAttribute?.('past', step > 1);
    this.#steps.forEach((el, i) => {
      const elStep = i + 2;
      const past = elStep < step;
      const current = elStep === step;
      el.toggleAttribute('past', past);
      el.toggleAttribute('current', current);
    });
  }

  #resizeContent() {
    const documentStyle = window.getComputedStyle(document.documentElement);
    const width = Number((documentStyle.getPropertyValue('--slidem-content-width') || '1760px').slice(0, -2));
    const height = Number((documentStyle.getPropertyValue('--slidem-content-height') || '990px').slice(0, -2));
    const scale = Math.min(window.innerHeight / 1.09 / height, window.innerWidth / 1.09 / width);
    if (scale < 1) {
      document.documentElement.style.setProperty('--slidem-content-scale', scale);
      this.$.content?.style?.setProperty('scale', scale);
    } else {
      document.documentElement.style.setProperty('--slidem-content-scale', 1);
      this.$.content?.style?.setProperty('scale', 1);
    }
  }
}
