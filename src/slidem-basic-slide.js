import { GluonElement, html } from '../gluonjs/gluon.js';
import { SlidemSlide } from './slidem-slide.js';

const styleText = document.createTextNode(`
  /* SLIDEM BASIC SLIDE STYLE */
  slidem-basic-slide h1,
  slidem-basic-slide h2,
  slidem-basic-slide h3,
  slidem-basic-slide h4,
  slidem-basic-slide h5,
  slidem-basic-slide h6,
  slidem-basic-slide p {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  slidem-basic-slide a {
    color: inherit;
    text-decoration: none;
  }
`);

const styleNode = document.createElement('style');
styleNode.appendChild(styleText);
document.head.appendChild(styleNode);

export class SlidemBasicSlide extends SlidemSlide {
  connectedCallback() {
    super.connectedCallback();
    const background = this.getAttribute('background');
    if (background) {
      if (background.match(/^--[a-zA-Z-]*$/)) {
        this.style.background = `var(${background})`;
      } else if (background.match(/^http/) || background.match(/^\//)) {
        const darken = this.getAttribute('darken-background');
        let image = `url(${background})`;
        if (darken) {
          image = `linear-gradient(rgba(0,0,0,${darken}), rgba(0,0,0,${darken})), ${image}`;
        }
        this.style.backgroundImage = image;
      } else {
        this.style.background = background;
      }
    }

    this.textNodes = Array.from(this.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
    this.textNodes.forEach(textNode => {
      if (textNode.getAttribute('bold') !== null) {
        textNode.style.fontWeight = 'bold';
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

    this.layoutNodes = Array.from(this.getElementsByTagName('div'));
    this.layoutNodes.forEach(layoutNode => {
      if (layoutNode.getAttribute('center') !== null) {
        layoutNode.style.display = 'flex';
        layoutNode.style.justifyContent = 'center';
        layoutNode.style.alignItems = 'center';
      }
    });
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback();
    if (attr === 'active') {
      if (newVal !== null) {
        this.__rescale();
      }
    }
  }

  __rescale() {
    this.textNodes.forEach(textNode => {
      if (textNode.getAttribute('fit') !== null) {
        textNode.style.display = 'table';
        const refFontSize = parseFloat(window.getComputedStyle(textNode, null).getPropertyValue('font-size'));
        const refWidth = this.$.content.clientWidth;
        textNode.style.fontSize = `${Math.floor(refFontSize * refWidth / textNode.clientWidth) - 1}px`;
      }
    });
  }
}
console.log(SlidemBasicSlide.name);
customElements.define(SlidemBasicSlide.is, SlidemBasicSlide);
