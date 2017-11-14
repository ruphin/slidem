import { GluonElement, html } from '../gluonjs/gluon.js';

const slidemStyle = html`
  <style>
    :host {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      display: none;
      overflow: hidden;
      justify-content: center;
      align-items: center;
      background-size: cover;
    }
    :host([active]) {
      display: flex;
    }
    :host([active].animate-in) {
      z-index: 2;
    }
    :host([active].animate-out) {
      z-index: 0;
    }
    :host([slide-in]), :host([slide-out]), :host([zoom]) #content {
      animation-duration: 0.4s;
      animation-fill-mode: both;
      animation-timing-function: ease-in-out;
    }

    @keyframes slide-in-in {
      from {
        transform: translateX(100vw);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes slide-in-out {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(100vw);
      }
    }

    :host([slide-in].animate-forward.animate-in) {
      animation-name: slide-in-in;
    }
    :host([slide-in].animate-backward.animate-out) {
      animation-name: slide-in-out;
      z-index: 3;
    }


    @keyframes slide-out-in {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-100vw);
      }
    }

    @keyframes slide-out-out {
      from {
        transform: translateX(-100vw);
      }
      to {
        transform: translateX(0);
      }
    }

    :host([slide-out].animate-forward.animate-out) {
      animation-name: slide-out-in;
      z-index: 3;
    }
    :host([slide-out].animate-backward.animate-in) {
      animation-name: slide-out-out;
    }

    @keyframes zoom-in {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes zoom-out {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0);
      }
    }

    :host([zoom].animate-in) #content {
      animation-name: zoom-in;
    }
    :host([zoom].animate-out) #content {
      animation-name: zoom-out;
    }

    #content {
      width: 100%;
      max-width: var(--slidem-content-width, 1760px);
      max-height: var(--slidem-content-height, 920px);
    }

    :host(:not([center])) #content {
      height: 100%;
    }
  </style>
`;

export class SlidemSlide extends GluonElement {
  get template() {
    if (this.fullscreen) {
      return html`
        ${slidemStyle}
        ${this.content || html`<slot id="slot"></slot>`}
      `;
    } else {
      return html`
        ${slidemStyle}
        <div id="content">
          ${this.content || html`<slot id="slot"></slot>`}
        </div>
      `;
    }
  }
  connectedCallback() {
    super.connectedCallback();
    this.reveals = Array.from(this.querySelectorAll('[reveal]'));
  }
  static get observedAttributes() {
    return ['step', 'active'];
  }
  attributeChangedCallback(attr, oldVal, newVal) {
    if (attr === 'step') {
      const step = Number(newVal);
      if (step > this.reveals.length + 1) {
        this.setAttribute('step', this.reveals.length + 1);
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

  set active(active) {
    if (active) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }
  get active() {
    return this.getAttribute('active') !== null;
  }

  __setStep(step) {
    this.reveals.forEach((reveal, i) => {
      if (i < step - 1) {
        reveal.style.opacity = 1;
      } else {
        reveal.style.opacity = 0;
      }
    });
  }
}

customElements.define(SlidemSlide.is, SlidemSlide);
