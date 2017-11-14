import { GluonElement, html } from '../gluonjs/gluon.js';
import { onRouteChange, currentPath, currentHash } from '../gluon-router/gluon-router.js';

import '../fontfaceobserver/fontfaceobserver.standalone.js';
import '../gluon-keybinding/gluon-keybinding.js';

const styleText = document.createTextNode(`
  /* SLIDEM SHARED STYLE */
  body {
    margin: 0;
  }

  [reveal] {
    opacity: 0;
    transition: opacity 0.2s;
  }

  slidem-deck > *:not([active]) {
    display: none;
  }
`);

const styleNode = document.createElement('style');
styleNode.appendChild(styleText);
document.head.appendChild(styleNode);

class SlidemDeck extends GluonElement {
  get template() {
    return html`
      <div class="slides">
        <slot id="slides"></slot>
      </div>
      <div id="progress"></div>
      <div id="forward">
        <gluon-keybinding key="PageDown"></gluon-keybinding>
        <gluon-keybinding key="ArrowRight"></gluon-keybinding>
      </div>
      <div id="backward">
        <gluon-keybinding key="PageUp"></gluon-keybinding>
        <gluon-keybinding key="ArrowLeft"></gluon-keybinding>
      </div>
      <style>
        :host {
          display: block;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          font-family: 'sans-serif';
          font-size: 56px;
          line-height: 1;
        }
        .slides {
          height: 100%;
          width: 100%;
        }
        #progress {
          position: absolute;
          bottom: 0px;
          left: 0;
          right: 0;
          height: 50px;
          text-align: center;
          display: flex;
          flex-flow: row;
          justify-content: center;
          z-index: 10;
        }
        #progress div {
          height: 8px;
          width: 8px;
          border-radius: 50%;
          border: 2px solid white;
          margin-left: 6px;
          margin-right: 6px;
          background: transparent;
          transition: background 0.2s;
        }
        #progress div.active {
          background: white;
        }
      </style>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slides = Array.from(this.children);
    this.slides.forEach(slide => {
      this.$.progress.appendChild(document.createElement('div'));
    });

    onRouteChange(() => {
      this.slides[this.currentSlide].step = this.currentStep + 1;
      this.slides[this.currentSlide].active = true;
      this.slides[this.currentSlide].classList.add('animate-in');

      if (this.previousSlide === this.currentSlide) {
        return;
      }
      if (this.previousSlide !== undefined) {
        if (this.previousSlide < this.currentSlide) {
          this.slides[this.previousSlide].classList.add('animate-forward');
          this.slides[this.currentSlide].classList.add('animate-forward');
          this.slides[this.previousSlide].classList.remove('animate-backward');
          this.slides[this.currentSlide].classList.remove('animate-backward');
        } else {
          this.slides[this.previousSlide].classList.add('animate-backward');
          this.slides[this.currentSlide].classList.add('animate-backward');
          this.slides[this.previousSlide].classList.remove('animate-forward');
          this.slides[this.currentSlide].classList.remove('animate-forward');
        }
      }
      if (this.fadeOutSlide !== undefined) {
        this.slides[this.fadeOutSlide].classList.remove('animate-out');
        if (this.fadeOutSlide !== this.currentSlide) {
          this.slides[this.fadeOutSlide].active = false;
        }
      }

      if (this.previousSlide !== undefined) {
        this.slides[this.previousSlide].classList.remove('animate-in');
        this.slides[this.previousSlide].classList.add('animate-out');
        this.$.progress.children[this.previousSlide].classList.remove('active');
        this.fadeOutSlide = this.previousSlide;
      }

      this.$.progress.children[this.currentSlide].classList.add('active');

      this.previousSlide = this.currentSlide;
    });

    this.$.forward.onclick = () => {
      if (this.slides[this.currentSlide].step <= this.slides[this.currentSlide].reveals.length) {
        window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide + 1}/step-${this.slides[this.currentSlide].step + 1}`);
        window.dispatchEvent(new Event('location-changed'));
      } else if (this.currentSlide < this.slides.length - 1) {
        window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide + 2}/step-1`);
        window.dispatchEvent(new Event('location-changed'));
      }
    };

    this.$.backward.onclick = () => {
      if (this.slides[this.currentSlide].step > 1) {
        window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide + 1}/step-${this.slides[this.currentSlide].step - 1}`);
        window.dispatchEvent(new Event('location-changed'));
      } else if (this.currentSlide > 0) {
        window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide}/step-${this.slides[this.currentSlide - 1].reveals.length + 1}`);
        window.dispatchEvent(new Event('location-changed'));
      }
    };

    this.removeAttribute('loading');

    window.addEventListener('resize', () => {
      console.log('resize!');
    });

    const init = () => {
      window.dispatchEvent(new Event('location-changed'));
    };

    const font = this.getAttribute('font');
    if (font) {
      this.style.fontFamily = font;
      new FontFaceObserver(font).load().then(init, init);
    } else {
      init();
    }
  }

  get currentSlide() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1] || 1) - 1;
  }
  get currentStep() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2] || 1) - 1;
  }
}

customElements.define(SlidemDeck.is, SlidemDeck);
