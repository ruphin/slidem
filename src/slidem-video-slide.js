import { html } from '../@gluon/gluon/gluon.js';
import { SlidemSlideBase } from './slidem-slide-base.js';

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(`
  :host {
    background: black;
    color: white;
  }

  video {
    width: 100%;
    max-height: 100%;
    max-width: 100%;
  }
`);

export class SlidemVideoSlide extends SlidemSlideBase {
  static is = 'slidem-video-slide';

  get template() {
    return html`
      ${super.template}
    `;
  }

  content = html`
    <video controls id="video"></video>
  `;

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, styleSheet];
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
