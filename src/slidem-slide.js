import { SlidemSlideBase } from './slidem-slide-base.js';

import globalStyle from './slidem-slide-global.css' assert { type: 'css' };

document.adoptedStyleSheets = [...document.adoptedStyleSheets, globalStyle];

export class SlidemSlide extends SlidemSlideBase {
  static is = 'slidem-slide';

  static get observedAttributes() {
    return [...SlidemSlideBase.observedAttributes, 'active', 'next'];
  }

  connectedCallback() {
    super.connectedCallback();
    const background = this.getAttribute('background');
    if (background) {
      if (background.match(/^--/)) {
        this.style.setProperty('--background', `var(${background})`);
      } else if (background.match(/^(http|\/|\.)/)) {
        let image = `url(${background})`;
        const darken = this.getAttribute('darken-background');
        if (darken) {
          image = `linear-gradient(rgba(0,0,0,${darken}), rgba(0,0,0,${darken})), ${image}`;
        }
        this.style.backgroundImage = image;
      } else {
        this.style.setProperty('--background', background);
      }
    }

    this.textNodes = Array.from(this.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, span, em, strong, small'));
    this.textNodes.forEach(textNode => {
      if (textNode.hasAttribute('font-size')) {
        textNode.style.fontSize = textNode.getAttribute('font-size');
      }
      if (textNode.hasAttribute('bold')) {
        textNode.style.fontWeight = 'bold';
      }
      if (textNode.hasAttribute('underline')) {
        textNode.style.textDecoration = 'underline';
      }
      if (textNode.hasAttribute('italic')) {
        textNode.style.fontStyle = 'italic';
      }
      if (textNode.hasAttribute('uppercase')) {
        textNode.style.textTransform = 'uppercase';
      }
      if (textNode.hasAttribute('center')) {
        textNode.style.textAlign = 'center';
      }
      if (textNode.hasAttribute('line-height')) {
        textNode.style.lineHeight = textNode.getAttribute('line-height');
      }
      const color = textNode.getAttribute('color');
      if (color !== null) {
        if (color.match(/^--/)) {
          textNode.style.color = `var(${color})`;
        } else {
          textNode.style.color = color;
        }
      }
    });

    this.layoutNodes = Array.from(this.querySelectorAll('div'));
    this.layoutNodes.forEach(layoutNode => {
      if (layoutNode.getAttribute('center') !== null) {
        layoutNode.style.display = 'flex';
        layoutNode.style.justifyContent = 'center';
        layoutNode.style.alignItems = 'center';
      }
    });
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(attr, oldVal, newVal);
    if (attr === 'active' && newVal != null)
      this.dispatchEvent(new Event('activated'));
    if (attr === 'active' || attr === 'next') {
      if (newVal !== null) {
        this.#rescale();
      }
    }
  }

  #rescale() {
    requestAnimationFrame(() => {
      this.textNodes.forEach(textNode => {
        if (textNode.getAttribute('fit') !== null) {
          textNode.style.display = 'table';
          textNode.style.whiteSpace = 'nowrap';
          const refFontSize = parseFloat(window.getComputedStyle(textNode, null).getPropertyValue('font-size'));
          const refWidth = this.$.content.clientWidth;
          textNode.style.fontSize = `${Math.floor((refFontSize * refWidth) / textNode.clientWidth)}px`;
        }
      });
    });
  }
}

customElements.define(SlidemSlide.is, SlidemSlide);
