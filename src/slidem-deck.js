import { GluonElement, html } from '../gluonjs/gluon.js';
import { onRouteChange, currentPath, currentHash } from '../gluon-router/gluon-router.js';

import '../fontfaceobserver/fontfaceobserver.standalone.js';
import '../gluon-keybinding/gluon-keybinding.js';

const styleText = document.createTextNode(`
  /* SLIDEM GLOBAL STYLES */
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

  @keyframes slidem-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slidem-fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slidem-slide-in-in {
    from {
      transform: translateX(100vw);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slidem-slide-in-out {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100vw);
    }
  }

  @keyframes slidem-slide-out-in {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100vw);
    }
  }

  @keyframes slidem-slide-out-out {
    from {
      transform: translateX(-100vw);
    }
    to {
      transform: translateX(0);
    }
  }
`);

const styleNode = document.createElement('style');
styleNode.appendChild(styleText);
document.head.appendChild(styleNode);

export class SlidemDeck extends GluonElement {
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
        :host([progress="none"]) #progress {
          display: none;
        }

        ::slotted(*) {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
        }

        ::slotted([active].animate-in) {
          z-index: 2;
        }
        ::slotted([active].animate-out) {
          z-index: 0;
        }
        ::slotted([slide-in]), ::slotted([slide-out]), ::slotted([fade-in]), ::slotted([fade-out]) {
          animation-duration: 0.4s;
          animation-fill-mode: both;
          animation-timing-function: ease-in-out;
        }

        ::slotted([fade-in].animate-forward.animate-in) {
          animation-name: slidem-fade-in;
        }


        ::slotted([fade-in].animate-backward.animate-out) {
          animation-name: slidem-fade-out;
          z-index: 3;
        }

        ::slotted([fade-out].animate-forward.animate-out) {
          animation-name: slidem-fade-out;
          z-index: 3;
        }

        ::slotted([fade-out].animate-backward.animate-in) {
          animation-name: slidem-fade-in;
        }

        ::slotted([slide-in].animate-forward.animate-in) {
          animation-name: slidem-slide-in-in;
        }
        ::slotted([slide-in].animate-backward.animate-out) {
          animation-name: slidem-slide-in-out;
          z-index: 3;
        }

        ::slotted([slide-out].animate-forward.animate-out) {
          animation-name: slidem-slide-out-in;
          z-index: 3;
        }
        ::slotted([slide-out].animate-backward.animate-in) {
          animation-name: slidem-slide-out-out;
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
      this.slides[this.currentSlide].setAttribute('active', '');
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
          this.slides[this.fadeOutSlide].removeAttribute('active');
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
      if (this.slides[this.currentSlide].steps && this.slides[this.currentSlide].step <= this.slides[this.currentSlide].steps) {
        window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide + 1}/step-${this.slides[this.currentSlide].step + 1}`);
        window.dispatchEvent(new Event('location-changed'));
      } else if (this.currentSlide < this.slides.length - 1) {
        window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide + 2}/step-1`);
        window.dispatchEvent(new Event('location-changed'));
      }
    };

    this.$.backward.onclick = () => {
      if (this.slides[this.currentSlide].steps && this.slides[this.currentSlide].step > 1) {
        window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide + 1}/step-${this.slides[this.currentSlide].step - 1}`);
        window.dispatchEvent(new Event('location-changed'));
      } else if (this.currentSlide > 0) {
        if (this.slides[this.currentSlide - 1].steps) {
          window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide}/step-${this.slides[this.currentSlide - 1].steps + 1}`);
        } else {
          window.history.pushState({}, '', `${currentPath()}#slide-${this.currentSlide}/step-1`);
        }
        window.dispatchEvent(new Event('location-changed'));
      }
    };

    let touchX;
    let touchY;
    document.addEventListener(
      'touchstart',
      e => {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      },
      false
    );
    document.addEventListener(
      'touchend',
      e => {
        const xMove = e.changedTouches[0].clientX - touchX;
        const yMove = e.changedTouches[0].clientY - touchY;
        if (Math.abs(xMove) > 60 && Math.abs(xMove) > Math.abs(yMove)) {
          if (xMove < 0) {
            this.$.forward.onclick();
          } else {
            this.$.backward.onclick();
          }
        }
      },
      false
    );

    this.removeAttribute('loading');

    const init = () => {
      window.requestAnimationFrame(() => window.dispatchEvent(new Event('location-changed')));
    };

    const font = this.getAttribute('font');
    if (font) {
      this.style.fontFamily = font;
    }

    Promise.all(
      this.slides
        .filter(slide => slide.fonts)
        .map(slide => slide.fonts)
        .reduce((fonts, slideFonts) => fonts.concat(slideFonts), (font && [font]) || [])
        .map(font => new FontFaceObserver(font).load())
    ).then(init, init);
  }

  get currentSlide() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1] || 1) - 1;
  }
  get currentStep() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2] || 1) - 1;
  }
}

customElements.define(SlidemDeck.is, SlidemDeck);
