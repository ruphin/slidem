import { GluonElement, html } from '../gluonjs/gluon.js';
import { onRouteChange, currentPath, currentHash } from '../gluon-router/gluon-router.js';
import '../gluon-keybinding/gluon-keybinding.js';

const fontNode = document.createElement('link');
fontNode.href = 'https://fonts.googleapis.com/css?family=Open+Sans+Condensed:700';
fontNode.rel = 'stylesheet';
document.head.appendChild(fontNode);

const styleText = document.createTextNode(`
  /* SLIDEM SHARED STYLE */
  slidem-deck slidem-slide {
    font-family: 'Open Sans Condensed', sans-serif;
    font-size: 56px;
    line-height: 1;
  }
  slidem-deck slidem-slide h1,
  slidem-deck slidem-slide h2,
  slidem-deck slidem-slide h3,
  slidem-deck slidem-slide h4,
  slidem-deck slidem-slide h5,
  slidem-deck slidem-slide h6,
  slidem-deck slidem-slide p{
    margin-top: 0px;
    margin-bottom: 0px;
  }
  slidem-deck slidem-slide a {
    color: inherit;
    text-decoration: none;
  }
  slidem-deck slidem-slide slidem-reveal {
    display: inherit;
    opacity: 0;
    transition: opacity 0.2s;
  }
  slidem-deck slidem-slide slidem-reveal[revealed] {
    opacity: 1;
  }
`);

const styleNode = document.createElement('style');
styleNode.appendChild(styleText);
document.head.appendChild(styleNode);

class SlidemDeck extends GluonElement {
  get template() {
    return html`
      <div class="fontLoader">a</div>
      <div class="slides">
        <slot id="slides"></slot>
      </div>
      <div id="progress"></div>
      <div id="forward">
        <gluon-keybinding key="ArrowRight"></gluon-keybinding>
      </div>
      <div id="backward">
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
        }
        .fontLoader {
          position: absolute;
          top: -9999px;
          left: -99999px;
          font-family: 'Open Sans Condensed', sans-serif;
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
        #forward {
          right: 0;
        }
        #backward {
          left: 0;
        }
        #forward, #backward {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 20%;
        }
        #forward:hover, #backward:hover {
          background: rgba(255,255,255,0.1);
        }
      </style>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slides = Array.from(this.getElementsByTagName('slidem-slide'));
    this.slides.forEach(slide => {
      slide._steps = Array.from(slide.getElementsByTagName('slidem-reveal'));
      this.$.progress.appendChild(document.createElement('div'));
    });

    onRouteChange(() => {
      if (this.previousSlide !== undefined) {
        this.slides[this.previousSlide].active = false;
        this.$.progress.children[this.previousSlide].classList.remove('active');
      }

      this.slides[this.currentSlide].active = true;
      this.slides[this.currentSlide].step = this.currentStep + 1;
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
    setTimeout(() => {
      window.dispatchEvent(new Event('location-changed'));
    }, 200);
  }

  get currentSlide() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1] || 1) - 1;
  }
  get currentStep() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2] || 1) - 1;
  }
}

customElements.define(SlidemDeck.is, SlidemDeck);
