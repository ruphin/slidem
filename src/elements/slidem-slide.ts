// Registering entrypoint. This module has a side effect and is listed in
// package.json "sideEffects" so bundlers keep `import "slidem/elements/slidem-slide"`.
import { SlidemSlide } from "../components/slidem-slide.js";

export { SlidemSlide };

if (!customElements.get("slidem-slide")) {
  customElements.define("slidem-slide", SlidemSlide);
}

declare global {
  interface HTMLElementTagNameMap {
    "slidem-slide": SlidemSlide;
  }
}
