import{GluonElement as t,html as e}from"../gluonjs/gluon.js";const n=document.createTextNode("\n  /* SLIDEM SLIDE GLOBAL STYLES */\n\n  [reveal] {\n    opacity: 0;\n    transition: opacity 0.2s;\n  }\n"),o=document.createElement("style");o.appendChild(n),document.head.appendChild(o);const i=e`
  <style>
    :host {
      overflow: hidden;
      justify-content: center;
      align-items: center;
      background-size: cover;
      background-position: center;
      display: flex;
    }

    :host([zoom-in]) #content, :host([zoom-out]) #content {
      animation-duration: 0.4s;
      animation-fill-mode: both;
      animation-timing-function: ease-in-out;
    }

    @keyframes zoom-in {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(var(--slidem-content-scale, 1));
      }
    }

    @keyframes zoom-out {
      from {
        opacity: 1;
        transform: scale(var(--slidem-content-scale, 1));
      }
      to {
        opacity: 0;
        transform: scale(0);
      }
    }

    :host([zoom-in][active].animate-forward) #content {
      animation-name: zoom-in;
    }

    :host([zoom-in][previous].animate-backward) #content {
      animation-name: zoom-out;
    }

    :host([zoom-out][previous].animate-forward) #content {
      animation-name: zoom-out;
    }

    :host([zoom-out][active].animate-backward) #content {
      animation-name: zoom-in;
    }

    #content {
      width: var(--slidem-content-width, 1760px);
      max-height: var(--slidem-content-height, 990px);
      flex-shrink: 0;
    }

    :host(:not([center])) #content {
      height: var(--slidem-content-height, 990px);
    }
  </style>
`;export class SlidemSlideBase extends t{get template(){return null!==this.getAttribute("fullscreen")||this.constructor.fullscreen?e`
        ${i}
        ${"SlidemSlide"!==this.constructor.name&&this.content||e`<slot id="slot"></slot>`}
      `:e`
        ${i}
        <div id="content">
          ${"SlidemSlide"!==this.constructor.name&&this.content||e`<slot id="slot"></slot>`}
        </div>
      `}connectedCallback(){super.connectedCallback(),this._steps=Array.from(this.querySelectorAll("[reveal]")),this.steps=this._steps.length,this.__resizeContent();let t;window.addEventListener("resize",()=>{window.clearTimeout(t),t=window.setTimeout(()=>{this.__resizeContent()},200)})}static get observedAttributes(){return["step"]}attributeChangedCallback(t,e,n){if("step"===t){const t=Number(n);if(t>this.steps+1)return void this.setAttribute("step",this.steps+1);this.__setStep(t)}}set step(t){this.setAttribute("step",t)}get step(){return Number(this.getAttribute("step"))||1}__setStep(t){this._steps.forEach((e,n)=>{e.style.opacity=n<t-1?1:0})}__resizeContent(){const t=Number((window.getComputedStyle(document.documentElement).getPropertyValue("--slidem-content-width")||"1760px").slice(0,-2)),e=Number((window.getComputedStyle(document.documentElement).getPropertyValue("--slidem-content-height")||"990px").slice(0,-2)),n=Math.min(window.innerHeight/e,window.innerWidth/1.1/t);n<1?(document.documentElement.style.setProperty("--slidem-content-scale",n),this.$.content&&(this.$.content.style.transform=`scale(${n})`)):(document.documentElement.style.setProperty("--slidem-content-scale",1),this.$.content&&(this.$.content.style.transform="scale(1)"))}};customElements.define(SlidemSlideBase.is,SlidemSlideBase);
//# sourceMappingURL=slidem-slide-base.js.map
