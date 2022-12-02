import globalStyle from './slidem-deck-global.css' assert { type: 'css' };
import shadowStyle from './slidem-deck.css' assert { type: 'css' };
import template from './slidem-deck.html' assert { type: 'html-template' };

document.adoptedStyleSheets = [...document.adoptedStyleSheets, globalStyle];
/**
 * **START**
 * `#`
 * non-capturing group (_optional_):
 *   `slide-`
 *   named capture group 1 `slide`:
 *     **0-9** (_>= 1x_)
 * non-capturing group (_optional_):
 *   `/step-`
 *   named capture group 2 `step`:
 *     Either **0-9** (_>= 1x_) or `Infinity`
 */
const STATE_RE = /^#(?:slide-(?<slide>\d+))?(?:\/step-(?<step>\d+|Infinity))?/;

export class SlidemDeck extends HTMLElement {
  static is = 'slidem-deck';

  static #instances = new Set();

  // Returns a string representing elapsed time since 'begin'
  static #timer = begin => {
    const time = new Date(new Date() - begin);
    const pad = t => (t < 10 && '0' + t) || t;
    const hours = pad(time.getUTCHours());
    const minutes = pad(time.getUTCMinutes());
    const seconds = pad(time.getUTCSeconds());
    return `${(time.getUTCHours() && hours + ':') || ''}${minutes}:${seconds}`;
  };

  static #changeLocation({ search = location.search, hash = location.hash } = {}) {
    const url = new URL(location.href);
          url.search = new URLSearchParams(search).toString();
          url.hash = hash;
    history.pushState({}, '', url.toString());
    dispatchEvent(new Event('location-changed'));
    localStorage.setItem('location', location.hash);
    SlidemDeck.#instances.forEach(i => i.#updateTitle());
  };

  static initListeners() {
    function notify(e) { SlidemDeck.#instances.forEach(i => i.#onRouteChange(e)); }
    window.addEventListener('hashchange', notify);
    window.addEventListener('location-changed', notify);
    window.addEventListener('popstate', notify);

    /**
     * Shared navigation between browser windows
     *
     * Uses the browser localstorage feature to listen to changes in 'location' on any other open browser window,
     * and matches that location in this instance
     */
    window.addEventListener('storage', ({ key, newValue }) => {
      if (key === 'location') {
        if (location.hash !== newValue) {
          this.#changeLocation({ hash: `${newValue}` });
        }
      }
    });

    window.addEventListener('keyup', e => SlidemDeck.#instances.forEach(i => i.#onKeyup(e)));

    /**
     * Gesture navigation support system
     *
     * Allows swiping gestures to navigate between slides
     * Listens to the 'touchstart' and 'touchend' events to determine if a swipe occurred
     */
    let touchX;
    let touchY;

    document.addEventListener('touchstart', ({ touches: [{ clientX, clientY }] }) => {
      touchX = clientX;
      touchY = clientY;
    }, false);

    document.addEventListener('touchend', e => {
      const xMove = e.changedTouches[0].clientX - touchX;
      const yMove = e.changedTouches[0].clientY - touchY;
      if (Math.abs(xMove) > 60 && Math.abs(xMove) > Math.abs(yMove))
        this.#instances.forEach(i => xMove < 0 ? i.forward() : i.back());
    }, false);
  }

  #timerInterval;

  // cache the document title
  #originalTitle = document.title;

  get state() { return location.hash.match(STATE_RE)?.groups ?? { slide: 1, step: 1 }; }
  set state(state) {
    const { state: old } = this;
    if (state.slide === old.slide && state.step === old.step) return;
    state.step ??= old.step;
    state.slide ??= old.slide;
    const hash = `#slide-${state.slide}/step-${state.step}`;
    SlidemDeck.#changeLocation({ hash });
  }

  get currentStepIndex() { return this.state.step - 1; }
  get currentSlideIndex() { return this.state.slide - 1; }
  previousSlideIndex;

  get presenter() { return this.hasAttribute('presenter'); }
  set presenter(value) { this.toggleAttribute('presenter', !!value); }

  get previousSlide() { return this.slides?.[this.currentSlideIndex - 1] ?? null; }
  get currentSlide() { return this.slides?.[this.currentSlideIndex] ?? null; }
  nextSlide;

  #$$(selector) { return this.shadowRoot.querySelectorAll(selector); }
  get $() { return Object.fromEntries(Array.from(this.#$$('[id]'), el => [el.id, el])); }

  slides;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, shadowStyle];
    // Initialize presenter mode based on the '?presenter' query being present
    this.presenter = new URLSearchParams(location.search).has('presenter');
  }

  connectedCallback() {
    SlidemDeck.#instances.add(this);
    this.slides = Array.from(this.children).filter(item => !item.hasAttribute('slot'));
    // Create dots for progress bar
    this.slides.forEach((slide, i) => {
      this.$.progressSlot.appendChild(document.createElement('div'));
      slide.querySelectorAll('[slot="notes"]').forEach(note => {
        note.setAttribute('slide', i + 1);
        this.appendChild(note);
      });
    });

    /**
     * Navigation handlers
     *
     * The 'forward' and 'backward' elements handle click events and navigate to the next/previous step/slide
     */
    this.$.forward.addEventListener('click', () => this.forward());
    this.$.backward.addEventListener('click', () => this.back());
    this.#init();
  }

  disconnectedCallback() {
    SlidemDeck.#instances.delete(this);
  }

  /**
   * Font loading subsystem.
   *
   * It checks the 'font' attribute defined on slidem-deck, and the 'fonts' properties on
   * all children that are custom elements (which could be custom slide elements).
   *
   * It calls the 'init' function once all fonts are loaded, or after a 2 second timeout.
   */
  async #init() {
    if (this.getAttribute('font'))
      this.style.fontFamily = this.getAttribute('font');

    // Wait until all child elements that are custom elements are registered in the customElements registry, or the timeOut happens
    await Promise.race([
      this.#untilDefined(),
      document.fonts.ready,
      new Promise(r => void setTimeout(r, 2000)),
    ]);

    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    this.removeAttribute('loading');
    this.#onRouteChange();
  }

  async #untilDefined() {
    await Promise.all(this.slides
      .filter(slide => slide.localName.includes('-'))
      .map(slide => customElements.whenDefined(slide.localName)));
  }

  #onKeyup({ key }) {
    switch (key) {
      case 'PageDown':
      case 'ArrowRight':
      case 'j':
      case 'l':
        return this.forward();
      case 'PageUp':
      case 'ArrowLeft':
      case 'h':
      case 'k':
        return this.back();
      case 't':
        return this.presenter && this.toggleTimer();
      case 'p':
        return this.togglePresenter();
    }
  }

  #updateTitle() {
    if (this.currentSlide.hasAttribute('name'))
      document.title = this.currentSlide.getAttribute('name') + ' | ' + this.#originalTitle;
    else
      document.title = this.#originalTitle;
  }

  /**
   * Routing system
   *
   * Handles route changes and displays / animates the slides by changing classes and attributes
   */
  #onRouteChange() {
    this.currentSlide.step = this.currentStepIndex + 1;
    this.currentSlide.setAttribute('active', '');

    if (this.presenter)
      this.#updateNotes();

    if (this.previousSlideIndex !== this.currentSlideIndex) {
      if (this.autoTimer)
        clearInterval(this.autoTimer);

      if (this.currentSlide.auto) {
        this.autoTimer = setInterval(() => {
          const { steps, step } = this.currentSlide;
          this.currentSlide.step = (step === steps + 1) ? 1 : step + 1;
        }, this.currentSlide.auto);
      }

      if (this.previousSlideIndex !== undefined) {
        if (this.previousSlideIndex < this.currentSlideIndex) {
          this.slides[this.previousSlideIndex].classList.add('animate-forward');
          this.currentSlide.classList.add('animate-forward');
          this.slides[this.previousSlideIndex].classList.remove('animate-backward');
          this.currentSlide.classList.remove('animate-backward');
        } else {
          this.slides[this.previousSlideIndex].classList.add('animate-backward');
          this.currentSlide.classList.add('animate-backward');
          this.slides[this.previousSlideIndex].classList.remove('animate-forward');
          this.currentSlide.classList.remove('animate-forward');
        }
      }

      if (this.oldNextSlide !== undefined)
        this.slides[this.oldNextSlide].removeAttribute('next');

      const nextIndex = this.currentSlideIndex + 1;
      this.nextSlide = this.slides[nextIndex] ? nextIndex : undefined;

      if (this.nextSlide !== undefined) {
        this.slides[this.nextSlide].setAttribute('next', '');
        this.oldNextSlide = this.nextSlide;
      }

      if (this.oldPreviousSlide !== undefined)
        this.slides[this.oldPreviousSlide].removeAttribute('previous');

      if (this.previousSlideIndex !== undefined) {
        this.slides[this.previousSlideIndex].removeAttribute('active');
        this.slides[this.previousSlideIndex].setAttribute('previous', '');
        this.$.progressSlot.children[this.previousSlideIndex].classList.remove('active');
        this.oldPreviousSlide = this.previousSlideIndex;
      }

      this.$.progressSlot.children[this.currentSlideIndex].classList.add('active');

      this.previousSlideIndex = this.currentSlideIndex;
    }
    this.dispatchEvent(new Event('change'));
  }

  /** set the `active` attr on any notes for this slide */
  #updateNotes() {
    for (const note of this.$.notes.querySelector('slot').assignedElements())
      note.toggleAttribute('active', note.getAttribute('slide') == this.currentSlideIndex + 1);
  }

  forward() {
    if (this.currentSlide.steps && this.currentSlide.step <= this.currentSlide.steps) {
      this.state = { slide: this.currentSlideIndex + 1, step: this.currentSlide.step + 1 };
    } else if (this.currentSlideIndex < this.slides.length - 1) {
      this.state = { slide: this.currentSlideIndex + 2, step: 1 };
    }
  }

  back() {
    if (this.currentSlide.steps && this.currentSlide.step > 1) {
      this.state = { slide: this.currentSlideIndex + 1, step: this.currentSlide.step - 1 };
    } else if (this.currentSlideIndex > 0) {
      this.state = { slide: this.currentSlideIndex, step: this.slides[this.currentSlideIndex - 1].steps + 1 };
    }
  }

  togglePresenter() {
    this.presenter = !this.presenter;
    SlidemDeck.#changeLocation({ search: this.presenter ? '?presenter' : '' });
  }

  toggleTimer() {
    if (this.#timerInterval) {
      clearInterval(this.#timerInterval);
      this.#timerInterval = undefined;
      this.$.timer.innerText = '';
    } else {
      this.$.timer.innerText = '00:00';
      let begin = new Date();
      this.#timerInterval = setInterval(() => (this.$.timer.innerText = SlidemDeck.#timer(begin)), 1000);
    }
  }
}

SlidemDeck.initListeners();

customElements.define(SlidemDeck.is, SlidemDeck);


