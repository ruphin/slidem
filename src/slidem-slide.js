import { GluonElement, html } from '../gluonjs/gluon.js';

class SlidemSlide extends GluonElement {
  get template() {
    return html`
      <div id="content"><slot id="slot"></slot></div>
      <style>
        :host(:not([active])) {
          display: none;
        }
        :host {
          display: flex;
          overflow: hidden;
          height: 100%;
          width: 100%;
          justify-content: center;
          align-items: center;
          background-size: cover;
        }
        #content {
          width: 100%;
          max-width: 1080px;
          height: 100%;
          max-height: 760px;
        }
      </style>
    `;
  }
  connectedCallback() {
    super.connectedCallback();
    const background = this.getAttribute('background');
    if (background) {
      if (background.match(/^--[a-zA-Z-]*$/)) {
        this.style.background = `var(${background})`;
      } else if (background.match(/^http/) || background.match(/^\//)) {
        const darken = this.getAttribute('darken-background');
        let image = background;
        if (darken) {
          image = `linear-gradient(rgba(0,0,0,${darken}), rgba(0,0,0,${darken})), url(${image})`;
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

    this.reveals = Array.from(this.getElementsByTagName('slidem-reveal'));
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
    if (attr === 'active') {
      if (newVal !== null) {
        this.__rescale();
      }
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
        reveal.setAttribute('revealed', '');
      } else {
        reveal.removeAttribute('revealed');
      }
    });
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

customElements.define(SlidemSlide.is, SlidemSlide);
