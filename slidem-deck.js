import{GluonElement as e,html as t}from"../gluonjs/gluon.js";import{onRouteChange as i,currentPath as s,currentQuery as n,currentHash as r}from"../gluon-router/gluon-router.js";import"../fontfaceobserver/fontfaceobserver.standalone.js";import{GluonKeybinding as o}from"../gluon-keybinding/gluon-keybinding.js";const a=document.createTextNode("\n  /* SLIDEM GLOBAL STYLES */\n  body {\n    margin: 0;\n  }\n\n\n  [reveal] {\n    opacity: 0;\n    transition: opacity 0.2s;\n  }\n\n  /* Keyframes are defined here to patch a scoping bug in Chrome */\n  @keyframes slidem-fade-in {\n    from {\n      opacity: 0;\n    }\n    to {\n      opacity: 1;\n    }\n  }\n\n  @keyframes slidem-fade-out {\n    from {\n      opacity: 1;\n    }\n    to {\n      opacity: 0;\n    }\n  }\n\n  @keyframes slidem-slide-in-forward {\n    from {\n      transform: translateX(100vw);\n    }\n    to {\n      transform: translateX(0);\n    }\n  }\n\n  @keyframes slidem-slide-in-backward {\n    from {\n      transform: translateX(0);\n    }\n    to {\n      transform: translateX(100vw);\n    }\n  }\n\n  @keyframes slidem-slide-out-forward {\n    from {\n      transform: translateX(0);\n    }\n    to {\n      transform: translateX(-100vw);\n    }\n  }\n\n  @keyframes slidem-slide-out-backward {\n    from {\n      transform: translateX(-100vw);\n    }\n    to {\n      transform: translateX(0);\n    }\n  }\n"),d=document.createElement("style");d.appendChild(a),document.head.appendChild(d);export class SlidemDeck extends e{get template(){return t`
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
    `}get presenter(){return null!==this.getAttribute("presenter")}set presenter(e){e?this.setAttribute("presenter",""):this.removeAttribute("presenter")}connectedCallback(){super.connectedCallback(),this.presenter="presenter"===n(),this.$.presenterToggle.addEventListener("click",()=>{this.presenter=!this.presenter,t({query:this.presenter&&"presenter"||"",hash:r()})});let e;this.$.timerToggle.addEventListener("click",()=>{if(e)clearInterval(e),e=void 0,this.$.timer.innerText="";else{this.$.timer.innerText="00:00";let t=new Date;e=setInterval(()=>this.$.timer.innerText=l(t),1e3)}}),this.slides=Array.from(this.children),this.slides.forEach(e=>{this.$.progress.appendChild(document.createElement("div"))}),i(()=>{this.slides[this.currentSlide].step=this.currentStep+1,this.slides[this.currentSlide].setAttribute("active",""),this.previousSlide!==this.currentSlide&&(void 0!==this.previousSlide&&(this.previousSlide<this.currentSlide?(this.slides[this.previousSlide].classList.add("animate-forward"),this.slides[this.currentSlide].classList.add("animate-forward"),this.slides[this.previousSlide].classList.remove("animate-backward"),this.slides[this.currentSlide].classList.remove("animate-backward")):(this.slides[this.previousSlide].classList.add("animate-backward"),this.slides[this.currentSlide].classList.add("animate-backward"),this.slides[this.previousSlide].classList.remove("animate-forward"),this.slides[this.currentSlide].classList.remove("animate-forward"))),void 0!==this.oldNextSlide&&this.slides[this.oldNextSlide].removeAttribute("next"),this.nextSlide=this.slides[this.currentSlide+1]&&this.currentSlide+1||void 0,void 0!==this.nextSlide&&(this.slides[this.nextSlide].setAttribute("next",""),this.oldNextSlide=this.nextSlide),void 0!==this.oldPreviousSlide&&this.slides[this.oldPreviousSlide].removeAttribute("previous"),void 0!==this.previousSlide&&(this.slides[this.previousSlide].removeAttribute("active"),this.slides[this.previousSlide].setAttribute("previous",""),this.$.progress.children[this.previousSlide].classList.remove("active"),this.oldPreviousSlide=this.previousSlide),this.$.progress.children[this.currentSlide].classList.add("active"),this.previousSlide=this.currentSlide)});const t=({path:e=s(),query:t=n(),hash:i=r()}={})=>{e=window.history.pushState({},"",`${e}${t&&"?"+t||""}${i&&"#"+i||""}`),window.dispatchEvent(new Event("location-changed")),localStorage.setItem("location",r())};this.$.forward.onclick=(()=>{this.slides[this.currentSlide].steps&&this.slides[this.currentSlide].step<=this.slides[this.currentSlide].steps?t({hash:`slide-${this.currentSlide+1}/step-${this.slides[this.currentSlide].step+1}`}):this.currentSlide<this.slides.length-1&&t({hash:`slide-${this.currentSlide+2}/step-1`})}),this.$.backward.onclick=(()=>{this.slides[this.currentSlide].steps&&this.slides[this.currentSlide].step>1?t({hash:`slide-${this.currentSlide+1}/step-${this.slides[this.currentSlide].step-1}`}):this.currentSlide>0&&t({hash:`slide-${this.currentSlide}/step-${(this.slides[this.currentSlide-1].steps||0)+1}`})});let o,a;document.addEventListener("touchstart",e=>{o=e.touches[0].clientX,a=e.touches[0].clientY},!1),document.addEventListener("touchend",e=>{const t=e.changedTouches[0].clientX-o,i=e.changedTouches[0].clientY-a;Math.abs(t)>60&&Math.abs(t)>Math.abs(i)&&(t<0?this.$.forward.onclick():this.$.backward.onclick())},!1),this.removeAttribute("loading");const d=()=>{window.requestAnimationFrame(()=>window.dispatchEvent(new Event("location-changed")))},c=this.getAttribute("font");c&&(this.style.fontFamily=c),Promise.all(this.slides.filter(e=>e.fonts).map(e=>e.fonts).reduce((e,t)=>e.concat(t),c&&[c]||[]).map(e=>new FontFaceObserver(e).load())).then(d,d),window.addEventListener("storage",e=>{"location"===e.key&&r()!==e.newValue&&t({hash:`${e.newValue}`})})}get currentSlide(){return(r().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1]||1)-1}get currentStep(){return(r().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2]||1)-1}};const l=e=>{const t=new Date(new Date-e),i=e=>e<10&&"0"+e||e,s=i(t.getUTCHours()),n=i(t.getUTCMinutes()),r=i(t.getUTCSeconds());return`${t.getUTCHours()&&s+":"||""}${n}:${r}`};customElements.define(SlidemDeck.is,SlidemDeck);
//# sourceMappingURL=slidem-deck.js.map
