import{GluonElement,html}from'../gluonjs/gluon.js';class SlidemSlide extends GluonElement{get template(){return html`
      <div id="content"><slot id="slot"></slot></div>
      <style>
        :host(:not([active])) {
          display: none;
        }
        :host {
          display: flex;
          overflow: hidden;
          height: 100%;
          width: 100%;
          justify-content: center;
          align-items: center;
          background-size: cover;
        }
        #content {
          width: 100%;
          max-width: 1080px;
          height: 100%;
          max-height: 760px;
        }
      </style>
    `}connectedCallback(){super.connectedCallback();const a=this.getAttribute('background');if(a)if(a.match(/^--[a-zA-Z-]*$/))this.style.background=`var(${a})`;else if(a.match(/^http/)||a.match(/^\//)){const b=this.getAttribute('darken-background');let c=a;b&&(c=`linear-gradient(rgba(0,0,0,${b}), rgba(0,0,0,${b})), url(${c})`),this.style.backgroundImage=c}else this.style.background=a;this.textNodes=Array.from(this.querySelectorAll('h1, h2, h3, h4, h5, h6, p')),this.textNodes.forEach((a)=>{null!==a.getAttribute('bold')&&(a.style.fontWeight='bold'),null!==a.getAttribute('italic')&&(a.style.fontStyle='italic'),null!==a.getAttribute('uppercase')&&(a.style.textTransform='uppercase'),null!==a.getAttribute('center')&&(a.style.textAlign='center'),null!==a.getAttribute('line-height')&&(a.style.lineHeight=a.getAttribute('line-height'));const b=a.getAttribute('color');null!==b&&(b.match(/^--[a-zA-Z-]*$/)?a.style.color=`var(${b})`:a.style.color=b)}),this.reveals=Array.from(this.getElementsByTagName('slidem-reveal'))}static get observedAttributes(){return['step','active']}attributeChangedCallback(a,b,c){if('step'===a){const a=+c;if(a>this.reveals.length+1)return void this.setAttribute('step',this.reveals.length+1);this.__setStep(a)}'active'===a&&null!==c&&this.__rescale()}set step(a){this.setAttribute('step',a)}get step(){return+this.getAttribute('step')||1}set active(a){a?this.setAttribute('active',''):this.removeAttribute('active')}get active(){return null!==this.getAttribute('active')}__setStep(a){this.reveals.forEach((b,c)=>{c<a-1?b.setAttribute('revealed',''):b.removeAttribute('revealed')})}__rescale(){this.textNodes.forEach((a)=>{if(null!==a.getAttribute('fit')){a.style.display='table';const b=parseFloat(window.getComputedStyle(a,null).getPropertyValue('font-size')),c=this.$.content.clientWidth;a.style.fontSize=`${Math.floor(b*c/a.clientWidth)-1}px`}})}}customElements.define(SlidemSlide.is,SlidemSlide);
//# sourceMappingURL=slidem-slide.js.map
