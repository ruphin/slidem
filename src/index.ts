// Pure public entrypoint: classes, helpers and types only. Nothing in here
// (or in anything it imports) may have side effects such as
// customElements.define(), so bundlers can tree-shake unused exports.
// Registering entrypoints live in src/elements/ and are exported as
// "slidem/elements/<name>".
export { SlidemDeck } from "./components/slidem-deck.js";
export { SlidemSlideBase } from "./components/slidem-slide-base.js";
export { SlidemSlide } from "./components/slidem-slide.js";
export { SlidemVideoSlide } from "./components/slidem-video-slide.js";
export { parseState, formatState, type DeckState } from "./lib/state.js";
// Custom slides are written with Gluon; re-exported so one import is enough.
export {
  GluonElement,
  css,
  html,
  type PropertyDeclarations,
  type PropertyValues,
  type Styles,
} from "@gluon/gluon";
