import { GluonElement, html } from '../gluonjs/gluon.js';
import { onRouteChange, currentPath, currentQuery, currentHash } from '../gluon-router/gluon-router.js';

import '../fontfaceobserver/fontfaceobserver.standalone.js';
import { GluonKeybinding } from '../gluon-keybinding/gluon-keybinding.js';

const styleText = document.createTextNode(`
  /* SLIDEM GLOBAL STYLES */
  body {
    margin: 0;
  }


  [reveal] {
    opacity: 0;
    transition: opacity 0.2s;
  }

  /* Keyframes are defined here to patch a scoping bug in Chrome */
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

  @keyframes slidem-slide-in-forward {
    from {
      transform: translateX(100vw);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slidem-slide-in-backward {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100vw);
    }
  }

  @keyframes slidem-slide-out-forward {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100vw);
    }
  }

  @keyframes slidem-slide-out-backward {
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
      <div id="timer"></div>
      <gluon-keybinding id="timerToggle" key="t"></gluon-keybinding>
      <gluon-keybinding id="presenterToggle" key="p"></gluon-keybinding>
      <div id="forward">
        <gluon-keybinding key="PageDown"></gluon-keybinding>
        <gluon-keybinding key="ArrowRight"></gluon-keybinding>
      </div>
      <div id="backward">
        <gluon-keybinding key="PageUp"></gluon-keybinding>
        <gluon-keybinding key="ArrowLeft"></gluon-keybinding>
      </div>
      <style>
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

        @keyframes slidem-slide-in-forward {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slidem-slide-in-backward {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100vw);
          }
        }

        @keyframes slidem-slide-out-forward {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100vw);
          }
        }

        @keyframes slidem-slide-out-backward {
          from {
            transform: translateX(-100vw);
          }
          to {
            transform: translateX(0);
          }
        }
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

        .slides ::slotted(*) {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          animation-duration: 0.4s;
          animation-fill-mode: both;
          animation-timing-function: ease-in-out;
        }

        .slides ::slotted(:not([active]):not([previous]):not([next])) {
          display: none;
        }

        :host(:not([presenter])) .slides ::slotted([next]:not([previous])) {
          display: none;
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
          transition: background 0.2s, transform 0.2s;
        }
        #progress div.active {
          background: white;
          transform: scale(1.3);
        }
        :host([progress="dark"]) #progress div {
          border: 2px solid black;
        }
        :host([progress="dark"]) #progress div.active {
          background: black;
        }
        :host([progress="none"]) #progress {
          display: none;
        }

        #timer {
          display: none;
          position: absolute;
          top: 5%;
          right: 5%;
          color: white;
          font-size: 4vw;
          font-weight: bold;
          font-family: Helvetica, Arial, sans-serif;
        }
        :host([presenter]) #timer {
          display: inline;
        }

        :host([presenter]) {
          background: black;
        }
        /* White box around active slide */
        :host([presenter])::before {
          display: block;
          position: absolute;
          content: '';
          top: calc(25% - 20px);
          right:  calc(45% - 20px);
          bottom:  calc(25% - 20px);
          left:  calc(5% - 20px);
          border: 2px solid white;
        }
        /* White box around next slide */
        :host([presenter])::after {
          display: block;
          position: absolute;
          content: '';
          top: calc(32.5% - 20px);
          right: calc(4.5% - 20px);
          bottom: calc(32.5% - 20px);
          left: calc(60.5% - 20px);
          border: 2px solid white;
        }
        :host([presenter]) .slides ::slotted(*) {
          animation: none !important; /* Block user-configured animations */
        }
        :host([presenter]) .slides ::slotted([previous]:not([next])) {
          display: none;
        }
        :host([presenter]) .slides ::slotted([active]) {
          transform: translate(-20%, 0) scale(0.5) !important; /* Force presenter layout */
        }
        :host([presenter]) .slides ::slotted([next]) {
          transform: translate(28%, 0) scale(0.35) !important; /* Force presenter layout */
        }

        .slides ::slotted([active]) {
          z-index: 2;
        }
        .slides ::slotted([previous]) {
          z-index: 0;
        }
        .slides ::slotted([fade-in][active].animate-forward) {
          animation-name: slidem-fade-in;
        }
        .slides ::slotted([fade-in][previous].animate-backward) {
          animation-name: slidem-fade-out;
          z-index: 3;
        }
        .slides ::slotted([fade-out][active].animate-backward) {
          animation-name: slidem-fade-in;
        }
        .slides ::slotted([fade-out][previous].animate-forward) {
          animation-name: slidem-fade-out;
          z-index: 3;
        }
        .slides ::slotted([slide-in][active].animate-forward) {
          animation-name: slidem-slide-in-forward;
        }
        .slides ::slotted([slide-in][previous].animate-backward) {
          animation-name: slidem-slide-in-backward;
          z-index: 3;
        }
        .slides ::slotted([slide-out][active].animate-backward) {
          animation-name: slidem-slide-out-backward;
        }
        .slides ::slotted([slide-out][previous].animate-forward) {
          animation-name: slidem-slide-out-forward;
          z-index: 3;
        }
      </style>
    `;
  }

  get presenter() {
    return this.getAttribute('presenter') !== null;
  }

  set presenter(value) {
    if (value) {
      this.setAttribute('presenter', '');
    } else {
      this.removeAttribute('presenter');
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.presenter = currentQuery() === 'presenter';
    this.$.presenterToggle.addEventListener('click', () => {
      this.presenter = !this.presenter;
      changeLocation({ query: (this.presenter && 'presenter') || '', hash: currentHash() });
    });

    // Presenter mode timer
    let timerInterval;
    this.$.timerToggle.addEventListener('click', () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
        this.$.timer.innerText = '';
      } else {
        this.$.timer.innerText = '00:00';
        let begin = new Date();
        timerInterval = setInterval(() => (this.$.timer.innerText = __timer(begin)), 1000);
      }
    });

    this.slides = Array.from(this.children);

    // Create dots for progress bar
    this.slides.forEach(slide => {
      this.$.progress.appendChild(document.createElement('div'));
    });

    onRouteChange(() => {
      this.slides[this.currentSlide].step = this.currentStep + 1;
      this.slides[this.currentSlide].setAttribute('active', '');

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

      if (this.oldNextSlide !== undefined) {
        this.slides[this.oldNextSlide].removeAttribute('next');
      }

      this.nextSlide = (this.slides[this.currentSlide + 1] && this.currentSlide + 1) || undefined;
      if (this.nextSlide !== undefined) {
        this.slides[this.nextSlide].setAttribute('next', '');
        this.oldNextSlide = this.nextSlide;
      }

      if (this.oldPreviousSlide !== undefined) {
        this.slides[this.oldPreviousSlide].removeAttribute('previous');
      }

      if (this.previousSlide !== undefined) {
        this.slides[this.previousSlide].removeAttribute('active');
        this.slides[this.previousSlide].setAttribute('previous', '');
        this.$.progress.children[this.previousSlide].classList.remove('active');
        this.oldPreviousSlide = this.previousSlide;
      }

      this.$.progress.children[this.currentSlide].classList.add('active');

      this.previousSlide = this.currentSlide;
    });

    const changeLocation = ({ path = currentPath(), query = currentQuery(), hash = currentHash() } = {}) => {
      path = window.history.pushState({}, '', `${path}${(query && '?' + query) || ''}${(hash && '#' + hash) || ''}`);
      window.dispatchEvent(new Event('location-changed'));
      localStorage.setItem('location', currentHash());
    };

    this.$.forward.onclick = () => {
      if (this.slides[this.currentSlide].steps && this.slides[this.currentSlide].step <= this.slides[this.currentSlide].steps) {
        changeLocation({ hash: `slide-${this.currentSlide + 1}/step-${this.slides[this.currentSlide].step + 1}` });
      } else if (this.currentSlide < this.slides.length - 1) {
        changeLocation({ hash: `slide-${this.currentSlide + 2}/step-1` });
      }
    };

    this.$.backward.onclick = () => {
      if (this.slides[this.currentSlide].steps && this.slides[this.currentSlide].step > 1) {
        changeLocation({ hash: `slide-${this.currentSlide + 1}/step-${this.slides[this.currentSlide].step - 1}` });
      } else if (this.currentSlide > 0) {
        changeLocation({ hash: `slide-${this.currentSlide}/step-${(this.slides[this.currentSlide - 1].steps || 0) + 1}` });
      }
    };

    // Swipe gesture support
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

    // FUOC prevention
    this.removeAttribute('loading');

    // Trigger the router to display the first slide
    const init = () => {
      window.requestAnimationFrame(() => window.dispatchEvent(new Event('location-changed')));
    };

    const font = this.getAttribute('font');
    if (font) {
      this.style.fontFamily = font;
    }

    // Trigger the init after all fonts are loaded or after 3 sec timeout.
    Promise.all(
      this.slides
        .filter(slide => slide.fonts)
        .map(slide => slide.fonts)
        .reduce((fonts, slideFonts) => fonts.concat(slideFonts), (font && [font]) || [])
        .map(font => new FontFaceObserver(font).load())
    ).then(init, init);

    // Shared navigation between browser windows
    window.addEventListener('storage', e => {
      if (e.key === 'location') {
        if (currentHash() !== e.newValue) {
          changeLocation({ hash: `${e.newValue}` });
        }
      }
    });
  }

  get currentSlide() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1] || 1) - 1;
  }
  get currentStep() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2] || 1) - 1;
  }
}

// Returns a string representing elapsed time since 'begin'
const __timer = begin => {
  const time = new Date(new Date() - begin);
  const pad = t => (t < 10 && '0' + t) || t;
  const hours = pad(time.getUTCHours());
  const minutes = pad(time.getUTCMinutes());
  const seconds = pad(time.getUTCSeconds());
  return `${(time.getUTCHours() && hours + ':') || ''}${minutes}:${seconds}`;
};

customElements.define(SlidemDeck.is, SlidemDeck);
