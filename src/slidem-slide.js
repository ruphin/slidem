import { GluonElement, html } from '../gluonjs/gluon.js';
import { SlidemSlideBase } from './slidem-slide-base.js';

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

const styleNode = document.createElement('style');
styleNode.appendChild(styleText);
document.head.appendChild(styleNode);

export class SlidemSlide extends SlidemSlideBase {
  connectedCallback() {
    super.connectedCallback();
    const background = this.getAttribute('background');
    if (background) {
      if (background.match(/^--[a-zA-Z-]*$/)) {
        this.style.background = `var(${background})`;
      } else if (background.match(/^(http|\/|\.)/)) {
        let image = `url(${background})`;
        const darken = this.getAttribute('darken-background');
        if (darken) {
          image = `linear-gradient(rgba(0,0,0,${darken}), rgba(0,0,0,${darken})), ${image}`;
        }
        this.style.backgroundImage = image;
      } else {
        this.style.background = background;
      }
    }

    this.textNodes = Array.from(this.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, span'));
    this.textNodes.forEach(textNode => {
      if (textNode.getAttribute('font-size') !== null) {
        textNode.style.fontSize = textNode.getAttribute('font-size');
      }
      if (textNode.getAttribute('bold') !== null) {
        textNode.style.fontWeight = 'bold';
      }
      if (textNode.getAttribute('underline') !== null) {
        textNode.style.textDecoration = 'underline';
      }
      if (textNode.getAttribute('italic') !== null) {
        textNode.style.fontStyle = 'italic';
      }
      if (textNode.getAttribute('uppercase') !== null) {
        textNode.style.textTransform = 'uppercase';
      }
      if (textNode.getAttribute('center') !== null) {
        textNode.style.textAlign = 'center';
      }
      if (textNode.getAttribute('line-height') !== null) {
        textNode.style.lineHeight = textNode.getAttribute('line-height');
      }
      const color = textNode.getAttribute('color');
      if (color !== null) {
        if (color.match(/^--[a-zA-Z-]*$/)) {
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

  static get observedAttributes() {
    const attrs = super.observedAttributes || [];
    Array.prototype.push.apply(attrs, ['active', 'next']);
    return attrs;
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(attr, oldVal, newVal);
    if (attr === 'active' || attr === 'next') {
      if (newVal !== null) {
        this.__rescale();
      }
    }
  }

  __rescale() {
    requestAnimationFrame(() => {
      this.textNodes.forEach(textNode => {
        if (textNode.getAttribute('fit') !== null) {
          textNode.style.display = 'table';
          textNode.style.whiteSpace = 'nowrap';
          const refFontSize = parseFloat(window.getComputedStyle(textNode, null).getPropertyValue('font-size'));
          const refWidth = this.$.content.clientWidth;
          textNode.style.fontSize = `${Math.floor(refFontSize * refWidth / textNode.clientWidth)}px`;
        }
      });
    });
  }
}

customElements.define(SlidemSlide.is, SlidemSlide);
