import{GluonElement as e,html as t}from"../gluonjs/gluon.js";import{onRouteChange as i,currentPath as s,currentHash as n}from"../gluon-router/gluon-router.js";import"../fontfaceobserver/fontfaceobserver.standalone.js";import"../gluon-keybinding/gluon-keybinding.js";const d=document.createTextNode("\n  /* SLIDEM GLOBAL STYLES */\n  body {\n    margin: 0;\n  }\n\n  [reveal] {\n    opacity: 0;\n    transition: opacity 0.2s;\n  }\n\n  slidem-deck > *:not([active]) {\n    display: none;\n  }\n\n  @keyframes slidem-fade-in {\n    from {\n      opacity: 0;\n    }\n    to {\n      opacity: 1;\n    }\n  }\n\n  @keyframes slidem-fade-out {\n    from {\n      opacity: 1;\n    }\n    to {\n      opacity: 0;\n    }\n  }\n\n  @keyframes slidem-slide-in-in {\n    from {\n      transform: translateX(100vw);\n    }\n    to {\n      transform: translateX(0);\n    }\n  }\n\n  @keyframes slidem-slide-in-out {\n    from {\n      transform: translateX(0);\n    }\n    to {\n      transform: translateX(100vw);\n    }\n  }\n\n  @keyframes slidem-slide-out-in {\n    from {\n      transform: translateX(0);\n    }\n    to {\n      transform: translateX(-100vw);\n    }\n  }\n\n  @keyframes slidem-slide-out-out {\n    from {\n      transform: translateX(-100vw);\n    }\n    to {\n      transform: translateX(0);\n    }\n  }\n"),a=document.createElement("style");a.appendChild(d),document.head.appendChild(a);export class SlidemDeck extends e{get template(){return t`
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
    `}connectedCallback(){super.connectedCallback(),this.slides=Array.from(this.children),this.slides.forEach(e=>{this.$.progress.appendChild(document.createElement("div"))}),i(()=>{this.slides[this.currentSlide].step=this.currentStep+1,this.slides[this.currentSlide].setAttribute("active",""),this.slides[this.currentSlide].classList.add("animate-in"),this.previousSlide!==this.currentSlide&&(void 0!==this.previousSlide&&(this.previousSlide<this.currentSlide?(this.slides[this.previousSlide].classList.add("animate-forward"),this.slides[this.currentSlide].classList.add("animate-forward"),this.slides[this.previousSlide].classList.remove("animate-backward"),this.slides[this.currentSlide].classList.remove("animate-backward")):(this.slides[this.previousSlide].classList.add("animate-backward"),this.slides[this.currentSlide].classList.add("animate-backward"),this.slides[this.previousSlide].classList.remove("animate-forward"),this.slides[this.currentSlide].classList.remove("animate-forward"))),void 0!==this.fadeOutSlide&&(this.slides[this.fadeOutSlide].classList.remove("animate-out"),this.fadeOutSlide!==this.currentSlide&&this.slides[this.fadeOutSlide].removeAttribute("active")),void 0!==this.previousSlide&&(this.slides[this.previousSlide].classList.remove("animate-in"),this.slides[this.previousSlide].classList.add("animate-out"),this.$.progress.children[this.previousSlide].classList.remove("active"),this.fadeOutSlide=this.previousSlide),this.$.progress.children[this.currentSlide].classList.add("active"),this.previousSlide=this.currentSlide)}),this.$.forward.onclick=(()=>{this.slides[this.currentSlide].steps&&this.slides[this.currentSlide].step<=this.slides[this.currentSlide].steps?(window.history.pushState({},"",`${s()}#slide-${this.currentSlide+1}/step-${this.slides[this.currentSlide].step+1}`),window.dispatchEvent(new Event("location-changed"))):this.currentSlide<this.slides.length-1&&(window.history.pushState({},"",`${s()}#slide-${this.currentSlide+2}/step-1`),window.dispatchEvent(new Event("location-changed")))}),this.$.backward.onclick=(()=>{this.slides[this.currentSlide].steps&&this.slides[this.currentSlide].step>1?(window.history.pushState({},"",`${s()}#slide-${this.currentSlide+1}/step-${this.slides[this.currentSlide].step-1}`),window.dispatchEvent(new Event("location-changed"))):this.currentSlide>0&&(this.slides[this.currentSlide-1].steps?window.history.pushState({},"",`${s()}#slide-${this.currentSlide}/step-${this.slides[this.currentSlide-1].steps+1}`):window.history.pushState({},"",`${s()}#slide-${this.currentSlide}/step-1`),window.dispatchEvent(new Event("location-changed")))});let e,t;document.addEventListener("touchstart",i=>{e=i.touches[0].clientX,t=i.touches[0].clientY},!1),document.addEventListener("touchend",i=>{const s=i.changedTouches[0].clientX-e,n=i.changedTouches[0].clientY-t;Math.abs(s)>60&&Math.abs(s)>Math.abs(n)&&(s<0?this.$.forward.onclick():this.$.backward.onclick())},!1),this.removeAttribute("loading");const n=()=>{window.requestAnimationFrame(()=>window.dispatchEvent(new Event("location-changed")))},d=this.getAttribute("font");d&&(this.style.fontFamily=d),Promise.all(this.slides.filter(e=>e.fonts).map(e=>e.fonts).reduce((e,t)=>e.concat(t),d&&[d]||[]).map(e=>new FontFaceObserver(e).load())).then(n,n)}get currentSlide(){return(n().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1]||1)-1}get currentStep(){return(n().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2]||1)-1}};customElements.define(SlidemDeck.is,SlidemDeck);
//# sourceMappingURL=slidem-deck.js.map
