import { html } from '../@gluon/gluon/gluon.js';
import { SlidemSlideBase } from './slidem-slide-base.js';

const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css?family=Roboto:400,500,700';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

export class SlidemPolymersummitSlide extends SlidemSlideBase {
  get fonts() {
    return ['Roboto'];
  }
  get template() {
    this.content = html`
      <div class="introSlide">
        <div class="side">
          <div class="avatar"><slot name="avatar"></slot></div>
          <div class="speakerDetails">
            <slot name="speaker"></slot>
            <div>
              <slot name="email"></slot>
            </div>
            <div>
              <slot name="twitter"></slot>
            </div>
          </div>
          <div class="logo">
            <slot name="logo"></slot>
          </div>
        </div>
        <div class="event">
          <slot name="event"></slot>
        </div>
        <slot name="title"></slot>
        <slot name="subtitle"></slot>
      </div>
    `;

    return html`
      <style>
        :host {
          background: #2e9be6;
          font-family: 'Roboto';
        }
        .introSlide {
          overflow: hidden;
          border-bottom: 3px solid white;
          color: white;
          position: relative;
          height: 100%;
        }

        .topShade {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 34px;
          background: rgba(0, 0, 0, 0.2);
        }

        .introSlide .event {
          position: absolute;
          bottom: 26px;
          left: 0;
        }

        .introSlide .event ::slotted([slot="event"]) {
          margin: 0;
          font-size: 24px;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .introSlide .side {
          position: absolute;
          right: 0;
          width: 340px;
          height: 100%;
          display: flex;
          flex-flow: column;
          justify-content: flex-end;
        }

        .introSlide .side * {
          flex-shrink: 0;
        }

        .introSlide .avatar {
          height: 340px;
          width: 340px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 56px;
        }

        .introSlide ::slotted([slot="avatar"]) {
          max-width: 340px;
        }

        .introSlide .speakerDetails {
          border-top: 3px solid white;
          padding-top: 50px;
          padding-bottom: 30px;
        }


        .introSlide .speakerDetails ::slotted([slot="speaker"]) {
          font-weight: 400;
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 32px;
          letter-spacing: 1px;
        }

        .introSlide .speakerDetails div {
          margin-bottom: 20px;
        }

        .introSlide .speakerDetails div ::slotted([slot="email"]),
        .introSlide .speakerDetails div ::slotted([slot="twitter"]) {
          color: white;
          font-weight: 500;
          font-size: 28px;
          letter-spacing: 1px;
        }

        .introSlide .logo {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 260px;
          background-color: white;
        }

        .introSlide .logo ::slotted([slot="logo"]) {
          max-height: 200px;
          max-width: 300px;
          background-position: center;
          background-size: contain;
        }

        .introSlide ::slotted([slot="title"]) {
          margin-top: 190px;
          margin-bottom: 0;
          font-weight: 500;
          font-size: 150px;
          color: white;
          letter-spacing: 2px;
        }

        .introSlide ::slotted([slot="subtitle"]) {
          display: inline-block;
          margin-top: 40px;
          font-weight: 400;
          font-size: 100px;
          letter-spacing: 2px;
          color: white;
          padding-top: 40px;
          border-top: 3px solid white;
        }
      </style>
      <div class="topShade"></div>
      ${super.template}
    `;
  }
}

customElements.define(SlidemPolymersummitSlide.is, SlidemPolymersummitSlide);
