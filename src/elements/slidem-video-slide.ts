// Registering entrypoint. This module has a side effect and is listed in
// package.json "sideEffects" so bundlers keep `import "slidem/elements/slidem-video-slide"`.
import { SlidemVideoSlide } from "../components/slidem-video-slide.js";

export { SlidemVideoSlide };

if (!customElements.get("slidem-video-slide")) {
  customElements.define("slidem-video-slide", SlidemVideoSlide);
}

declare global {
  interface HTMLElementTagNameMap {
    "slidem-video-slide": SlidemVideoSlide;
  }
}
