(function () {
'use strict';

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// The first argument to JS template tags retain identity across multiple
// calls to a tag for the same literal, so we can cache work done per literal
// in a Map.
const templates = new Map();
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
function html(strings, ...values) {
    let template = templates.get(strings);
    if (template === undefined) {
        template = new Template(strings);
        templates.set(strings, template);
    }
    return new TemplateResult(template, values);
}
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
class TemplateResult {
    constructor(template, values) {
        this.template = template;
        this.values = values;
    }
}
/**
 * Renders a template to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 */
function render(result, container, partCallback = defaultPartCallback) {
    let instance = container.__templateInstance;
    // Repeat render, just call update()
    if (instance !== undefined && instance.template === result.template &&
        instance._partCallback === partCallback) {
        instance.update(result.values);
        return;
    }
    // First render, create a new TemplateInstance and append it
    instance = new TemplateInstance(result.template, partCallback);
    container.__templateInstance = instance;
    const fragment = instance._clone();
    instance.update(result.values);
    let child;
    while ((child = container.lastChild)) {
        container.removeChild(child);
    }
    container.appendChild(fragment);
}
/**
 * An expression marker with embedded unique key to avoid
 * https://github.com/PolymerLabs/lit-html/issues/62
 */
const exprMarker = `{{lit-${Math.random()}}}`;
/**
 * A placeholder for a dynamic expression in an HTML template.
 *
 * There are two built-in part types: AttributePart and NodePart. NodeParts
 * always represent a single dynamic expression, while AttributeParts may
 * represent as many expressions are contained in the attribute.
 *
 * A Template's parts are mutable, so parts can be replaced or modified
 * (possibly to implement different template semantics). The contract is that
 * parts can only be replaced, not removed, added or reordered, and parts must
 * always consume the correct number of values in their `update()` method.
 *
 * TODO(justinfagnani): That requirement is a little fragile. A
 * TemplateInstance could instead be more careful about which values it gives
 * to Part.update().
 */
class TemplatePart {
    constructor(type, index, name, rawName, strings) {
        this.type = type;
        this.index = index;
        this.name = name;
        this.rawName = rawName;
        this.strings = strings;
    }
}
class Template {
    constructor(strings) {
        this.parts = [];
        this.element = document.createElement('template');
        this.element.innerHTML = strings.join(exprMarker);
        const walker = document.createTreeWalker(this.element.content, 5 /* elements & text */);
        let index = -1;
        let partIndex = 0;
        const nodesToRemove = [];
        while (walker.nextNode()) {
            index++;
            const node = walker.currentNode;
            if (node.nodeType === 1 /* ELEMENT_NODE */) {
                if (!node.hasAttributes())
                    continue;
                const attributes = node.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    const attribute = attributes.item(i);
                    const attributeStrings = attribute.value.split(exprMarker);
                    if (attributeStrings.length > 1) {
                        // Get the template literal section leading up to the first
                        // expression in this attribute attribute
                        const attributeString = strings[partIndex];
                        // Trim the trailing literal value if this is an interpolation
                        const rawNameString = attributeString.substring(0, attributeString.length - attributeStrings[0].length);
                        // Find the attribute name
                        const rawName = rawNameString.match(/((?:\w|[.\-_$])+)=["']?$/)[1];
                        this.parts.push(new TemplatePart('attribute', index, attribute.name, rawName, attributeStrings));
                        node.removeAttribute(attribute.name);
                        partIndex += attributeStrings.length - 1;
                        i--;
                    }
                }
            }
            else if (node.nodeType === 3 /* TEXT_NODE */) {
                const strings = node.nodeValue.split(exprMarker);
                if (strings.length > 1) {
                    const parent = node.parentNode;
                    const lastIndex = strings.length - 1;
                    // We have a part for each match found
                    partIndex += lastIndex;
                    // We keep this current node, but reset its content to the last
                    // literal part. We insert new literal nodes before this so that the
                    // tree walker keeps its position correctly.
                    node.textContent = strings[lastIndex];
                    // Generate a new text node for each literal section
                    // These nodes are also used as the markers for node parts
                    for (let i = 0; i < lastIndex; i++) {
                        parent.insertBefore(new Text(strings[i]), node);
                        this.parts.push(new TemplatePart('node', index++));
                    }
                }
                else if (!node.nodeValue.trim()) {
                    nodesToRemove.push(node);
                    index--;
                }
            }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const getValue = (part, value) => {
    // `null` as the value of a Text node will render the string 'null'
    // so we convert it to undefined
    if (value != null && value.__litDirective === true) {
        value = value(part);
    }
    return value === null ? undefined : value;
};

class AttributePart {
    constructor(instance, element, name, strings) {
        this.instance = instance;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.size = strings.length - 1;
    }
    setValue(values, startIndex) {
        const strings = this.strings;
        let text = '';
        for (let i = 0; i < strings.length; i++) {
            text += strings[i];
            if (i < strings.length - 1) {
                const v = getValue(this, values[startIndex + i]);
                if (v &&
                    (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
                    for (const t of v) {
                        // TODO: we need to recursively call getValue into iterables...
                        text += t;
                    }
                }
                else {
                    text += v;
                }
            }
        }
        this.element.setAttribute(this.name, text);
    }
}
class NodePart {
    constructor(instance, startNode, endNode) {
        this.instance = instance;
        this.startNode = startNode;
        this.endNode = endNode;
    }
    setValue(value) {
        value = getValue(this, value);
        if (value === null ||
            !(typeof value === 'object' || typeof value === 'function')) {
            // Handle primitive values
            // If the value didn't change, do nothing
            if (value === this._previousValue) {
                return;
            }
            this._setText(value);
        }
        else if (value instanceof TemplateResult) {
            this._setTemplateResult(value);
        }
        else if (Array.isArray(value) || value[Symbol.iterator]) {
            this._setIterable(value);
        }
        else if (value instanceof Node) {
            this._setNode(value);
        }
        else if (value.then !== undefined) {
            this._setPromise(value);
        }
        else {
            // Fallback, will render the string representation
            this._setText(value);
        }
    }
    _insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    _setNode(value) {
        this.clear();
        this._insert(value);
        this._previousValue = value;
    }
    _setText(value) {
        const node = this.startNode.nextSibling;
        if (node === this.endNode.previousSibling &&
            node.nodeType === Node.TEXT_NODE) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if _previousValue is
            // primitive?
            node.textContent = value;
        }
        else {
            this._setNode(new Text(value));
        }
        this._previousValue = value;
    }
    _setTemplateResult(value) {
        let instance;
        if (this._previousValue &&
            this._previousValue.template === value.template) {
            instance = this._previousValue;
        }
        else {
            instance =
                new TemplateInstance(value.template, this.instance._partCallback);
            this._setNode(instance._clone());
            this._previousValue = instance;
        }
        instance.update(value.values);
    }
    _setIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _previousValue is an array, then the previous render was of an
        // iterable and _previousValue will contain the NodeParts from the previous
        // render. If _previousValue is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this._previousValue)) {
            this.clear();
            this._previousValue = [];
        }
        // Lets of keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this._previousValue;
        let partIndex = 0;
        for (const item of value) {
            // Try to reuse an existing part
            let itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                // If we're creating the first item part, it's startNode should be the
                // container's startNode
                let itemStart = this.startNode;
                // If we're not creating the first part, create a new separator marker
                // node, and fix up the previous part's endNode to point to it
                if (partIndex > 0) {
                    const previousPart = itemParts[partIndex - 1];
                    itemStart = previousPart.endNode = new Text();
                    this._insert(itemStart);
                }
                itemPart = new NodePart(this.instance, itemStart, this.endNode);
                itemParts.push(itemPart);
            }
            itemPart.setValue(item);
            partIndex++;
        }
        if (partIndex === 0) {
            this.clear();
            this._previousValue = undefined;
        }
        else if (partIndex < itemParts.length) {
            const lastPart = itemParts[partIndex - 1];
            this.clear(lastPart.endNode.previousSibling);
            lastPart.endNode = this.endNode;
        }
    }
    _setPromise(value) {
        value.then((v) => {
            if (this._previousValue === value) {
                this.setValue(v);
            }
        });
        this._previousValue = value;
    }
    clear(startNode = this.startNode) {
        let node;
        while ((node = startNode.nextSibling) !== this.endNode) {
            node.parentNode.removeChild(node);
        }
    }
}
const defaultPartCallback = (instance, templatePart, node) => {
    if (templatePart.type === 'attribute') {
        return new AttributePart(instance, node, templatePart.name, templatePart.strings);
    }
    else if (templatePart.type === 'node') {
        return new NodePart(instance, node, node.nextSibling);
    }
    throw new Error(`Unknown part type ${templatePart.type}`);
};
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
class TemplateInstance {
    constructor(template, partCallback = defaultPartCallback) {
        this._parts = [];
        this.template = template;
        this._partCallback = partCallback;
    }
    update(values) {
        let valueIndex = 0;
        for (const part of this._parts) {
            if (part.size === undefined) {
                part.setValue(values[valueIndex]);
                valueIndex++;
            }
            else {
                part.setValue(values, valueIndex);
                valueIndex += part.size;
            }
        }
    }
    _clone() {
        const fragment = document.importNode(this.template.element.content, true);
        if (this.template.parts.length > 0) {
            const walker = document.createTreeWalker(fragment, 5 /* elements & text */);
            const parts = this.template.parts;
            let index = 0;
            let partIndex = 0;
            let templatePart = parts[0];
            let node = walker.nextNode();
            while (node != null && partIndex < parts.length) {
                if (index === templatePart.index) {
                    this._parts.push(this._partCallback(this, templatePart, node));
                    templatePart = parts[++partIndex];
                }
                else {
                    index++;
                    node = walker.nextNode();
                }
            }
        }
        return fragment;
    }
}

const TAG = Symbol('tag');
const NEEDSRENDER = Symbol('needsRender');
const SHADYTEMPLATE = Symbol('shadyTemplate');

const applyShadyCSS = element => {
  if (window.ShadyCSS) {
    const klass = element.constructor;
    if (klass[SHADYTEMPLATE] === undefined) {
      klass[SHADYTEMPLATE] = document.createElement('template');
      klass[SHADYTEMPLATE].innerHTML = element.shadowRoot.innerHTML;
      ShadyCSS.prepareTemplate(klass[SHADYTEMPLATE], klass.is);
    }
    ShadyCSS.styleElement(element);
  }
};

const camelToKebab = function(camel) {
  return camel.replace(/([a-z])([A-Z])|(.)([A-Z][a-z])/g, '$1$3-$2$4').toLowerCase();
};

const createIdCache = function(element) {
  element.$ = {};
  element.shadowRoot.querySelectorAll('[id]').forEach(el => {
    element.$[el.id] = el;
  });
};

class GluonElement extends HTMLElement {
  static get is() {
    return (this.hasOwnProperty(TAG) && this[TAG]) || (this[TAG] = camelToKebab(this.name));
  }
  connectedCallback() {
    if ('template' in this) {
      this.attachShadow({ mode: 'open' });
      this.render({ sync: true });
      createIdCache(this);
    }
  }
  // Render the element's template.
  // By default, renders are asynchronous and executed at the next microtask timing,
  // so multiple render calls are batched.
  // If the sync option is set to `true`, it renders synchronously instead.
  // Returns a Promise that resolves when the render is completed.
  async render({ sync = false } = {}) {
    this[NEEDSRENDER] = true;
    if (!sync) {
      await 0;
    }
    if (this[NEEDSRENDER]) {
      this[NEEDSRENDER] = false;
      render(this.template, this.shadowRoot);
      applyShadyCSS(this);
    }
  }
}

let routingEnabled=!1;const routeChangeCallbacks=[];const onRouteChange=(a)=>{routingEnabled||(window.addEventListener('hashchange',notifyRouteChange),window.addEventListener('location-changed',notifyRouteChange),window.addEventListener('popstate',notifyRouteChange),document.body.addEventListener('click',globalClickHandler),routingEnabled=!0),routeChangeCallbacks.push(a);};const globalClickHandler=(a)=>{if(!a.defaultPrevented){const b=getSameOriginLinkHref(a);b&&(a.preventDefault(),b===window.location.href||(window.history.pushState({},'',b),window.dispatchEvent(new Event('location-changed'))));}}; const getSameOriginLinkHref=(a)=>{if(0!==a.button)return null;if(a.metaKey||a.ctrlKey)return null;const b=a.path||a.composedPath&&a.composedPath();let c=null;for(var d,e=0;e<b.length;e++)if(d=b[e],'A'===d.tagName&&d.href){c=d;break}if(!c)return null;if('_blank'===c.target)return null;if(('_top'===c.target||'_parent'===c.target)&&window.top!==window)return null;const f=c.href,g=resolveURL(f,document.baseURI);let h;if(h=g.origin?g.origin:g.protocol+'//'+g.host,h!==window.location.origin)return null;let i=g.pathname+g.search+g.hash;return'/'!==i[0]&&(i='/'+i),resolveURL(i,window.location.href).href}; const notifyRouteChange=()=>{routeChangeCallbacks.forEach((a)=>a(currentPath(),currentQuery(),currentHash()));};const currentPath=()=>window.decodeURIComponent(window.location.pathname);const currentQuery=()=>window.location.search.slice(1);const currentHash=()=>window.decodeURIComponent(window.location.hash.slice(1));let workingURL; let resolveDoc;const resolveURL=(a,b)=>{if(null===b&&(b=void 0),void 0==workingURL){workingURL=!1;try{const a=new URL('b','http://a');a.pathname='c%20d',workingURL='http://a/c%20d'===a.href,workingURL=workingURL&&'http://a/?b%20c'===new URL('http://a/?b c').href;}catch(a){}}return workingURL?new URL(a,b):(resolveDoc||(resolveDoc=document.implementation.createHTMLDocument('temp'),resolveDoc.base=resolveDoc.createElement('base'),resolveDoc.head.appendChild(resolveDoc.base),resolveDoc.anchor=resolveDoc.createElement('a')),resolveDoc.base.href=b,resolveDoc.anchor.href=a,resolveDoc.anchor)};

/* Font Face Observer v2.0.13 - © Bram Stein. License: BSD-3-Clause */(function(){function l(a,b){document.addEventListener?a.addEventListener("scroll",b,!1):a.attachEvent("scroll",b);}function m(a){document.body?a():document.addEventListener?document.addEventListener("DOMContentLoaded",function c(){document.removeEventListener("DOMContentLoaded",c);a();}):document.attachEvent("onreadystatechange",function k(){if("interactive"==document.readyState||"complete"==document.readyState)document.detachEvent("onreadystatechange",k),a();});}function r(a){this.a=document.createElement("div");this.a.setAttribute("aria-hidden","true");this.a.appendChild(document.createTextNode(a));this.b=document.createElement("span");this.c=document.createElement("span");this.h=document.createElement("span");this.f=document.createElement("span");this.g=-1;this.b.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
this.f.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText="display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c);}
function t(a,b){a.a.style.cssText="max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:"+b+";";}function y(a){var b=a.a.offsetWidth,c=b+100;a.f.style.width=c+"px";a.c.scrollLeft=c;a.b.scrollLeft=a.b.scrollWidth+100;return a.g!==b?(a.g=b,!0):!1}function z(a,b){function c(){var a=k;y(a)&&a.a.parentNode&&b(a.g);}var k=a;l(a.b,c);l(a.c,c);y(a);}function A(a,b){var c=b||{};this.family=a;this.style=c.style||"normal";this.weight=c.weight||"normal";this.stretch=c.stretch||"normal";}var B=null,C=null,E=null,F=null;function G(){if(null===C)if(J()&&/Apple/.test(window.navigator.vendor)){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);C=!!a&&603>parseInt(a[1],10);}else C=!1;return C}function J(){null===F&&(F=!!document.fonts);return F}
function K(){if(null===E){var a=document.createElement("div");try{a.style.font="condensed 100px sans-serif";}catch(b){}E=""!==a.style.font;}return E}function L(a,b){return[a.style,a.weight,K()?a.stretch:"","100px",b].join(" ")}
A.prototype.load=function(a,b){var c=this,k=a||"BESbswy",q=0,D=b||3E3,H=(new Date).getTime();return new Promise(function(a,b){if(J()&&!G()){var M=new Promise(function(a,b){function e(){(new Date).getTime()-H>=D?b():document.fonts.load(L(c,'"'+c.family+'"'),k).then(function(c){1<=c.length?a():setTimeout(e,25);},function(){b();});}e();}),N=new Promise(function(a,c){q=setTimeout(c,D);});Promise.race([N,M]).then(function(){clearTimeout(q);a(c);},function(){b(c);});}else m(function(){function u(){var b;if(b=-1!=
f&&-1!=g||-1!=f&&-1!=h||-1!=g&&-1!=h)(b=f!=g&&f!=h&&g!=h)||(null===B&&(b=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),B=!!b&&(536>parseInt(b[1],10)||536===parseInt(b[1],10)&&11>=parseInt(b[2],10))),b=B&&(f==v&&g==v&&h==v||f==w&&g==w&&h==w||f==x&&g==x&&h==x)),b=!b;b&&(d.parentNode&&d.parentNode.removeChild(d),clearTimeout(q),a(c));}function I(){if((new Date).getTime()-H>=D)d.parentNode&&d.parentNode.removeChild(d),b(c);else{var a=document.hidden;if(!0===a||void 0===a)f=e.a.offsetWidth,
g=n.a.offsetWidth,h=p.a.offsetWidth,u();q=setTimeout(I,50);}}var e=new r(k),n=new r(k),p=new r(k),f=-1,g=-1,h=-1,v=-1,w=-1,x=-1,d=document.createElement("div");d.dir="ltr";t(e,L(c,"sans-serif"));t(n,L(c,"serif"));t(p,L(c,"monospace"));d.appendChild(e.a);d.appendChild(n.a);d.appendChild(p.a);document.body.appendChild(d);v=e.a.offsetWidth;w=n.a.offsetWidth;x=p.a.offsetWidth;I();z(e,function(a){f=a;u();});t(e,L(c,'"'+c.family+'",sans-serif'));z(n,function(a){g=a;u();});t(n,L(c,'"'+c.family+'",serif'));
z(p,function(a){h=a;u();});t(p,L(c,'"'+c.family+'",monospace'));});})};"object"===typeof module?module.exports=A:(window.FontFaceObserver=A,window.FontFaceObserver.prototype.load=A.prototype.load);}());

const registeredElements={}; const handleKeydown=(a)=>a.defaultPrevented?void console.warn('Keypress ignored!'):void(registeredElements[a.key]&&registeredElements[a.key].every((b)=>{if(null!==b.offsetParent)return a.stopPropagation(),b.click(),!b.override}));window.addEventListener('keydown',handleKeydown,!0);class GluonKeybinding extends GluonElement{static get observedAttributes(){return['key','override']}attributeChangedCallback(a,b,c){'key'===a&&this.__register(c,b),'override'===a&&this.__override(this.key);}set key(a){a?this.setAttribute('key',a):this.removeAttribute('key');}get key(){return this.getAttribute('key')}set override(a){a?this.setAttribute('override',''):this.removeAttribute('override');}get override(){return''===this.getAttribute('override')}__register(a,b){if(b&&registeredElements[b]){const a=registeredElements[b].indexOf(this);-1!=a&&(registeredElements[b].splice(a,1),0===registeredElements[b].length&&delete registeredElements[b]);}a&&(!registeredElements[a]&&(registeredElements[a]=[]),this.override?registeredElements[a].unshift(this):registeredElements[a].push(this));}__override(a){if(a&&registeredElements[a]){const b=registeredElements[a].indexOf(this);-1!=b&&(registeredElements[a].splice(b,1),registeredElements[a].unshift(this));}}}customElements.define(GluonKeybinding.is,GluonKeybinding);

const styleText = document.createTextNode(`
  /* SLIDEM GLOBAL STYLES */
  body {
    margin: 0;
  }


  [reveal] {
    opacity: 0;
    transition: opacity 0.2s;
  }

  /* Keyframes are defined here to patch a scoping bug in Chrome */
  @keyframes slidem-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slidem-fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slidem-slide-in-forward {
    from {
      transform: translateX(100vw);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slidem-slide-in-backward {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100vw);
    }
  }

  @keyframes slidem-slide-out-forward {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100vw);
    }
  }

  @keyframes slidem-slide-out-backward {
    from {
      transform: translateX(-100vw);
    }
    to {
      transform: translateX(0);
    }
  }
`);

const styleNode = document.createElement('style');
styleNode.appendChild(styleText);
document.head.appendChild(styleNode);

class SlidemDeck extends GluonElement {
  get template() {
    return html`
      <div class="slides">
        <slot id="slides"></slot>
      </div>
      <div id="progress"></div>
      <div id="timer"></div>
      <gluon-keybinding id="timerToggle" key="t"></gluon-keybinding>
      <gluon-keybinding id="presenterToggle" key="p"></gluon-keybinding>
      <div id="forward">
        <gluon-keybinding key="PageDown"></gluon-keybinding>
        <gluon-keybinding key="ArrowRight"></gluon-keybinding>
      </div>
      <div id="backward">
        <gluon-keybinding key="PageUp"></gluon-keybinding>
        <gluon-keybinding key="ArrowLeft"></gluon-keybinding>
      </div>
      <style>
        @keyframes slidem-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slidem-fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes slidem-slide-in-forward {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slidem-slide-in-backward {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100vw);
          }
        }

        @keyframes slidem-slide-out-forward {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100vw);
          }
        }

        @keyframes slidem-slide-out-backward {
          from {
            transform: translateX(-100vw);
          }
          to {
            transform: translateX(0);
          }
        }
        :host {
          display: block;
          overflow: hidden;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          font-family: 'sans-serif';
          font-size: 56px;
          line-height: 1;
        }

        .slides ::slotted(*) {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          animation-duration: 0.4s;
          animation-fill-mode: both;
          animation-timing-function: ease-in-out;
        }

        .slides ::slotted(:not([active]):not([previous]):not([next])) {
          display: none;
        }

        :host(:not([presenter])) .slides ::slotted([next]:not([previous])) {
          display: none;
        }

        #progress {
          position: absolute;
          bottom: 0px;
          left: 0;
          right: 0;
          height: 50px;
          text-align: center;
          display: flex;
          flex-flow: row;
          justify-content: center;
          z-index: 10;
        }
        #progress div {
          height: 8px;
          width: 8px;
          border-radius: 50%;
          border: 2px solid white;
          margin-left: 6px;
          margin-right: 6px;
          background: transparent;
          transition: background 0.2s, transform 0.2s;
        }
        #progress div.active {
          background: white;
          transform: scale(1.3);
        }
        :host([progress="dark"]) #progress div {
          border: 2px solid black;
        }
        :host([progress="dark"]) #progress div.active {
          background: black;
        }
        :host([progress="none"]) #progress {
          display: none;
        }

        #timer {
          display: none;
          position: absolute;
          top: 5%;
          right: 5%;
          color: white;
          font-size: 4vw;
          font-weight: bold;
          font-family: Helvetica, Arial, sans-serif;
        }
        :host([presenter]) #timer {
          display: inline;
        }

        :host([presenter]) {
          background: black;
        }
        /* White box around active slide */
        :host([presenter])::before {
          display: block;
          position: absolute;
          content: '';
          top: calc(25% - 20px);
          right:  calc(45% - 20px);
          bottom:  calc(25% - 20px);
          left:  calc(5% - 20px);
          border: 2px solid white;
        }
        /* White box around next slide */
        :host([presenter])::after {
          display: block;
          position: absolute;
          content: '';
          top: calc(32.5% - 20px);
          right: calc(4.5% - 20px);
          bottom: calc(32.5% - 20px);
          left: calc(60.5% - 20px);
          border: 2px solid white;
        }
        :host([presenter]) .slides ::slotted(*) {
          animation: none !important; /* Block user-configured animations */
        }
        :host([presenter]) .slides ::slotted([previous]:not([next])) {
          display: none;
        }
        :host([presenter]) .slides ::slotted([active]) {
          transform: translate(-20%, 0) scale(0.5) !important; /* Force presenter layout */
        }
        :host([presenter]) .slides ::slotted([next]) {
          transform: translate(28%, 0) scale(0.35) !important; /* Force presenter layout */
        }

        .slides ::slotted([active]) {
          z-index: 2;
        }
        .slides ::slotted([previous]) {
          z-index: 0;
        }
        .slides ::slotted([fade-in][active].animate-forward) {
          animation-name: slidem-fade-in;
        }
        .slides ::slotted([fade-in][previous].animate-backward) {
          animation-name: slidem-fade-out;
          z-index: 3;
        }
        .slides ::slotted([fade-out][active].animate-backward) {
          animation-name: slidem-fade-in;
        }
        .slides ::slotted([fade-out][previous].animate-forward) {
          animation-name: slidem-fade-out;
          z-index: 3;
        }
        .slides ::slotted([slide-in][active].animate-forward) {
          animation-name: slidem-slide-in-forward;
        }
        .slides ::slotted([slide-in][previous].animate-backward) {
          animation-name: slidem-slide-in-backward;
          z-index: 3;
        }
        .slides ::slotted([slide-out][active].animate-backward) {
          animation-name: slidem-slide-out-backward;
        }
        .slides ::slotted([slide-out][previous].animate-forward) {
          animation-name: slidem-slide-out-forward;
          z-index: 3;
        }
      </style>
    `;
  }

  get presenter() {
    return this.getAttribute('presenter') !== null;
  }

  set presenter(value) {
    if (value) {
      this.setAttribute('presenter', '');
    } else {
      this.removeAttribute('presenter');
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.presenter = currentQuery() === 'presenter';
    this.$.presenterToggle.addEventListener('click', () => {
      this.presenter = !this.presenter;
      changeLocation({ query: (this.presenter && 'presenter') || '', hash: currentHash() });
    });

    // Presenter mode timer
    let timerInterval;
    this.$.timerToggle.addEventListener('click', () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
        this.$.timer.innerText = '';
      } else {
        this.$.timer.innerText = '00:00';
        let begin = new Date();
        timerInterval = setInterval(() => (this.$.timer.innerText = __timer(begin)), 1000);
      }
    });

    this.slides = Array.from(this.children);

    // Create dots for progress bar
    this.slides.forEach(slide => {
      this.$.progress.appendChild(document.createElement('div'));
    });

    onRouteChange(() => {
      this.slides[this.currentSlide].step = this.currentStep + 1;
      this.slides[this.currentSlide].setAttribute('active', '');

      if (this.previousSlide === this.currentSlide) {
        return;
      }

      if (this.previousSlide !== undefined) {
        if (this.previousSlide < this.currentSlide) {
          this.slides[this.previousSlide].classList.add('animate-forward');
          this.slides[this.currentSlide].classList.add('animate-forward');
          this.slides[this.previousSlide].classList.remove('animate-backward');
          this.slides[this.currentSlide].classList.remove('animate-backward');
        } else {
          this.slides[this.previousSlide].classList.add('animate-backward');
          this.slides[this.currentSlide].classList.add('animate-backward');
          this.slides[this.previousSlide].classList.remove('animate-forward');
          this.slides[this.currentSlide].classList.remove('animate-forward');
        }
      }

      if (this.oldNextSlide !== undefined) {
        this.slides[this.oldNextSlide].removeAttribute('next');
      }

      this.nextSlide = (this.slides[this.currentSlide + 1] && this.currentSlide + 1) || undefined;
      if (this.nextSlide !== undefined) {
        this.slides[this.nextSlide].setAttribute('next', '');
        this.oldNextSlide = this.nextSlide;
      }

      if (this.oldPreviousSlide !== undefined) {
        this.slides[this.oldPreviousSlide].removeAttribute('previous');
      }

      if (this.previousSlide !== undefined) {
        this.slides[this.previousSlide].removeAttribute('active');
        this.slides[this.previousSlide].setAttribute('previous', '');
        this.$.progress.children[this.previousSlide].classList.remove('active');
        this.oldPreviousSlide = this.previousSlide;
      }

      this.$.progress.children[this.currentSlide].classList.add('active');

      this.previousSlide = this.currentSlide;
    });

    const changeLocation = ({ path = currentPath(), query = currentQuery(), hash = currentHash() } = {}) => {
      path = window.history.pushState({}, '', `${path}${(query && '?' + query) || ''}${(hash && '#' + hash) || ''}`);
      window.dispatchEvent(new Event('location-changed'));
      localStorage.setItem('location', currentHash());
    };

    this.$.forward.onclick = () => {
      if (this.slides[this.currentSlide].steps && this.slides[this.currentSlide].step <= this.slides[this.currentSlide].steps) {
        changeLocation({ hash: `slide-${this.currentSlide + 1}/step-${this.slides[this.currentSlide].step + 1}` });
      } else if (this.currentSlide < this.slides.length - 1) {
        changeLocation({ hash: `slide-${this.currentSlide + 2}/step-1` });
      }
    };

    this.$.backward.onclick = () => {
      if (this.slides[this.currentSlide].steps && this.slides[this.currentSlide].step > 1) {
        changeLocation({ hash: `slide-${this.currentSlide + 1}/step-${this.slides[this.currentSlide].step - 1}` });
      } else if (this.currentSlide > 0) {
        changeLocation({ hash: `slide-${this.currentSlide}/step-${(this.slides[this.currentSlide - 1].steps || 0) + 1}` });
      }
    };

    // Swipe gesture support
    let touchX;
    let touchY;
    document.addEventListener(
      'touchstart',
      e => {
        touchX = e.touches[0].clientX;
        touchY = e.touches[0].clientY;
      },
      false
    );
    document.addEventListener(
      'touchend',
      e => {
        const xMove = e.changedTouches[0].clientX - touchX;
        const yMove = e.changedTouches[0].clientY - touchY;
        if (Math.abs(xMove) > 60 && Math.abs(xMove) > Math.abs(yMove)) {
          if (xMove < 0) {
            this.$.forward.onclick();
          } else {
            this.$.backward.onclick();
          }
        }
      },
      false
    );

    // FUOC prevention
    this.removeAttribute('loading');

    // Trigger the router to display the first slide
    const init = () => {
      window.requestAnimationFrame(() => window.dispatchEvent(new Event('location-changed')));
    };

    const font = this.getAttribute('font');
    if (font) {
      this.style.fontFamily = font;
    }

    // Trigger the init after all fonts are loaded or after 3 sec timeout.
    Promise.all(
      this.slides
        .filter(slide => slide.fonts)
        .map(slide => slide.fonts)
        .reduce((fonts, slideFonts) => fonts.concat(slideFonts), (font && [font]) || [])
        .map(font => new FontFaceObserver(font).load())
    ).then(init, init);

    // Shared navigation between browser windows
    window.addEventListener('storage', e => {
      if (e.key === 'location') {
        if (currentHash() !== e.newValue) {
          changeLocation({ hash: `${e.newValue}` });
        }
      }
    });
  }

  get currentSlide() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1] || 1) - 1;
  }
  get currentStep() {
    return (currentHash().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2] || 1) - 1;
  }
}

// Returns a string representing elapsed time since 'begin'
const __timer = begin => {
  const time = new Date(new Date() - begin);
  const pad = t => (t < 10 && '0' + t) || t;
  const hours = pad(time.getUTCHours());
  const minutes = pad(time.getUTCMinutes());
  const seconds = pad(time.getUTCSeconds());
  return `${(time.getUTCHours() && hours + ':') || ''}${minutes}:${seconds}`;
};

customElements.define(SlidemDeck.is, SlidemDeck);

const styleText$2 = document.createTextNode(`
  /* SLIDEM SLIDE GLOBAL STYLES */

  [reveal] {
    opacity: 0;
    transition: opacity 0.2s;
  }
`);

const styleNode$2 = document.createElement('style');
styleNode$2.appendChild(styleText$2);
document.head.appendChild(styleNode$2);

const slidemStyle = html`
  <style>
    :host {
      overflow: hidden;
      justify-content: center;
      align-items: center;
      background-size: cover;
      display: flex;
    }

    :host([zoom-in]) #content, :host([zoom-out]) #content {
      animation-duration: 0.4s;
      animation-fill-mode: both;
      animation-timing-function: ease-in-out;
    }

    @keyframes zoom-in {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(var(--slidem-content-scale, 1));
      }
    }

    @keyframes zoom-out {
      from {
        opacity: 1;
        transform: scale(var(--slidem-content-scale, 1));
      }
      to {
        opacity: 0;
        transform: scale(0);
      }
    }

    :host([zoom-in][active].animate-forward) #content {
      animation-name: zoom-in;
    }

    :host([zoom-in][previous].animate-backward) #content {
      animation-name: zoom-out;
    }

    :host([zoom-out][previous].animate-forward) #content {
      animation-name: zoom-out;
    }

    :host([zoom-out][active].animate-backward) #content {
      animation-name: zoom-in;
    }

    #content {
      width: var(--slidem-content-width, 1760px);
      max-height: var(--slidem-content-height, 990px);
      flex-shrink: 0;
    }

    :host(:not([center])) #content {
      height: var(--slidem-content-height, 990px);
    }
  </style>
`;

class SlidemSlideBase extends GluonElement {
  get template() {
    if (this.getAttribute('fullscreen') !== null || this.constructor.fullscreen) {
      return html`
        ${slidemStyle}
        ${(this.constructor.name !== 'SlidemSlide' && this.content) || html`<slot id="slot"></slot>`}
      `;
    } else {
      return html`
        ${slidemStyle}
        <div id="content">
          ${(this.constructor.name !== 'SlidemSlide' && this.content) || html`<slot id="slot"></slot>`}
        </div>
      `;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._steps = Array.from(this.querySelectorAll('[reveal]'));
    this.steps = this._steps.length;
    this.__resizeContent();
    let resizeTimeout;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.__resizeContent();
      }, 200);
    });
  }

  static get observedAttributes() {
    return ['step'];
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    if (attr === 'step') {
      const step = Number(newVal);
      if (step > this.steps + 1) {
        this.setAttribute('step', this.steps + 1);
        return;
      }
      this.__setStep(step);
    }
  }

  set step(step) {
    this.setAttribute('step', step);
  }

  get step() {
    return Number(this.getAttribute('step')) || 1;
  }

  __setStep(newStep) {
    this._steps.forEach((step, i) => {
      if (i < newStep - 1) {
        step.style.opacity = 1;
      } else {
        step.style.opacity = 0;
      }
    });
  }

  __resizeContent() {
    const width = Number((window.getComputedStyle(document.documentElement).getPropertyValue('--slidem-content-width') || '1760px').slice(0, -2));
    const height = Number((window.getComputedStyle(document.documentElement).getPropertyValue('--slidem-content-height') || '990px').slice(0, -2));
    const scale = Math.min(window.innerHeight / height, window.innerWidth / 1.1 / width);
    if (scale < 1) {
      document.documentElement.style.setProperty('--slidem-content-scale', scale);
      this.$.content && (this.$.content.style.transform = `scale(${scale})`);
    } else {
      document.documentElement.style.setProperty('--slidem-content-scale', 1);
      this.$.content && (this.$.content.style.transform = `scale(1)`);
    }
  }
}

customElements.define(SlidemSlideBase.is, SlidemSlideBase);

const styleText$1 = document.createTextNode(`
  /* SLIDEM BASIC SLIDE STYLE */
  slidem-slide h1,
  slidem-slide h2,
  slidem-slide h3,
  slidem-slide h4,
  slidem-slide h5,
  slidem-slide h6,
  slidem-slide p {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  slidem-slide a {
    color: inherit;
    text-decoration: none;
  }
`);

const styleNode$1 = document.createElement('style');
styleNode$1.appendChild(styleText$1);
document.head.appendChild(styleNode$1);

class SlidemSlide extends SlidemSlideBase {
  connectedCallback() {
    super.connectedCallback();
    const background = this.getAttribute('background');
    if (background) {
      if (background.match(/^--[a-zA-Z-]*$/)) {
        this.style.background = `var(${background})`;
      } else if (background.match(/^http/) || background.match(/^\//)) {
        const darken = this.getAttribute('darken-background');
        let image = `url(${background})`;
        if (darken) {
          image = `linear-gradient(rgba(0,0,0,${darken}), rgba(0,0,0,${darken})), ${image}`;
        }
        this.style.backgroundImage = image;
      } else {
        this.style.background = background;
      }
    }

    this.textNodes = Array.from(this.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, span'));
    this.textNodes.forEach(textNode => {
      if (textNode.getAttribute('font-size') !== null) {
        textNode.style.fontSize = textNode.getAttribute('font-size');
      }
      if (textNode.getAttribute('bold') !== null) {
        textNode.style.fontWeight = 'bold';
      }
      if (textNode.getAttribute('underline') !== null) {
        textNode.style.textDecoration = 'underline';
      }
      if (textNode.getAttribute('italic') !== null) {
        textNode.style.fontStyle = 'italic';
      }
      if (textNode.getAttribute('uppercase') !== null) {
        textNode.style.textTransform = 'uppercase';
      }
      if (textNode.getAttribute('center') !== null) {
        textNode.style.textAlign = 'center';
      }
      if (textNode.getAttribute('line-height') !== null) {
        textNode.style.lineHeight = textNode.getAttribute('line-height');
      }
      const color = textNode.getAttribute('color');
      if (color !== null) {
        if (color.match(/^--[a-zA-Z-]*$/)) {
          textNode.style.color = `var(${color})`;
        } else {
          textNode.style.color = color;
        }
      }
    });

    this.layoutNodes = Array.from(this.querySelectorAll('div'));
    this.layoutNodes.forEach(layoutNode => {
      if (layoutNode.getAttribute('center') !== null) {
        layoutNode.style.display = 'flex';
        layoutNode.style.justifyContent = 'center';
        layoutNode.style.alignItems = 'center';
      }
    });
  }

  static get observedAttributes() {
    const attrs = super.observedAttributes || [];
    Array.prototype.push.apply(attrs, ['active', 'next']);
    return attrs;
  }

  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(attr, oldVal, newVal);
    if (attr === 'active' || attr === 'next') {
      if (newVal !== null) {
        this.__rescale();
      }
    }
  }

  __rescale() {
    requestAnimationFrame(() => {
      this.textNodes.forEach(textNode => {
        if (textNode.getAttribute('fit') !== null) {
          textNode.style.display = 'table';
          textNode.style.whiteSpace = 'nowrap';
          const refFontSize = parseFloat(window.getComputedStyle(textNode, null).getPropertyValue('font-size'));
          const refWidth = this.$.content.clientWidth;
          textNode.style.fontSize = `${Math.floor(refFontSize * refWidth / textNode.clientWidth)}px`;
        }
      });
    });
  }
}

customElements.define(SlidemSlide.is, SlidemSlide);

const styleText$3 = document.createTextNode(`
  /* POLYMER OPENING SLIDE GLOBAL STYLES */
  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 400;
    src: local('Roboto'), local('Roboto-Regular'), url(https://fonts.gstatic.com/s/roboto/v16/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;
  }

  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    src: local('Roboto Medium'), local('Roboto-Medium'), url(https://fonts.gstatic.com/s/roboto/v16/RxZJdnzeo3R5zSexge8UUZBw1xU1rKptJj_0jans920.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;
  }

  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    src: local('Roboto Bold'), local('Roboto-Bold'), url(https://fonts.gstatic.com/s/roboto/v16/d-6IYplOFocCacKzxwXSOJBw1xU1rKptJj_0jans920.woff2) format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;
  }
`);

const styleNode$3 = document.createElement('style');
styleNode$3.appendChild(styleText$3);
document.head.appendChild(styleNode$3);

class SlidemPolymersummitSlide extends SlidemSlideBase {
  get fonts() {
    return ['Roboto'];
  }
  get template() {
    this.content = html`
      <div class="introSlide">
        <div class="side">
          <div class="avatar"><slot name="avatar"></slot></div>
          <div class="speakerDetails">
            <slot name="speaker"></slot>
            <div>
              <slot name="email"></slot>
            </div>
            <div>
              <slot name="twitter"></slot>
            </div>
          </div>
          <div class="logo">
            <slot name="logo"></slot>
          </div>
        </div>
        <div class="event">
          <slot name="event"></slot>
        </div>
        <slot name="title"></slot>
        <slot name="subtitle"></slot>
      </div>
    `;

    return html`
      <style>
        :host {
          background: #2e9be6;
          font-family: 'Roboto';
        }
        .introSlide {
          overflow: hidden;
          border-bottom: 3px solid white;
          color: white;
          position: relative;
          height: 100%;
        }

        .topShade {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 34px;
          background: rgba(0, 0, 0, 0.2);
        }

        .introSlide .event {
          position: absolute;
          bottom: 26px;
          left: 0;
        }

        .introSlide .event ::slotted([slot="event"]) {
          margin: 0;
          font-size: 24px;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .introSlide .side {
          position: absolute;
          right: 0;
          width: 340px;
          height: 100%;
          display: flex;
          flex-flow: column;
          justify-content: flex-end;
        }

        .introSlide .side * {
          flex-shrink: 0;
        }

        .introSlide .avatar {
          height: 340px;
          width: 340px;
          border-radius: 50%;
          overflow: hidden;
          margin-bottom: 56px;
        }

        .introSlide ::slotted([slot="avatar"]) {
          max-width: 340px;
        }

        .introSlide .speakerDetails {
          border-top: 3px solid white;
          padding-top: 50px;
          padding-bottom: 30px;
        }


        .introSlide .speakerDetails ::slotted([slot="speaker"]) {
          font-weight: 400;
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 32px;
          letter-spacing: 1px;
        }

        .introSlide .speakerDetails div {
          margin-bottom: 20px;
        }

        .introSlide .speakerDetails div ::slotted([slot="email"]),
        .introSlide .speakerDetails div ::slotted([slot="twitter"]) {
          color: white;
          font-weight: 500;
          font-size: 28px;
          letter-spacing: 1px;
        }

        .introSlide .logo {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 260px;
          background-color: white;
        }

        .introSlide .logo ::slotted([slot="logo"]) {
          max-height: 200px;
          max-width: 300px;
          background-position: center;
          background-size: contain;
        }

        .introSlide ::slotted([slot="title"]) {
          margin-top: 190px;
          margin-bottom: 0;
          font-weight: 500;
          font-size: 150px;
          color: white;
          letter-spacing: 2px;
        }

        .introSlide ::slotted([slot="subtitle"]) {
          display: inline-block;
          margin-top: 40px;
          font-weight: 400;
          font-size: 100px;
          letter-spacing: 2px;
          color: white;
          padding-top: 40px;
          border-top: 3px solid white;
        }
      </style>
      <div class="topShade"></div>
      ${super.template}
    `;
  }
}

customElements.define(SlidemPolymersummitSlide.is, SlidemPolymersummitSlide);

class SlidemVideoSlide extends SlidemSlideBase {
  get template() {
    this.content = html`
      <video controls id="video"></video>
    `;

    return html`
      <style>
        :host {
          background: black;
          color: white;
        }

        video {
          width: 100%;
          max-height: 100%;
          max-width: 100%;
        }
      </style>
      ${super.template}
    `;
  }
  connectedCallback() {
    super.connectedCallback();
    this.$.video.src = this.getAttribute('video');
    this.$.video.muted = this.getAttribute('muted') !== null;
  }

  static get observedAttributes() {
    const attrs = super.observedAttributes || [];
    Array.prototype.push.apply(attrs, ['active']);
    return attrs;
  }
  attributeChangedCallback(attr, oldVal, newVal) {
    super.attributeChangedCallback(attr, oldVal, newVal);
    if (attr === 'active') {
      if (newVal !== null) {
        this.$.video.currentTime = 0;
        this.$.video.play();
      } else {
        this.$.video.pause();
      }
    }
  }
}

customElements.define(SlidemVideoSlide.is, SlidemVideoSlide);

}());
