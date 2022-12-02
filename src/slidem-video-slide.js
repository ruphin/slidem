import { SlidemSlideBase } from './slidem-slide-base.js';

import shadowStyle from './slidem-video-slide.css' assert { type: 'css' };
import template from './slidem-video-slide.html' assert { type: 'html-template' };

export class SlidemVideoSlide extends SlidemSlideBase {
  static is = 'slidem-video-slide';

  static observedAttributes = [...SlidemSlideBase.observedAttributes, 'active'];

  constructor() {
    super();
    this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, shadowStyle];
    this.$.content.replaceChild(template.content.cloneNode(true), this.$.slot);
    this.$.video.src = this.getAttribute('video');
    this.$.video.muted = this.hasAttribute('muted');
  }

  attributeChangedCallback(attr, _, newVal) {
    super.attributeChangedCallback(attr, _, newVal);
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
