import{GluonElement as e,html as t}from"../gluonjs/gluon.js";import{SlidemSlideBase as i}from"./slidem-slide-base.js";export class SlidemVideoSlide extends i{get template(){return this.content=t`
      <video controls id="video"></video>
    `,t`
      <style>
        :host {
          background: black;
          color: white;
        }

        video {
          width: 100%;
          max-height: 100%;
          max-width: 100%;
        }
      </style>
      ${super.template}
    `}connectedCallback(){super.connectedCallback(),this.$.video.src=this.getAttribute("video"),this.$.video.muted=null!==this.getAttribute("muted")}static get observedAttributes(){const e=super.observedAttributes||[];return Array.prototype.push.apply(e,["active"]),e}attributeChangedCallback(e,t,i){super.attributeChangedCallback(e,t,i),"active"===e&&(null!==i?(this.$.video.currentTime=0,this.$.video.play()):this.$.video.pause())}};customElements.define(SlidemVideoSlide.is,SlidemVideoSlide);
//# sourceMappingURL=slidem-video-slide.js.map
