# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- The elements are built on [Gluon 3](https://github.com/ruphin/gluonjs): attributes are reactive properties (`active`, `previous`, `next`, `step`, `auto`, `background`, `darken-background`, `video`, `muted`, `presenter`, `font`), and the shadow DOM is a lite-html template that updates when they change.
- `SlidemSlideBase.renderContent()` for custom slides to render their own template inside the content box, and `contentScale` with the scale that fits the content box into the window.
- `SlidemDeck.slide` and `SlidemDeck.step` properties that mirror the location hash, and `timerText` with the presenter timer.
- `slidem` re-exports `GluonElement`, `css` and `html` from `@gluon/gluon`, so a custom slide needs one import.
- TypeScript sources with type declarations published under `dist/types`.
- A pure entrypoint, `slidem`, exporting the `SlidemDeck`, `SlidemSlideBase`, `SlidemSlide` and `SlidemVideoSlide` classes and the `parseState` and `formatState` helpers, with no registration side effects.
- Registering entrypoints `slidem/elements/slidem-deck`, `slidem/elements/slidem-slide` and `slidem/elements/slidem-video-slide`, one per element, listed in `sideEffects`.
- `SlidemDeck.nextSlide` returns the next slide element, like `previousSlide` and `currentSlide`.
- `SlidemVideoSlide` has `video` and `muted` properties that reflect the attributes, and picks up changes to them.
- A test suite on Vitest and happy-dom, with `npm test`, `npm run typecheck`, `npm run format` and `npm run check` scripts.
- This changelog.

### Changed

- `@gluon/gluon` is a runtime dependency. When loading from unpkg without a bundler, an import map for `@gluon/gluon` and `lite-html` is needed.
- Slides and the deck render in a microtask after they are connected, so their shadow DOM does not exist in the constructor. Custom slides override `renderContent()` instead of appending to `#content`, and code that reads the rendered DOM awaits `updateComplete`.
- Navigation is applied in the deck's next update instead of synchronously. The `change` event fires after the update.
- Setting `step` on a slide clamps it to one past the last reveal at once, instead of correcting the attribute afterwards.
- The window and document listeners of the deck and the slides are installed per instance while it is connected, and removed when it is disconnected.
- The project follows the layout and tooling of [ruphin/frontend-structure](https://github.com/ruphin/frontend-structure): sources in `src/`, build output in `dist/`, a `dev/` page for local development, Prettier formatting.
- The built files moved from `slidem-*.js` next to `package.json` to `dist/`. Import `slidem/elements/<name>` instead of `slidem/slidem-<name>.js`.
- Styles and templates are template literals inside the component modules, so each module is self-contained and no build plugin is needed.
- The deck's global stylesheet is adopted when the first deck connects, instead of when the module is evaluated.
- Setting `SlidemDeck.state` compares slide and step as numbers, so setting the current state no longer pushes a duplicate history entry.
- `SlidemDeck` and `SlidemVideoSlide` read their attributes on connect and on change instead of in the constructor, so they also work when created with `document.createElement`.
- Elements with the `fit` attribute keep their font size when their width cannot be measured, instead of being set to an infinite size.

### Removed

- The `slidem.js` entrypoint that registered every element at once. Import the three registering entrypoints instead.
- The `static is` tag name properties on the element classes. Registration happens in the `elements/` modules.
- The `$` shadow DOM lookup, the `nextSlide` index and the `previousSlideIndex` field on `SlidemDeck`, and the `$` lookup on the slides. They were internals. Custom slides reach their content box through `this.shadowRoot.getElementById("content")` as before.
- The `np` release dependency. `npm publish` runs the checks and the build through `prepublishOnly`.

## [2.0.2] - 2023-06-19

Last release before this changelog. See the git history for earlier changes.
