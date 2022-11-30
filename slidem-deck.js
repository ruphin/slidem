import { LitElement, css, html, render } from "lit";
import {
  router,
  ROUTE_CHANGED,
  currentPath,
  currentQuery,
  currentHash,
  navigate,
  interceptNavigation,
} from "@ruphin/spa-router";

import "fontfaceobserver/fontfaceobserver.standalone.js";
import "@ruphin/key-bind";

window.thingy = render;
window.other = html;

const keyframeStyles = css`
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
`;
const globalStyles = css`
  /* SLIDEM GLOBAL STYLES */
  body {
    margin: 0;
  }

  slidem-deck {
    display: none;
  }

  slidem-deck[loaded] {
    display: block;
  }

  [reveal] {
    opacity: 0;
    transition: opacity 0.2s;
  }
  ${keyframeStyles}
`;

const styleContainer = document.createDocumentFragment();
render(
  html`<style>
    ${globalStyles.cssText}
  </style>`,
  styleContainer
);
document.head.appendChild(styleContainer);

interceptNavigation();

export class SlidemDeck extends LitElement {
  static get styles() {
    return [
      css`
        :host {
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          font-family: "sans-serif";
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
          content: "";
          top: calc(25% - 20px);
          right: calc(45% - 20px);
          bottom: calc(25% - 20px);
          left: calc(5% - 20px);
          border: 2px solid white;
        }
        /* White box around next slide */
        :host([presenter])::after {
          display: block;
          position: absolute;
          content: "";
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
      `,
      keyframeStyles,
    ];
  }

  static get properties() {
    return {
      _timer: { attribute: false },
    };
  }

  render() {
    return html`
      <div class="slides">
        <slot id="slides"></slot>
      </div>
      <div id="progress"></div>
      <div id="timer">${this._timer || ""}</div>
      <key-bind @click=${this.toggleTimer} key="t"></key-bind>
      <key-bind @click=${this.togglePresenter} key="p"></key-bind>
      <div @click=${this.goForward}>
        <key-bind key="PageDown"></key-bind>
        <key-bind key="ArrowRight"></key-bind>
        <key-bind key="Right"></key-bind>
        <slot name="forward"></slot>
      </div>
      <div @click=${this.goBackward}>
        <key-bind key="PageUp"></key-bind>
        <key-bind key="ArrowLeft"></key-bind>
        <key-bind key="Left"></key-bind>
        <slot name="backward"></slot>
      </div>
    `;
  }

  get presenter() {
    return this.hasAttribute("presenter");
  }

  set presenter(value) {
    if (value) {
      this.setAttribute("presenter", "");
    } else {
      this.removeAttribute("presenter");
    }
  }

  toggleTimer() {
    if (this._timer) {
      this._timer = undefined;
      clearInterval(this._timerInterval);
    } else {
      let startTime = Date.now();
      this._timer = "00:00";
      this._timerInterval = setInterval(
        () => (this._timer = formatTime(startTime)),
        1000
      );
    }
  }

  togglePresenter() {
    this.presenter = !this.presenter;
    changeRoute({
      query: this.presenter ? "presenter" : "",
      hash: currentHash(),
    });
  }

  goForward() {
    const { slides, currentSlide } = this;
    if (
      slides[currentSlide].steps &&
      slides[currentSlide].step <= slides[currentSlide].steps
    ) {
      changeRoute({
        hash: `slide-${currentSlide + 1}/step-${slides[currentSlide].step + 1}`,
      });
    } else if (currentSlide < slides.length - 1) {
      changeRoute({
        hash: `slide-${currentSlide + 2}/step-1`,
      });
    }
  }

  goBackward() {
    const { slides, currentSlide } = this;
    if (slides[currentSlide].steps && slides[currentSlide].step > 1) {
      changeRoute({
        hash: `slide-${currentSlide + 1}/step-${slides[currentSlide].step - 1}`,
      });
    } else if (currentSlide > 0) {
      changeRoute({
        hash: `slide-${currentSlide}/step-${
          (slides[currentSlide - 1].steps || 0) + 1
        }`,
      });
    }
  }

  _animateSlides() {
    this.slides[this.currentSlide].step = this.currentStep + 1;
    this.slides[this.currentSlide].setAttribute("active", "");

    if (this.previousSlide === this.currentSlide) {
      return;
    }

    if (this.previousSlide !== undefined) {
      if (this.previousSlide < this.currentSlide) {
        this.slides[this.previousSlide].classList.add("animate-forward");
        this.slides[this.currentSlide].classList.add("animate-forward");
        this.slides[this.previousSlide].classList.remove("animate-backward");
        this.slides[this.currentSlide].classList.remove("animate-backward");
      } else {
        this.slides[this.previousSlide].classList.add("animate-backward");
        this.slides[this.currentSlide].classList.add("animate-backward");
        this.slides[this.previousSlide].classList.remove("animate-forward");
        this.slides[this.currentSlide].classList.remove("animate-forward");
      }
    }

    if (this.oldNextSlide !== undefined) {
      this.slides[this.oldNextSlide].removeAttribute("next");
    }

    this.nextSlide =
      (this.slides[this.currentSlide + 1] && this.currentSlide + 1) ||
      undefined;
    if (this.nextSlide !== undefined) {
      this.slides[this.nextSlide].setAttribute("next", "");
      this.oldNextSlide = this.nextSlide;
    }

    if (this.oldPreviousSlide !== undefined) {
      this.slides[this.oldPreviousSlide].removeAttribute("previous");
    }

    if (this.previousSlide !== undefined) {
      this.slides[this.previousSlide].removeAttribute("active");
      this.slides[this.previousSlide].setAttribute("previous", "");
      // this.$.progress.children[this.previousSlide].classList.remove("active");
      this.oldPreviousSlide = this.previousSlide;
    }

    // this.$.progress.children[this.currentSlide].classList.add("active");

    this.previousSlide = this.currentSlide;
  }

  connectedCallback() {
    super.connectedCallback();

    // Initialize presenter mode based on the '?presenter' query being present
    this.presenter = currentQuery() === "presenter";

    this.slides = Array.from(this.children).filter(
      (item) => !item.hasAttribute("slot")
    );

    // Create dots for progress bar
    // this.slides.forEach(() => {
    //   this.$.progress.appendChild(document.createElement("div"));
    // });

    this._animateSlides = this._animateSlides.bind(this);
    router.addEventListener(ROUTE_CHANGED, this._animateSlides);

    /**
     * Gesture navigation support system
     *
     * Allows swiping gestures to navigate between slides
     * Listens to the 'touchstart' and 'touchend' events to determine if a swipe occurred
     */
    let touchX;
    let touchY;
    document.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      },
      false
    );
    document.addEventListener(
      "touchend",
      (e) => {
        const xMove = e.changedTouches[0].clientX - touchX;
        const yMove = e.changedTouches[0].clientY - touchY;
        if (Math.abs(xMove) > 60 && Math.abs(xMove) > Math.abs(yMove)) {
          if (xMove < 0) {
            this.goForward();
          } else {
            this.goBackward();
          }
        }
      },
      false
    );

    /**
     * Initialization function
     *
     * Displays the application
     */
    const init = () => {
      this.setAttribute("loaded", "");
      // Trigger the router to display the current page
      this._animateSlides();
    };

    /**
     * Font loading subsystem.
     *
     * It checks the 'font' attribute defined on slidem-deck, and the 'fonts' properties on
     * all children that are custom elements (which could be custom slide elements).
     *
     * It feeds all these fonts to FontFaceObsever, and calls the 'init' function once all fonts
     * are loaded, or after a 2 second timeout.
     */
    const font = this.getAttribute("font");
    if (font) {
      this.style.fontFamily = font;
    }

    // Promise that rejects after two seconds
    let fontLoadingTimeout = new Promise((_, reject) => {
      setTimeout(() => {
        reject();
      }, 2000);
    });

    // Wait until all child elements that are custom elements are registered in the customElements registry, or the timeOut happens
    Promise.race([
      Promise.all(
        this.slides.map(
          (slide) =>
            slide.tagName.includes("-") &&
            customElements.whenDefined(slide.tagName.toLowerCase())
        )
      ),
      fontLoadingTimeout,
    ])
      // Then feed all the 'fonts' defined in those elements and the font in the slidem-deck to FontFaceObserver
      .then(() =>
        Promise.race([
          Promise.all(
            this.slides
              .map((slide) => slide.fonts)
              .filter(Boolean)
              .reduce(
                (fonts, slideFonts) => [...fonts, ...slideFonts],
                font ? [font] : []
              )
              .map((font) => new FontFaceObserver(font).load())
          ),
          fontLoadingTimeout,
        ])
      )
      // Once FontFaceObserver for all fonts is complete or the timeout happens, call init()
      .then(init, () => {
        console.warn("Failed to initialize fonts");
        init();
      });

    /**
     * Shared navigation between browser windows
     *
     * Uses the browser localstorage feature to listen to changes in 'location' on any other open browser window,
     * and matches that location in this instance
     */
    window.addEventListener("storage", (e) => {
      if (e.key === "location") {
        if (currentHash() !== e.newValue) {
          changeRoute({ hash: `${e.newValue}` });
        }
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    router.removeEventListener(ROUTE_CHANGED, this._animateSlides);
  }

  get currentSlide() {
    return (
      (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1] ||
        1) - 1
    );
  }
  get currentStep() {
    return (
      (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2] ||
        1) - 1
    );
  }
}

const changeRoute = ({
  path = currentPath(),
  query = currentQuery(),
  hash = currentHash(),
} = {}) => {
  localStorage.setItem("location", hash || "");
  navigate(`${path}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`);
};

// Returns a string representing elapsed time since 'begin'
const formatTime = (begin) => {
  const time = new Date(Date.now() - begin);
  const pad = (t) => (t < 10 ? `0${t}` : t);
  const hours = time.getUTCHours();
  const minutes = time.getUTCMinutes();
  const seconds = time.getUTCSeconds();
  return `${hours ? `${pad(hours)}:` : ""}${pad(minutes)}:${pad(seconds)}`;
};

customElements.define("slidem-deck", SlidemDeck);
