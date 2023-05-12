import styleSheet from './slidem-slide-base.css' assert { type: 'css' };
import template from './slidem-slide-base.html' assert { type: 'html-template' };

// https://github.com/evanw/esbuild/issues/2800#issuecomment-1378198088
export class SlidemSlideBase extends HTMLElement {
  static observedAttributes = [
    'auto',
    'step',
  ];

  static #instances = new Set();

  static {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.#instances.forEach(i => i.#resizeContent());
      }, 200);
    });
  }

  #steps;
  steps;

  get auto() {
    if (!this.hasAttribute('auto'))
      return false;
    else
      return parseInt(this.getAttribute('auto')) || 5000;
  }

  set auto(timer) {
    if (!(typeof timer === 'number') || Number.isNaN(timer))
      this.removeAttribute('auto');
    else
      this.setAttribute('auto', timer)
  }

  set step(step) {
    this.setAttribute('step', step);
  }

  get step() {
    return Number(this.getAttribute('step')) || 1;
  }

  get $() {
    return Object.fromEntries(Array.from(this.shadowRoot.querySelectorAll('[id]'), el => [el.id, el]))
  }

  constructor() {
    super();
    if (!this.shadowRoot)
      this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, styleSheet];
  }

  connectedCallback() {
    SlidemSlideBase.#instances.add(this);
    this.defineSteps(this.querySelectorAll('[reveal]'));
  }

  disconnectedCallback() {
    SlidemSlideBase.#instances.delete(this);
  }

  attributeChangedCallback(attr, _, newVal) {
    if (attr === 'step') {
      const step = Number(newVal);
      if (step > this.steps + 1) {
        this.setAttribute('step', this.steps + 1);
        return;
      }
      this.#setStep(step);
    }
  }

  /**
   * Imperatively set the list of steps for this slide
   * @example when the steps are located in the shadow root
   *          ```javascript
   *          class DeclarativeShadowSlide extends SlidemSlideBase {
   *            async connectedCallback() {
   *              super.connectedCallback();
   *              await polyfillDeclarativeShadowDOM(this);
   *              this.defineSteps(this.shadowRoot.querySelectorAll('[reveal]'));
   *            }
   *          }
   *          ```
   */
  defineSteps(nodelist) {
    this.#steps = Array.from(nodelist ?? []);
    this.steps = this.#steps.length;
    this.#resizeContent();
    this.#steps.forEach((step, i) => step.setAttribute('step', i + 2));
    if (this.#steps.length)
      this.#steps[0].previousElementSibling?.setAttribute('step', 1);
  }

  #setStep(step) {
    this.querySelector('[step="1"]')?.toggleAttribute?.('past', step > 1);
    this.#steps?.forEach((el, i) => {
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
