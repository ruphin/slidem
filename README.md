# Slide'm

HTML Presentation Library

So you can write your decks in HTML and share them with the world

```html
<script type="module">
  import "https://unpkg.com/slidem/dist/elements/slidem-deck.js";
  import "https://unpkg.com/slidem/dist/elements/slidem-slide.js";
  import "https://unpkg.com/slidem/dist/elements/slidem-video-slide.js";
</script>

<slidem-deck font="Open Sans Condensed" loading>
  <slidem-slide center in="slide" background="--primary">
    <h1 uppercase fit line-height="0.8" color="black">Slide'm</h1>
    <p uppercase fit color="black">HTML Presentation Library</p>
    <p uppercase fit color="white">
      So you can write your decks in HTML and share them with the world
    </p>
    <p uppercase center font-size="78px" line-height="1.8" color="black">
      <a href="https://github.com/ruphin/slidem">View on GitHub</a>
    </p>
    <p center font-size="78px" color="white">
      Right Arrow or Swipe Left to Begin!
    </p>
  </slidem-slide>

  <slidem-slide center in="slide" out="slide" background="black">
    <div center>
      <img src="/images/what.png" />
    </div>
    <p line-height="1.3" uppercase fit color="--primary">Wait what?</p>
  </slidem-slide>

  <slidem-slide center in="zoom" out="zoom" background="--primary">
    <div center>
      <img src="/images/codeSample.png" />
    </div>
  </slidem-slide>
</slidem-deck>
```

## Installing

```
npm install slidem
```

Slide'm is published as ES modules with type declarations. It has two kinds of entry points:

| Import                                        | Side effects | Use                                                |
| --------------------------------------------- | ------------ | -------------------------------------------------- |
| `import { SlidemSlide } from "slidem"`        | none         | Extend a class, or register it under your own name |
| `import "slidem/elements/slidem-slide"`       | registers    | Defines `<slidem-slide>`                           |
| `import "slidem/elements/slidem-deck"`        | registers    | Defines `<slidem-deck>`                            |
| `import "slidem/elements/slidem-video-slide"` | registers    | Defines `<slidem-video-slide>`                     |

The pure entrypoint exports `SlidemDeck`, `SlidemSlideBase`, `SlidemSlide`, `SlidemVideoSlide`, the `parseState` and `formatState` helpers for the `#slide-N/step-N` location hash, and Gluon's `GluonElement`, `css` and `html` for custom slides.

The elements depend on [`@gluon/gluon`](https://www.npmjs.com/package/@gluon/gluon), which npm installs with `slidem`. When loading from unpkg without a bundler, use an import map so `@gluon/gluon` and `lite-html` resolve:

```html
<script type="importmap">
  {
    "imports": {
      "@gluon/gluon": "https://unpkg.com/@gluon/gluon@3/dist/gluon.min.js",
      "lite-html": "https://unpkg.com/lite-html@1/dist/lite-html.min.js"
    }
  }
</script>
```

## Slide Transitions

Add the `in` and, `out` attributes to a `<slidem-slide>` to control its
transitions. These attributes take one of three values: `fade`, `slide`, or
`zoom`.

Add the `reveal` attribute to slide content to have those elements transition in
one by one. Link to specific states with the `#slide-${number}/step-${number}`
URL hash, e.g. to link to the 3rd slide's 4th step, use `#slide-3/step-4`.

Add the `auto` attribute to a slide to have it advance through its steps by
itself, every 5 seconds or every `auto="milliseconds"`.

## Presenter Mode

Press `p` to enter presenter mode. You can add presenter notes to your slides by
slotting them into the `notes` slot. While in presenter mode, press `t` to
toggle the slide timer.

Every open window of the same deck follows the window that navigates, so a
presenter window on one screen can drive the audience window on another.

## Colours and Typography

Slidem provides some HTML extensions to make it easy to quickly style your
slides. You can of course use CSS to do the same.

Add `fit` to any content element (e.g. `<p>`, `<h2>` or `<strong>`) to have it
grow to fill the slide width. Add `uppercase` to transform it to uppercase. Use
the `color` attribute to change it's color. Add `line-height` to change an
element's line height.

Use the `background` attribute on `<slidem-slide>` to set the background. it's
value can be a CSS colour value, a CSS Custom Property name, or a URL to an
image.

## Custom Slide Templates

The elements are built on [Gluon](https://github.com/ruphin/gluonjs). You can
create your own custom slide types by extending `SlidemSlide` or
`SlidemSlideBase`, adding styles, and overriding `renderContent()` with the
template that goes inside the slide's content box. The `css` and `html` tags
come from Gluon and are re-exported by `slidem`.

```ts
import { SlidemSlide, css, html } from "slidem";

class SlidemSpeakerSlide extends SlidemSlide {
  static override styles = [
    SlidemSlide.styles!,
    css`
      :host {
        background: #2e9be6;
        color: white;
      }
    `,
  ].flat();

  protected override renderContent() {
    return html`
      <h1><slot name="title"></slot></h1>
      <slot name="speaker"></slot>
    `;
  }
}

customElements.define("slidem-speaker-slide", SlidemSpeakerSlide);
```

Slides render after they are connected, so the shadow DOM does not exist in
the constructor. Use `firstUpdated()` for work that needs the rendered
content, or `await this.updateComplete`.

### Escape Hatches

Occasionally, when defining custom slide elements, you may wish to override the
default behaviour. One example would be when your slides' content is contained
within their shadow roots, perhaps by way of [Declarative Shadow DOM][dsd].

In that case, you can imperatively define your slide's steps using the
`defineSteps(nodelist)` method:

```ts
import { SlidemSlideBase } from "slidem";

class DeclarativeShadowSlide extends SlidemSlideBase {
  override connectedCallback() {
    super.connectedCallback();
    this.defineSteps(this.shadowRoot!.querySelectorAll("[reveal]"));
  }
}
```

See [`dev/index.html`](./dev/index.html) and [`dev/main.ts`](./dev/main.ts)
for a complete example deck with a custom slide.

[dsd]: https://developer.chrome.com/articles/declarative-shadow-dom/

## Development

The project follows [ruphin/frontend-structure](https://github.com/ruphin/frontend-structure).

```sh
npm install
npm run dev        # serve the demo deck in dev/, importing the library from src/
npm run build      # build ESM modules and type declarations into dist/
npm test           # run the tests once (npm run test:watch for watch mode)
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write (npm run format:check to verify only)
npm run check      # typecheck + format:check + test
npm publish        # runs check and build first
```

Changes go in `CHANGELOG.md` under Unreleased as they are made.
