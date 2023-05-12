# Slide'm

HTML Presentation Library

So you can write your decks in HTML and share them with the world

```html
<script type="module" src="https://unpkg.com/slidem?module"></script>

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
    <p center font-size="78px" color="white">Right Arrow or Swipe Left to Begin!</p>
  </slidem-slide>

  <slidem-slide center in="slide" out="slide" background="black">
    <div center>
      <img src="/images/what.png" />
    </div>
    <p line-height="1.3" uppercase fit color="--primary">Wait what?</p>
  </slidem-slide>

  <slidem-slide center in="zoom" out="zoom" background="--primary">
    <div center>
      <img src="/images/codeSample.png">
    </div>
  </slidem-slide>
</slidem-deck>
```

## Slide Transitions

Add the `in` and, `out` attributes to a `<slidem-slide>` to control its 
transitions. These attributes take one of three values: `fade`, `slide`, or 
`zoom`.

Add the `reveal` attribute to slide content to have those elements transition in 
one by one. Link to specific states with the `#slide-${number}/step-${number}` 
URL hash, e.g. to link to the 3rd slide's 4th step, use `#slide-3/step-4`.

## Presenter Mode

Press `p` to enter presenter mode. You can add presenter notes to your slides by 
slotting them into the `notes` slot. While in presenter mode, press `t` to 
toggle the slide timer.

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

You can create your own custom slide types by extending from `SlidemSlide`. An 
easy way to add slots to your slide's shadow root is to append your custom 
template to the slide's existing `#container` element.

```js
import {SlidemSlide} from '../slidem-slide.js';
const template = document.getElementById('speaker-slide-template');
const style = document.getElementById('speaker-slide-style')
                .content.querySelector('style');
const sheet = new CSSStyleSheet();
      sheet.replaceSync(style.textContent);

class SlidemSpeakerSlide extends SlidemSlide {
  static is = 'slidem-speaker-slide';
  constructor() {
    super();
    this.shadowRoot.getElementById('content').append(template.content.cloneNode(true));
    this.shadowRoot.adoptedStyleSheets = [...this.shadowRoot.adoptedStyleSheets, sheet];
  }
}

customElements.define(SlidemSpeakerSlide.id, SlidemSpeakerSlide);
```

### Escape Hatches

Occasionally, when defining custom slide elements, you may with to override the 
default behaviour. One example would be when your slides' content is contained 
within their shadow roots, perhaps by way of [Declarative Shadow DOM][dsd].

In that case, you can imperatively define your slide's steps using the 
`defineSteps(nodelist)` method:

```js
class DeclarativeShadowSlide extends SlidemSlideBase {
  async connectedCallback() {
    super.connectedCallback();
    await polyfillDeclarativeShadowDOM(this);
    this.defineSteps(this.shadowRoot.querySelectorAll('[reveal]'));
  }
}
```

See [`index.html`](./blob/master/index.html) for a complete example.

[dsd]: https://developer.chrome.com/articles/declarative-shadow-dom/
