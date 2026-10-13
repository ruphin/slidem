/** Where a deck is: both numbers are 1-based. */
export interface DeckState {
  slide: number;
  step: number;
}

export const INITIAL_STATE: Readonly<DeckState> = { slide: 1, step: 1 };

/**
 * `#slide-3/step-4` links to the 3rd slide's 4th step. Both parts are optional;
 * a missing part falls back to 1.
 */
const STATE_RE = /^#(?:slide-(?<slide>\d+))?(?:\/step-(?<step>\d+))?/;

/** Reads the deck state from a location hash; falls back to the first step of the first slide. */
export function parseState(hash: string): DeckState {
  const groups = STATE_RE.exec(hash)?.groups;
  return {
    slide: Number(groups?.["slide"] ?? INITIAL_STATE.slide),
    step: Number(groups?.["step"] ?? INITIAL_STATE.step),
  };
}

/** Formats a deck state as a location hash. */
export function formatState({ slide, step }: DeckState): string {
  return `#slide-${slide}/step-${step}`;
}

export function sameState(a: DeckState, b: DeckState): boolean {
  return a.slide === b.slide && a.step === b.step;
}

/** True when both parts are usable slide and step numbers. */
export function isValidState({ slide, step }: Partial<DeckState>): boolean {
  return (
    Number.isInteger(slide) && Number.isInteger(step) && slide! > 0 && step! > 0
  );
}
