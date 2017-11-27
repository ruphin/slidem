import { GluonElement, html } from '../gluonjs/gluon.js';
import { SlidemSlideBase } from './slidem-slide-base.js';

export class SlidemVideoSlide extends SlidemSlideBase {
  get template() {
    this.content = html`
      <video controls id="video"></video>
    `;

    return html`
      <style>
        :host {
          background: black;
          color: white;
        }

        video {
          width: 100%;
          max-height: 100%;
          max-width: 100%;
        }
      </style>
      ${super.template}
    `;
  }
  connectedCallback() {
    super.connectedCallback();
    this.$.video.src = this.getAttribute('video');
    this.$.video.muted = this.getAttribute('muted') !== null;
  }

  static get observedAttributes() {
    const attrs = super.observedAttributes || [];
    Array.prototype.push.apply(attrs, ['active']);
    return attrs;
  }
  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(attr, oldVal, newVal);
    if (attr === 'active') {
      if (newVal !== null) {
        this.$.video.currentTime = 0;
        this.$.video.play();
      } else {
        this.$.video.pause();
      }
    }
  }
}

customElements.define(SlidemVideoSlide.is, SlidemVideoSlide);
