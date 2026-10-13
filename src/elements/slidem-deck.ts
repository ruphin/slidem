// Registering entrypoint. This module has a side effect and is listed in
// package.json "sideEffects" so bundlers keep `import "slidem/elements/slidem-deck"`.
import { SlidemDeck } from "../components/slidem-deck.js";

export { SlidemDeck };

if (!customElements.get("slidem-deck")) {
  customElements.define("slidem-deck", SlidemDeck);
}

declare global {
  interface HTMLElementTagNameMap {
    "slidem-deck": SlidemDeck;
  }
}
