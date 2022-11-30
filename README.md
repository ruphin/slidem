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


## Presenter Mode

Press `p` to enter presenter mode. You can add presenter notes to your slides by 
slotting them into the `notes` slot. While in presenter mode, press `t` to 
toggle the slide timer.
