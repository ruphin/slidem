import { SlidemSlideBase } from './slidem-slide-base.js';

export class SlidemSlide extends SlidemSlideBase {
  static is = 'slidem-slide';

  static observedAttributes = [
    ...SlidemSlideBase.observedAttributes,
    'active',
    'next',
    'background',
  ];

  get #contentNodes() {
    return this.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, span, em, strong, small');
  }

  get #layoutNodes() {
    return this.querySelectorAll('div');
  }

  async connectedCallback() {
    super.connectedCallback();
    for (const node of this.#contentNodes) this.#styleContentNode(node);
    for (const node of this.#layoutNodes) this.#styleLayoutNode(node);
    this.#styleBackground();
    this.#rescale();
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(attr, oldVal, newVal);
    if (attr === 'active' && newVal != null)
      this.dispatchEvent(new Event('activated'));
    if (attr === 'active' || attr === 'next')
      this.#rescale();
    if (attr === 'background')
      this.#styleBackground();
  }

  #styleBackground() {
    const background = this.getAttribute('background');
    if (background) {
      if (background.match(/^--/)) {
        this.style.setProperty('background', `var(${background})`);
      } else if (background.match(/^(http|\/|\.)/)) {
        let image = `url(${background})`;
        const darken = this.getAttribute('darken-background');
        if (darken)
          image = `linear-gradient(rgba(0,0,0,${darken}), rgba(0,0,0,${darken})), ${image}`;
        this.style.backgroundImage = image;
      } else {
        this.style.setProperty('background', background);
      }
    }
  }

  #styleContentNode(node) {
    if (node.hasAttribute('font-size'))   node.style.fontSize =  node.getAttribute('font-size');
    if (node.hasAttribute('bold'))        node.style.fontWeight = 'bold';
    if (node.hasAttribute('underline'))   node.style.textDecoration = 'underline';
    if (node.hasAttribute('italic'))      node.style.fontStyle = 'italic';
    if (node.hasAttribute('uppercase'))   node.style.textTransform = 'uppercase';
    if (node.hasAttribute('center'))      node.style.textAlign = 'center';
    if (node.hasAttribute('line-height')) node.style.lineHeight = node.getAttribute('line-height');
    const color = node.getAttribute('color');
    if (color !== null) {
      if (color.match(/^--/))
        node.style.color = `var(${color})`;
      else
        node.style.color = color;
    }
  }

  #styleLayoutNode(node) {
    if (node.getAttribute('center') !== null) {
      node.style.display = 'flex';
      node.style.justifyContent = 'center';
      node.style.alignItems = 'center';
    }
  }

  async #rescale() {
    await document.fonts.ready;
    for (const node of this.#contentNodes) {
      if (node.hasAttribute('fit')) {
        node.style.display = 'table';
        node.style.whiteSpace = 'nowrap';
        const refFontSize = parseFloat(getComputedStyle(node, null).getPropertyValue('font-size'));
        const refWidth = this.$.content.clientWidth;
        node.style.fontSize = `${Math.floor((refFontSize * refWidth) / node.clientWidth)}px`;
      }
    }
  }
}

customElements.define(SlidemSlide.is, SlidemSlide);
