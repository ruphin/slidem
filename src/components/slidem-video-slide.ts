import {
  type PropertyDeclarations,
  type PropertyValues,
  css,
  html,
} from "@gluon/gluon";
import { SlidemSlideBase } from "./slidem-slide-base.js";

/**
 * A slide that plays the video given by its `video` attribute while it is
 * active. Pure class with no registration side effect: import
 * "slidem/elements/slidem-video-slide" to register it as <slidem-video-slide>.
 */
export class SlidemVideoSlide extends SlidemSlideBase {
  static override styles = [
    SlidemSlideBase.styles!,
    css`
      :host {
        background: black;
        color: white;
      }

      video {
        width: 100%;
        max-height: 100%;
        max-width: 100%;
      }
    `,
  ].flat();

  static override properties: PropertyDeclarations = {
    video: { attribute: true },
    muted: { type: Boolean, attribute: true },
  };

  /** The URL of the video. Reflects the `video` attribute. */
  video = "";

  /** Whether the video plays without sound. Reflects the `muted` attribute. */
  muted = false;

  get #videoElement(): HTMLVideoElement | null {
    return this.renderRoot.querySelector("video");
  }

  protected override renderContent(): unknown {
    return html`<video controls src=${this.video} .muted=${this.muted}></video>`;
  }

  override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    if (!changed.has("active")) return;
    const video = this.#videoElement;
    if (!video) return;
    if (this.active) {
      video.currentTime = 0;
      // Autoplay may be blocked; that is not an error for the slide.
      void video.play()?.catch(() => undefined);
    } else {
      video.pause();
    }
  }
}
