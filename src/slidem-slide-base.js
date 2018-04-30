import { GluonElement, html } from '../gluonjs/gluon.js';

const styleText = document.createTextNode(`
  /* SLIDEM SLIDE GLOBAL STYLES */

  [reveal] {
    opacity: 0;
    transition: opacity 0.2s;
  }
`);

const styleNode = document.createElement('style');
styleNode.appendChild(styleText);
document.head.appendChild(styleNode);

const slidemStyle = html`
  <style>
    :host {
      overflow: hidden;
      justify-content: center;
      align-items: center;
      background-size: cover;
      background-position: center;
      display: flex;
    }

    :host([zoom-in]) #content, :host([zoom-out]) #content {
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

    #content {
      width: var(--slidem-content-width, 1760px);
      max-height: var(--slidem-content-height, 990px);
      flex-shrink: 0;
    }

    :host(:not([center])) #content {
      height: var(--slidem-content-height, 990px);
    }
  </style>
`;

export class SlidemSlideBase extends GluonElement {
  get template() {
    if (this.getAttribute('fullscreen') !== null || this.constructor.fullscreen) {
      return html`
        ${slidemStyle}
        ${(this.constructor.name !== 'SlidemSlide' && this.content) || html`<slot id="slot"></slot>`}
      `;
    } else {
      return html`
        ${slidemStyle}
        <div id="content">
          ${(this.constructor.name !== 'SlidemSlide' && this.content) || html`<slot id="slot"></slot>`}
        </div>
      `;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._steps = Array.from(this.querySelectorAll('[reveal]'));
    this.steps = this._steps.length;
    this.__resizeContent();
    let resizeTimeout;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.__resizeContent();
      }, 200);
    });
  }

  static get observedAttributes() {
    return ['step'];
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (attr === 'step') {
      const step = Number(newVal);
      if (step > this.steps + 1) {
        this.setAttribute('step', this.steps + 1);
        return;
      }
      this.__setStep(step);
    }
  }

  set step(step) {
    this.setAttribute('step', step);
  }

  get step() {
    return Number(this.getAttribute('step')) || 1;
  }

  __setStep(newStep) {
    this._steps.forEach((step, i) => {
      if (i < newStep - 1) {
        step.style.opacity = 1;
      } else {
        step.style.opacity = 0;
      }
    });
  }

  __resizeContent() {
    const width = Number((window.getComputedStyle(document.documentElement).getPropertyValue('--slidem-content-width') || '1760px').slice(0, -2));
    const height = Number((window.getComputedStyle(document.documentElement).getPropertyValue('--slidem-content-height') || '990px').slice(0, -2));
    const scale = Math.min(window.innerHeight / height, window.innerWidth / 1.1 / width);
    if (scale < 1) {
      document.documentElement.style.setProperty('--slidem-content-scale', scale);
      this.$.content && (this.$.content.style.transform = `scale(${scale})`);
    } else {
      document.documentElement.style.setProperty('--slidem-content-scale', 1);
      this.$.content && (this.$.content.style.transform = `scale(1)`);
    }
  }
}
