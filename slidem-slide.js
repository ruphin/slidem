import{GluonElement,html}from'../gluonjs/gluon.js';class SlidemSlide extends GluonElement{get template(){return html`
      <div id="content"><slot id="slot"></slot></div>
      <style>
        :host {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          display: none;
          overflow: hidden;
          justify-content: center;
          align-items: center;
          background-size: cover;
        }
        :host([active]) {
          display: flex;
        }
        :host([active].animate-in) {
          z-index: 2;
        }
        :host([active].animate-out) {
          z-index: 0;
        }
        :host([slide-in]), :host([slide-out]), :host([zoom]) #content {
          animation-duration: 0.4s;
          animation-fill-mode: both;
          animation-timing-function: ease-in-out;
        }

        @keyframes slide-in-in {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slide-in-out {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100vw);
          }
        }

        :host([slide-in].animate-forward.animate-in) {
          animation-name: slide-in-in;
        }
        :host([slide-in].animate-backward.animate-out) {
          animation-name: slide-in-out;
          z-index: 3;
        }


        @keyframes slide-out-in {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100vw);
          }
        }

        @keyframes slide-out-out {
          from {
            transform: translateX(-100vw);
          }
          to {
            transform: translateX(0);
          }
        }

        :host([slide-out].animate-forward.animate-out) {
          animation-name: slide-out-in;
          z-index: 3;
        }
        :host([slide-out].animate-backward.animate-in) {
          animation-name: slide-out-out;
        }

        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes zoom-out {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0);
          }
        }

        :host([zoom].animate-in) #content {
          animation-name: zoom-in;
        }
        :host([zoom].animate-out) #content {
          animation-name: zoom-out;
        }

        #content {
          width: 100%;
          max-width: 1080px;
          max-height: 760px;
        }
        :host(:not([center])) #content {
          height: 100%;
        }
      </style>
    `}connectedCallback(){super.connectedCallback();const a=this.getAttribute('background');if(a)if(a.match(/^--[a-zA-Z-]*$/))this.style.background=`var(${a})`;else if(a.match(/^http/)||a.match(/^\//)){const b=this.getAttribute('darken-background');let c=a;b&&(c=`linear-gradient(rgba(0,0,0,${b}), rgba(0,0,0,${b})), url(${c})`),this.style.backgroundImage=c}else this.style.background=a;this.textNodes=Array.from(this.querySelectorAll('h1, h2, h3, h4, h5, h6, p')),this.textNodes.forEach((a)=>{null!==a.getAttribute('bold')&&(a.style.fontWeight='bold'),null!==a.getAttribute('italic')&&(a.style.fontStyle='italic'),null!==a.getAttribute('uppercase')&&(a.style.textTransform='uppercase'),null!==a.getAttribute('center')&&(a.style.textAlign='center'),null!==a.getAttribute('line-height')&&(a.style.lineHeight=a.getAttribute('line-height'));const b=a.getAttribute('color');null!==b&&(b.match(/^--[a-zA-Z-]*$/)?a.style.color=`var(${b})`:a.style.color=b)}),this.layoutNodes=Array.from(this.getElementsByTagName('div')),this.layoutNodes.forEach((a)=>{null!==a.getAttribute('center')&&(a.style.display='flex',a.style.justifyContent='center',a.style.alignItems='center')}),this.reveals=Array.from(this.querySelectorAll('[reveal]'))}static get observedAttributes(){return['step','active']}attributeChangedCallback(a,b,c){if('step'===a){const a=+c;if(a>this.reveals.length+1)return void this.setAttribute('step',this.reveals.length+1);this.__setStep(a)}'active'===a&&null!==c&&this.__rescale()}set step(a){this.setAttribute('step',a)}get step(){return+this.getAttribute('step')||1}set active(a){a?this.setAttribute('active',''):this.removeAttribute('active')}get active(){return null!==this.getAttribute('active')}__setStep(a){this.reveals.forEach((b,c)=>{b.style.opacity=c<a-1?1:0})}__rescale(){this.textNodes.forEach((a)=>{if(null!==a.getAttribute('fit')){a.style.display='table';const b=parseFloat(window.getComputedStyle(a,null).getPropertyValue('font-size')),c=this.$.content.clientWidth;a.style.fontSize=`${Math.floor(b*c/a.clientWidth)-1}px`}})}}customElements.define(SlidemSlide.is,SlidemSlide);
//# sourceMappingURL=slidem-slide.js.map
