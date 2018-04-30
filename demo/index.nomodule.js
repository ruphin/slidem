(function () {
  'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var asyncToGenerator = function (fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var taggedTemplateLiteral = function (strings, raw) {
    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }));
  };

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
  var templateCaches = new Map();
  /**
   * The return type of `html`, which holds a Template and the values from
   * interpolated expressions.
   */
  var TemplateResult = function () {
      function TemplateResult(strings, values, type) {
          var partCallback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultPartCallback;
          classCallCheck(this, TemplateResult);

          this.strings = strings;
          this.values = values;
          this.type = type;
          this.partCallback = partCallback;
      }
      /**
       * Returns a string of HTML used to create a <template> element.
       */


      createClass(TemplateResult, [{
          key: 'getHTML',
          value: function getHTML() {
              var l = this.strings.length - 1;
              var html = '';
              var isTextBinding = true;
              for (var i = 0; i < l; i++) {
                  var s = this.strings[i];
                  html += s;
                  // We're in a text position if the previous string closed its tags.
                  // If it doesn't have any tags, then we use the previous text position
                  // state.
                  var closing = findTagClose(s);
                  isTextBinding = closing > -1 ? closing < s.length : isTextBinding;
                  html += isTextBinding ? nodeMarker : marker;
              }
              html += this.strings[l];
              return html;
          }
      }, {
          key: 'getTemplateElement',
          value: function getTemplateElement() {
              var template = document.createElement('template');
              template.innerHTML = this.getHTML();
              return template;
          }
      }]);
      return TemplateResult;
  }();
  /**
   * A TemplateResult for SVG fragments.
   *
   * This class wraps HTMl in an <svg> tag in order to parse its contents in the
   * SVG namespace, then modifies the template to remove the <svg> tag so that
   * clones only container the original fragment.
   */
  var SVGTemplateResult = function (_TemplateResult) {
      inherits(SVGTemplateResult, _TemplateResult);

      function SVGTemplateResult() {
          classCallCheck(this, SVGTemplateResult);
          return possibleConstructorReturn(this, (SVGTemplateResult.__proto__ || Object.getPrototypeOf(SVGTemplateResult)).apply(this, arguments));
      }

      createClass(SVGTemplateResult, [{
          key: 'getHTML',
          value: function getHTML() {
              return '<svg>' + get(SVGTemplateResult.prototype.__proto__ || Object.getPrototypeOf(SVGTemplateResult.prototype), 'getHTML', this).call(this) + '</svg>';
          }
      }, {
          key: 'getTemplateElement',
          value: function getTemplateElement() {
              var template = get(SVGTemplateResult.prototype.__proto__ || Object.getPrototypeOf(SVGTemplateResult.prototype), 'getTemplateElement', this).call(this);
              var content = template.content;
              var svgElement = content.firstChild;
              content.removeChild(svgElement);
              reparentNodes(content, svgElement.firstChild);
              return template;
          }
      }]);
      return SVGTemplateResult;
  }(TemplateResult);
  /**
   * The default TemplateFactory which caches Templates keyed on
   * result.type and result.strings.
   */
  function defaultTemplateFactory(result) {
      var templateCache = templateCaches.get(result.type);
      if (templateCache === undefined) {
          templateCache = new Map();
          templateCaches.set(result.type, templateCache);
      }
      var template = templateCache.get(result.strings);
      if (template === undefined) {
          template = new Template(result, result.getTemplateElement());
          templateCache.set(result.strings, template);
      }
      return template;
  }
  /**
   * Renders a template to a container.
   *
   * To update a container with new values, reevaluate the template literal and
   * call `render` with the new result.
   *
   * @param result a TemplateResult created by evaluating a template tag like
   *     `html` or `svg.
   * @param container A DOM parent to render to. The entire contents are either
   *     replaced, or efficiently updated if the same result type was previous
   *     rendered there.
   * @param templateFactory a function to create a Template or retreive one from
   *     cache.
   */
  function render(result, container) {
      var templateFactory = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultTemplateFactory;

      var template = templateFactory(result);
      var instance = container.__templateInstance;
      // Repeat render, just call update()
      if (instance !== undefined && instance.template === template && instance._partCallback === result.partCallback) {
          instance.update(result.values);
          return;
      }
      // First render, create a new TemplateInstance and append it
      instance = new TemplateInstance(template, result.partCallback, templateFactory);
      container.__templateInstance = instance;
      var fragment = instance._clone();
      instance.update(result.values);
      removeNodes(container, container.firstChild);
      container.appendChild(fragment);
  }
  /**
   * An expression marker with embedded unique key to avoid collision with
   * possible text in templates.
   */
  var marker = '{{lit-' + String(Math.random()).slice(2) + '}}';
  /**
   * An expression marker used text-posisitions, not attribute positions,
   * in template.
   */
  var nodeMarker = '<!--' + marker + '-->';
  var markerRegex = new RegExp(marker + '|' + nodeMarker);
  /**
   * This regex extracts the attribute name preceding an attribute-position
   * expression. It does this by matching the syntax allowed for attributes
   * against the string literal directly preceding the expression, assuming that
   * the expression is in an attribute-value position.
   *
   * See attributes in the HTML spec:
   * https://www.w3.org/TR/html5/syntax.html#attributes-0
   *
   * "\0-\x1F\x7F-\x9F" are Unicode control characters
   *
   * " \x09\x0a\x0c\x0d" are HTML space characters:
   * https://www.w3.org/TR/html5/infrastructure.html#space-character
   *
   * So an attribute is:
   *  * The name: any character except a control character, space character, ('),
   *    ("), ">", "=", or "/"
   *  * Followed by zero or more space characters
   *  * Followed by "="
   *  * Followed by zero or more space characters
   *  * Followed by:
   *    * Any character except space, ('), ("), "<", ">", "=", (`), or
   *    * (") then any non-("), or
   *    * (') then any non-(')
   */
  var lastAttributeNameRegex = /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;
  /**
   * Finds the closing index of the last closed HTML tag.
   * This has 3 possible return values:
   *   - `-1`, meaning there is no tag in str.
   *   - `string.length`, meaning the last opened tag is unclosed.
   *   - Some positive number < str.length, meaning the index of the closing '>'.
   */
  function findTagClose(str) {
      var close = str.lastIndexOf('>');
      var open = str.indexOf('<', close + 1);
      return open > -1 ? str.length : close;
  }
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
  var TemplatePart = function TemplatePart(type, index, name, rawName, strings) {
      classCallCheck(this, TemplatePart);

      this.type = type;
      this.index = index;
      this.name = name;
      this.rawName = rawName;
      this.strings = strings;
  };
  /**
   * An updateable Template that tracks the location of dynamic parts.
   */
  var Template = function Template(result, element) {
      classCallCheck(this, Template);

      this.parts = [];
      this.element = element;
      var content = this.element.content;
      // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
      var walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                                                          NodeFilter.SHOW_TEXT */, null, false);
      var index = -1;
      var partIndex = 0;
      var nodesToRemove = [];
      // The actual previous node, accounting for removals: if a node is removed
      // it will never be the previousNode.
      var previousNode = void 0;
      // Used to set previousNode at the top of the loop.
      var currentNode = void 0;
      while (walker.nextNode()) {
          index++;
          previousNode = currentNode;
          var node = currentNode = walker.currentNode;
          if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                  if (!node.hasAttributes()) {
                      continue;
                  }
                  var attributes = node.attributes;
                  // Per https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                  // attributes are not guaranteed to be returned in document order. In
                  // particular, Edge/IE can return them out of order, so we cannot assume
                  // a correspondance between part index and attribute index.
                  var count = 0;
                  for (var i = 0; i < attributes.length; i++) {
                      if (attributes[i].value.indexOf(marker) >= 0) {
                          count++;
                      }
                  }
                  while (count-- > 0) {
                      // Get the template literal section leading up to the first
                      // expression in this attribute attribute
                      var stringForPart = result.strings[partIndex];
                      // Find the attribute name
                      var attributeNameInPart = lastAttributeNameRegex.exec(stringForPart)[1];
                      // Find the corresponding attribute
                      var attribute = attributes.getNamedItem(attributeNameInPart);
                      var stringsForAttributeValue = attribute.value.split(markerRegex);
                      this.parts.push(new TemplatePart('attribute', index, attribute.name, attributeNameInPart, stringsForAttributeValue));
                      node.removeAttribute(attribute.name);
                      partIndex += stringsForAttributeValue.length - 1;
                  }
              } else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                  var nodeValue = node.nodeValue;
                  if (nodeValue.indexOf(marker) < 0) {
                      continue;
                  }
                  var parent = node.parentNode;
                  var strings = nodeValue.split(markerRegex);
                  var lastIndex = strings.length - 1;
                  // We have a part for each match found
                  partIndex += lastIndex;
                  // We keep this current node, but reset its content to the last
                  // literal part. We insert new literal nodes before this so that the
                  // tree walker keeps its position correctly.
                  node.textContent = strings[lastIndex];
                  // Generate a new text node for each literal section
                  // These nodes are also used as the markers for node parts
                  for (var _i = 0; _i < lastIndex; _i++) {
                      parent.insertBefore(document.createTextNode(strings[_i]), node);
                      this.parts.push(new TemplatePart('node', index++));
                  }
              } else if (node.nodeType === 8 /* Node.COMMENT_NODE */ && node.nodeValue === marker) {
              var _parent = node.parentNode;
              // Add a new marker node to be the startNode of the Part if any of the
              // following are true:
              //  * We don't have a previousSibling
              //  * previousSibling is being removed (thus it's not the
              //    `previousNode`)
              //  * previousSibling is not a Text node
              //
              // TODO(justinfagnani): We should be able to use the previousNode here
              // as the marker node and reduce the number of extra nodes we add to a
              // template. See https://github.com/PolymerLabs/lit-html/issues/147
              var previousSibling = node.previousSibling;
              if (previousSibling === null || previousSibling !== previousNode || previousSibling.nodeType !== Node.TEXT_NODE) {
                  _parent.insertBefore(document.createTextNode(''), node);
              } else {
                  index--;
              }
              this.parts.push(new TemplatePart('node', index++));
              nodesToRemove.push(node);
              // If we don't have a nextSibling add a marker node.
              // We don't have to check if the next node is going to be removed,
              // because that node will induce a new marker if so.
              if (node.nextSibling === null) {
                  _parent.insertBefore(document.createTextNode(''), node);
              } else {
                  index--;
              }
              currentNode = previousNode;
              partIndex++;
          }
      }
      // Remove text binding nodes after the walk to not disturb the TreeWalker
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
          for (var _iterator = nodesToRemove[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var n = _step.value;

              n.parentNode.removeChild(n);
          }
      } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
      } finally {
          try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
              }
          } finally {
              if (_didIteratorError) {
                  throw _iteratorError;
              }
          }
      }
  };
  /**
   * Returns a value ready to be inserted into a Part from a user-provided value.
   *
   * If the user value is a directive, this invokes the directive with the given
   * part. If the value is null, it's converted to undefined to work better
   * with certain DOM APIs, like textContent.
   */
  var getValue = function getValue(part, value) {
      // `null` as the value of a Text node will render the string 'null'
      // so we convert it to undefined
      if (isDirective(value)) {
          value = value(part);
          return directiveValue;
      }
      return value === null ? undefined : value;
  };
  var isDirective = function isDirective(o) {
      return typeof o === 'function' && o.__litDirective === true;
  };
  /**
   * A sentinel value that signals that a value was handled by a directive and
   * should not be written to the DOM.
   */
  var directiveValue = {};
  var isPrimitiveValue = function isPrimitiveValue(value) {
      return value === null || !((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' || typeof value === 'function');
  };
  var AttributePart = function () {
      function AttributePart(instance, element, name, strings) {
          classCallCheck(this, AttributePart);

          this.instance = instance;
          this.element = element;
          this.name = name;
          this.strings = strings;
          this.size = strings.length - 1;
          this._previousValues = [];
      }

      createClass(AttributePart, [{
          key: '_interpolate',
          value: function _interpolate(values, startIndex) {
              var strings = this.strings;
              var l = strings.length - 1;
              var text = '';
              for (var i = 0; i < l; i++) {
                  text += strings[i];
                  var v = getValue(this, values[startIndex + i]);
                  if (v && v !== directiveValue && (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
                      var _iteratorNormalCompletion2 = true;
                      var _didIteratorError2 = false;
                      var _iteratorError2 = undefined;

                      try {
                          for (var _iterator2 = v[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                              var t = _step2.value;

                              // TODO: we need to recursively call getValue into iterables...
                              text += t;
                          }
                      } catch (err) {
                          _didIteratorError2 = true;
                          _iteratorError2 = err;
                      } finally {
                          try {
                              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                  _iterator2.return();
                              }
                          } finally {
                              if (_didIteratorError2) {
                                  throw _iteratorError2;
                              }
                          }
                      }
                  } else {
                      text += v;
                  }
              }
              return text + strings[l];
          }
      }, {
          key: '_equalToPreviousValues',
          value: function _equalToPreviousValues(values, startIndex) {
              for (var i = startIndex; i < startIndex + this.size; i++) {
                  if (this._previousValues[i] !== values[i] || !isPrimitiveValue(values[i])) {
                      return false;
                  }
              }
              return true;
          }
      }, {
          key: 'setValue',
          value: function setValue(values, startIndex) {
              if (this._equalToPreviousValues(values, startIndex)) {
                  return;
              }
              var s = this.strings;
              var value = void 0;
              if (s.length === 2 && s[0] === '' && s[1] === '') {
                  // An expression that occupies the whole attribute value will leave
                  // leading and trailing empty strings.
                  value = getValue(this, values[startIndex]);
                  if (Array.isArray(value)) {
                      value = value.join('');
                  }
              } else {
                  value = this._interpolate(values, startIndex);
              }
              if (value !== directiveValue) {
                  this.element.setAttribute(this.name, value);
              }
              this._previousValues = values;
          }
      }]);
      return AttributePart;
  }();
  var NodePart = function () {
      function NodePart(instance, startNode, endNode) {
          classCallCheck(this, NodePart);

          this.instance = instance;
          this.startNode = startNode;
          this.endNode = endNode;
          this._previousValue = undefined;
      }

      createClass(NodePart, [{
          key: 'setValue',
          value: function setValue(value) {
              value = getValue(this, value);
              if (value === directiveValue) {
                  return;
              }
              if (isPrimitiveValue(value)) {
                  // Handle primitive values
                  // If the value didn't change, do nothing
                  if (value === this._previousValue) {
                      return;
                  }
                  this._setText(value);
              } else if (value instanceof TemplateResult) {
                  this._setTemplateResult(value);
              } else if (Array.isArray(value) || value[Symbol.iterator]) {
                  this._setIterable(value);
              } else if (value instanceof Node) {
                  this._setNode(value);
              } else if (value.then !== undefined) {
                  this._setPromise(value);
              } else {
                  // Fallback, will render the string representation
                  this._setText(value);
              }
          }
      }, {
          key: '_insert',
          value: function _insert(node) {
              this.endNode.parentNode.insertBefore(node, this.endNode);
          }
      }, {
          key: '_setNode',
          value: function _setNode(value) {
              if (this._previousValue === value) {
                  return;
              }
              this.clear();
              this._insert(value);
              this._previousValue = value;
          }
      }, {
          key: '_setText',
          value: function _setText(value) {
              var node = this.startNode.nextSibling;
              value = value === undefined ? '' : value;
              if (node === this.endNode.previousSibling && node.nodeType === Node.TEXT_NODE) {
                  // If we only have a single text node between the markers, we can just
                  // set its value, rather than replacing it.
                  // TODO(justinfagnani): Can we just check if _previousValue is
                  // primitive?
                  node.textContent = value;
              } else {
                  this._setNode(document.createTextNode(value));
              }
              this._previousValue = value;
          }
      }, {
          key: '_setTemplateResult',
          value: function _setTemplateResult(value) {
              var template = this.instance._getTemplate(value);
              var instance = void 0;
              if (this._previousValue && this._previousValue.template === template) {
                  instance = this._previousValue;
              } else {
                  instance = new TemplateInstance(template, this.instance._partCallback, this.instance._getTemplate);
                  this._setNode(instance._clone());
                  this._previousValue = instance;
              }
              instance.update(value.values);
          }
      }, {
          key: '_setIterable',
          value: function _setIterable(value) {
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
              // Lets us keep track of how many items we stamped so we can clear leftover
              // items from a previous render
              var itemParts = this._previousValue;
              var partIndex = 0;
              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                  for (var _iterator3 = value[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                      var item = _step3.value;

                      // Try to reuse an existing part
                      var itemPart = itemParts[partIndex];
                      // If no existing part, create a new one
                      if (itemPart === undefined) {
                          // If we're creating the first item part, it's startNode should be the
                          // container's startNode
                          var itemStart = this.startNode;
                          // If we're not creating the first part, create a new separator marker
                          // node, and fix up the previous part's endNode to point to it
                          if (partIndex > 0) {
                              var previousPart = itemParts[partIndex - 1];
                              itemStart = previousPart.endNode = document.createTextNode('');
                              this._insert(itemStart);
                          }
                          itemPart = new NodePart(this.instance, itemStart, this.endNode);
                          itemParts.push(itemPart);
                      }
                      itemPart.setValue(item);
                      partIndex++;
                  }
              } catch (err) {
                  _didIteratorError3 = true;
                  _iteratorError3 = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion3 && _iterator3.return) {
                          _iterator3.return();
                      }
                  } finally {
                      if (_didIteratorError3) {
                          throw _iteratorError3;
                      }
                  }
              }

              if (partIndex === 0) {
                  this.clear();
                  this._previousValue = undefined;
              } else if (partIndex < itemParts.length) {
                  var lastPart = itemParts[partIndex - 1];
                  // Truncate the parts array so _previousValue reflects the current state
                  itemParts.length = partIndex;
                  this.clear(lastPart.endNode.previousSibling);
                  lastPart.endNode = this.endNode;
              }
          }
      }, {
          key: '_setPromise',
          value: function _setPromise(value) {
              var _this2 = this;

              this._previousValue = value;
              value.then(function (v) {
                  if (_this2._previousValue === value) {
                      _this2.setValue(v);
                  }
              });
          }
      }, {
          key: 'clear',
          value: function clear() {
              var startNode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.startNode;

              removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
          }
      }]);
      return NodePart;
  }();
  var defaultPartCallback = function defaultPartCallback(instance, templatePart, node) {
      if (templatePart.type === 'attribute') {
          return new AttributePart(instance, node, templatePart.name, templatePart.strings);
      } else if (templatePart.type === 'node') {
          return new NodePart(instance, node, node.nextSibling);
      }
      throw new Error('Unknown part type ' + templatePart.type);
  };
  /**
   * An instance of a `Template` that can be attached to the DOM and updated
   * with new values.
   */
  var TemplateInstance = function () {
      function TemplateInstance(template, partCallback, getTemplate) {
          classCallCheck(this, TemplateInstance);

          this._parts = [];
          this.template = template;
          this._partCallback = partCallback;
          this._getTemplate = getTemplate;
      }

      createClass(TemplateInstance, [{
          key: 'update',
          value: function update(values) {
              var valueIndex = 0;
              var _iteratorNormalCompletion4 = true;
              var _didIteratorError4 = false;
              var _iteratorError4 = undefined;

              try {
                  for (var _iterator4 = this._parts[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                      var part = _step4.value;

                      if (part.size === undefined) {
                          part.setValue(values[valueIndex]);
                          valueIndex++;
                      } else {
                          part.setValue(values, valueIndex);
                          valueIndex += part.size;
                      }
                  }
              } catch (err) {
                  _didIteratorError4 = true;
                  _iteratorError4 = err;
              } finally {
                  try {
                      if (!_iteratorNormalCompletion4 && _iterator4.return) {
                          _iterator4.return();
                      }
                  } finally {
                      if (_didIteratorError4) {
                          throw _iteratorError4;
                      }
                  }
              }
          }
      }, {
          key: '_clone',
          value: function _clone() {
              var fragment = document.importNode(this.template.element.content, true);
              var parts = this.template.parts;
              if (parts.length > 0) {
                  // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
                  // null
                  var _walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                                                                        NodeFilter.SHOW_TEXT */, null, false);
                  var _index = -1;
                  for (var i = 0; i < parts.length; i++) {
                      var part = parts[i];
                      while (_index < part.index) {
                          _index++;
                          _walker.nextNode();
                      }
                      this._parts.push(this._partCallback(this, part, _walker.currentNode));
                  }
              }
              return fragment;
          }
      }]);
      return TemplateInstance;
  }();
  /**
   * Reparents nodes, starting from `startNode` (inclusive) to `endNode`
   * (exclusive), into another container (could be the same container), before
   * `beforeNode`. If `beforeNode` is null, it appends the nodes to the
   * container.
   */
  var reparentNodes = function reparentNodes(container, start) {
      var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var before = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      var node = start;
      while (node !== end) {
          var n = node.nextSibling;
          container.insertBefore(node, before);
          node = n;
      }
  };
  /**
   * Removes nodes, starting from `startNode` (inclusive) to `endNode`
   * (exclusive), from `container`.
   */
  var removeNodes = function removeNodes(container, startNode) {
      var endNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var node = startNode;
      while (node !== endNode) {
          var n = node.nextSibling;
          container.removeChild(node);
          node = n;
      }
  };

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
  var shadyTemplateFactory = function shadyTemplateFactory(scopeName) {
      return function (result) {
          var cacheKey = result.type + '--' + scopeName;
          var templateCache = templateCaches.get(cacheKey);
          if (templateCache === undefined) {
              templateCache = new Map();
              templateCaches.set(cacheKey, templateCache);
          }
          var template = templateCache.get(result.strings);
          if (template === undefined) {
              var element = result.getTemplateElement();
              if (_typeof(window.ShadyCSS) === 'object') {
                  window.ShadyCSS.prepareTemplate(element, scopeName);
              }
              template = new Template(result, element);
              templateCache.set(result.strings, template);
          }
          return template;
      };
  };
  function render$1(result, container, scopeName) {
      return render(result, container, shadyTemplateFactory(scopeName));
  }

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
  /**
   * Interprets a template literal as a lit-extended HTML template.
   */
  var html$1 = function html$$1(strings) {
      for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          values[_key - 1] = arguments[_key];
      }

      return new TemplateResult(strings, values, 'html', extendedPartCallback);
  };
  /**
   * A PartCallback which allows templates to set properties and declarative
   * event handlers.
   *
   * Properties are set by default, instead of attributes. Attribute names in
   * lit-html templates preserve case, so properties are case sensitive. If an
   * expression takes up an entire attribute value, then the property is set to
   * that value. If an expression is interpolated with a string or other
   * expressions then the property is set to the string result of the
   * interpolation.
   *
   * To set an attribute instead of a property, append a `$` suffix to the
   * attribute name.
   *
   * Example:
   *
   *     html`<button class$="primary">Buy Now</button>`
   *
   * To set an event handler, prefix the attribute name with `on-`:
   *
   * Example:
   *
   *     html`<button on-click=${(e)=> this.onClickHandler(e)}>Buy Now</button>`
   *
   */
  var extendedPartCallback = function extendedPartCallback(instance, templatePart, node) {
      if (templatePart.type === 'attribute') {
          if (templatePart.rawName.startsWith('on-')) {
              var eventName = templatePart.rawName.slice(3);
              return new EventPart(instance, node, eventName);
          }
          if (templatePart.name.endsWith('$')) {
              var name = templatePart.name.slice(0, -1);
              return new AttributePart(instance, node, name, templatePart.strings);
          }
          if (templatePart.name.endsWith('?')) {
              var _name = templatePart.name.slice(0, -1);
              return new BooleanAttributePart(instance, node, _name, templatePart.strings);
          }
          return new PropertyPart(instance, node, templatePart.rawName, templatePart.strings);
      }
      return defaultPartCallback(instance, templatePart, node);
  };
  /**
   * Implements a boolean attribute, roughly as defined in the HTML
   * specification.
   *
   * If the value is truthy, then the attribute is present with a value of
   * ''. If the value is falsey, the attribute is removed.
   */
  var BooleanAttributePart = function (_AttributePart) {
      inherits(BooleanAttributePart, _AttributePart);

      function BooleanAttributePart() {
          classCallCheck(this, BooleanAttributePart);
          return possibleConstructorReturn(this, (BooleanAttributePart.__proto__ || Object.getPrototypeOf(BooleanAttributePart)).apply(this, arguments));
      }

      createClass(BooleanAttributePart, [{
          key: 'setValue',
          value: function setValue(values, startIndex) {
              var s = this.strings;
              if (s.length === 2 && s[0] === '' && s[1] === '') {
                  var value = getValue(this, values[startIndex]);
                  if (value === directiveValue) {
                      return;
                  }
                  if (value) {
                      this.element.setAttribute(this.name, '');
                  } else {
                      this.element.removeAttribute(this.name);
                  }
              } else {
                  throw new Error('boolean attributes can only contain a single expression');
              }
          }
      }]);
      return BooleanAttributePart;
  }(AttributePart);
  var PropertyPart = function (_AttributePart2) {
      inherits(PropertyPart, _AttributePart2);

      function PropertyPart() {
          classCallCheck(this, PropertyPart);
          return possibleConstructorReturn(this, (PropertyPart.__proto__ || Object.getPrototypeOf(PropertyPart)).apply(this, arguments));
      }

      createClass(PropertyPart, [{
          key: 'setValue',
          value: function setValue(values, startIndex) {
              var s = this.strings;
              var value = void 0;
              if (this._equalToPreviousValues(values, startIndex)) {
                  return;
              }
              if (s.length === 2 && s[0] === '' && s[1] === '') {
                  // An expression that occupies the whole attribute value will leave
                  // leading and trailing empty strings.
                  value = getValue(this, values[startIndex]);
              } else {
                  // Interpolation, so interpolate
                  value = this._interpolate(values, startIndex);
              }
              if (value !== directiveValue) {
                  this.element[this.name] = value;
              }
              this._previousValues = values;
          }
      }]);
      return PropertyPart;
  }(AttributePart);
  var EventPart = function () {
      function EventPart(instance, element, eventName) {
          classCallCheck(this, EventPart);

          this.instance = instance;
          this.element = element;
          this.eventName = eventName;
      }

      createClass(EventPart, [{
          key: 'setValue',
          value: function setValue(value) {
              var listener = getValue(this, value);
              var previous = this._listener;
              if (listener === previous) {
                  return;
              }
              this._listener = listener;
              if (previous != null) {
                  this.element.removeEventListener(this.eventName, previous);
              }
              if (listener != null) {
                  this.element.addEventListener(this.eventName, listener);
              }
          }
      }]);
      return EventPart;
  }();

  var e = Symbol("tag"),
      s = Symbol("needsRender"),
      i = function i(t) {
    return t.replace(/([a-z](?=[A-Z]))|([A-Z](?=[A-Z][a-z]))/g, "$1$2-").toLowerCase();
  },
      o = function o(t) {
    t.$ = {}, t.shadowRoot.querySelectorAll("[id]").forEach(function (e) {
      t.$[e.id] = e;
    });
  };
  var h = function (_HTMLElement) {
    inherits(h, _HTMLElement);

    function h() {
      classCallCheck(this, h);
      return possibleConstructorReturn(this, (h.__proto__ || Object.getPrototypeOf(h)).apply(this, arguments));
    }

    createClass(h, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        "template" in this && (this.attachShadow({ mode: "open" }), this.render({ sync: !0 }), o(this));
      }
    }, {
      key: "render",
      value: function () {
        var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              _ref2$sync = _ref2.sync,
              e = _ref2$sync === undefined ? !1 : _ref2$sync;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  this[s] = !0;
                  _context.t0 = e;

                  if (_context.t0) {
                    _context.next = 5;
                    break;
                  }

                  _context.next = 5;
                  return 0;

                case 5:
                  this[s] && (this[s] = !1, render$1(this.template, this.shadowRoot, this.constructor.is));

                case 6:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function render$$1() {
          return _ref.apply(this, arguments);
        }

        return render$$1;
      }()
    }], [{
      key: "is",
      get: function get$$1() {
        return this.hasOwnProperty(e) && this[e] || (this[e] = i(this.name));
      }
    }]);
    return h;
  }(HTMLElement);

  var e$1 = !1;
  var n = [],
      r = function r(t) {
    e$1 || (window.addEventListener("hashchange", c), window.addEventListener("location-changed", c), window.addEventListener("popstate", c), e$1 = !0), n.push(t);
  },
      c = function c() {
    n.forEach(function (e) {
      return e(d(), p(), h$1());
    });
  },
      d = function d() {
    return window.decodeURIComponent(window.location.pathname);
  },
      p = function p() {
    return window.location.search.slice(1);
  },
      h$1 = function h() {
    return window.decodeURIComponent(window.location.hash.slice(1));
  };

  /* Font Face Observer v2.0.13 - © Bram Stein. License: BSD-3-Clause */(function () {
    function l(a, b) {
      document.addEventListener ? a.addEventListener("scroll", b, !1) : a.attachEvent("scroll", b);
    }function m(a) {
      document.body ? a() : document.addEventListener ? document.addEventListener("DOMContentLoaded", function c() {
        document.removeEventListener("DOMContentLoaded", c);a();
      }) : document.attachEvent("onreadystatechange", function k() {
        if ("interactive" == document.readyState || "complete" == document.readyState) document.detachEvent("onreadystatechange", k), a();
      });
    }function r(a) {
      this.a = document.createElement("div");this.a.setAttribute("aria-hidden", "true");this.a.appendChild(document.createTextNode(a));this.b = document.createElement("span");this.c = document.createElement("span");this.h = document.createElement("span");this.f = document.createElement("span");this.g = -1;this.b.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
      this.f.style.cssText = "max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText = "display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c);
    }
    function t(a, b) {
      a.a.style.cssText = "max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;white-space:nowrap;font-synthesis:none;font:" + b + ";";
    }function y(a) {
      var b = a.a.offsetWidth,
          c = b + 100;a.f.style.width = c + "px";a.c.scrollLeft = c;a.b.scrollLeft = a.b.scrollWidth + 100;return a.g !== b ? (a.g = b, !0) : !1;
    }function z(a, b) {
      function c() {
        var a = k;y(a) && a.a.parentNode && b(a.g);
      }var k = a;l(a.b, c);l(a.c, c);y(a);
    }function A(a, b) {
      var c = b || {};this.family = a;this.style = c.style || "normal";this.weight = c.weight || "normal";this.stretch = c.stretch || "normal";
    }var B = null,
        C = null,
        E = null,
        F = null;function G() {
      if (null === C) if (J() && /Apple/.test(window.navigator.vendor)) {
        var a = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))(?:\.([0-9]+))/.exec(window.navigator.userAgent);C = !!a && 603 > parseInt(a[1], 10);
      } else C = !1;return C;
    }function J() {
      null === F && (F = !!document.fonts);return F;
    }
    function K() {
      if (null === E) {
        var a = document.createElement("div");try {
          a.style.font = "condensed 100px sans-serif";
        } catch (b) {}E = "" !== a.style.font;
      }return E;
    }function L(a, b) {
      return [a.style, a.weight, K() ? a.stretch : "", "100px", b].join(" ");
    }
    A.prototype.load = function (a, b) {
      var c = this,
          k = a || "BESbswy",
          q = 0,
          D = b || 3E3,
          H = new Date().getTime();return new Promise(function (a, b) {
        if (J() && !G()) {
          var M = new Promise(function (a, b) {
            function e() {
              new Date().getTime() - H >= D ? b() : document.fonts.load(L(c, '"' + c.family + '"'), k).then(function (c) {
                1 <= c.length ? a() : setTimeout(e, 25);
              }, function () {
                b();
              });
            }e();
          }),
              N = new Promise(function (a, c) {
            q = setTimeout(c, D);
          });Promise.race([N, M]).then(function () {
            clearTimeout(q);a(c);
          }, function () {
            b(c);
          });
        } else m(function () {
          function u() {
            var b;if (b = -1 != f && -1 != g || -1 != f && -1 != h || -1 != g && -1 != h) (b = f != g && f != h && g != h) || (null === B && (b = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent), B = !!b && (536 > parseInt(b[1], 10) || 536 === parseInt(b[1], 10) && 11 >= parseInt(b[2], 10))), b = B && (f == v && g == v && h == v || f == w && g == w && h == w || f == x && g == x && h == x)), b = !b;b && (d.parentNode && d.parentNode.removeChild(d), clearTimeout(q), a(c));
          }function I() {
            if (new Date().getTime() - H >= D) d.parentNode && d.parentNode.removeChild(d), b(c);else {
              var a = document.hidden;if (!0 === a || void 0 === a) f = e.a.offsetWidth, g = n.a.offsetWidth, h = p.a.offsetWidth, u();q = setTimeout(I, 50);
            }
          }var e = new r(k),
              n = new r(k),
              p = new r(k),
              f = -1,
              g = -1,
              h = -1,
              v = -1,
              w = -1,
              x = -1,
              d = document.createElement("div");d.dir = "ltr";t(e, L(c, "sans-serif"));t(n, L(c, "serif"));t(p, L(c, "monospace"));d.appendChild(e.a);d.appendChild(n.a);d.appendChild(p.a);document.body.appendChild(d);v = e.a.offsetWidth;w = n.a.offsetWidth;x = p.a.offsetWidth;I();z(e, function (a) {
            f = a;u();
          });t(e, L(c, '"' + c.family + '",sans-serif'));z(n, function (a) {
            g = a;u();
          });t(n, L(c, '"' + c.family + '",serif'));
          z(p, function (a) {
            h = a;u();
          });t(p, L(c, '"' + c.family + '",monospace'));
        });
      });
    };"object" === (typeof module === "undefined" ? "undefined" : _typeof(module)) ? module.exports = A : (window.FontFaceObserver = A, window.FontFaceObserver.prototype.load = A.prototype.load);
  })();

  var registeredElements = {},
      handleKeydown = function handleKeydown(a) {
    return a.defaultPrevented ? void console.warn('Keypress ignored!') : void (registeredElements[a.key] && registeredElements[a.key].every(function (b) {
      if (null !== b.offsetParent) return a.stopPropagation(), b.click(), !b.override;
    }));
  };window.addEventListener('keydown', handleKeydown, !0);var GluonKeybinding = function (_GluonElement) {
    inherits(GluonKeybinding, _GluonElement);

    function GluonKeybinding() {
      classCallCheck(this, GluonKeybinding);
      return possibleConstructorReturn(this, (GluonKeybinding.__proto__ || Object.getPrototypeOf(GluonKeybinding)).apply(this, arguments));
    }

    createClass(GluonKeybinding, [{
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(a, b, c) {
        'key' === a && this.__register(c, b), 'override' === a && this.__override(this.key);
      }
    }, {
      key: '__register',
      value: function __register(a, b) {
        if (b && registeredElements[b]) {
          var _a = registeredElements[b].indexOf(this);-1 != _a && (registeredElements[b].splice(_a, 1), 0 === registeredElements[b].length && delete registeredElements[b]);
        }a && (!registeredElements[a] && (registeredElements[a] = []), this.override ? registeredElements[a].unshift(this) : registeredElements[a].push(this));
      }
    }, {
      key: '__override',
      value: function __override(a) {
        if (a && registeredElements[a]) {
          var b = registeredElements[a].indexOf(this);-1 != b && (registeredElements[a].splice(b, 1), registeredElements[a].unshift(this));
        }
      }
    }, {
      key: 'key',
      set: function set$$1(a) {
        a ? this.setAttribute('key', a) : this.removeAttribute('key');
      },
      get: function get$$1() {
        return this.getAttribute('key');
      }
    }, {
      key: 'override',
      set: function set$$1(a) {
        a ? this.setAttribute('override', '') : this.removeAttribute('override');
      },
      get: function get$$1() {
        return '' === this.getAttribute('override');
      }
    }], [{
      key: 'observedAttributes',
      get: function get$$1() {
        return ['key', 'override'];
      }
    }]);
    return GluonKeybinding;
  }(h);customElements.define(GluonKeybinding.is, GluonKeybinding);

  var _templateObject = taggedTemplateLiteral(['\n      <div class="slides">\n        <slot id="slides"></slot>\n      </div>\n      <div id="progress"></div>\n      <div id="timer"></div>\n      <gluon-keybinding id="timerToggle" key="t"></gluon-keybinding>\n      <gluon-keybinding id="presenterToggle" key="p"></gluon-keybinding>\n      <div id="forward">\n        <gluon-keybinding key="PageDown"></gluon-keybinding>\n        <gluon-keybinding key="ArrowRight"></gluon-keybinding>\n      </div>\n      <div id="backward">\n        <gluon-keybinding key="PageUp"></gluon-keybinding>\n        <gluon-keybinding key="ArrowLeft"></gluon-keybinding>\n      </div>\n      <style>\n        @keyframes slidem-fade-in {\n          from {\n            opacity: 0;\n          }\n          to {\n            opacity: 1;\n          }\n        }\n\n        @keyframes slidem-fade-out {\n          from {\n            opacity: 1;\n          }\n          to {\n            opacity: 0;\n          }\n        }\n\n        @keyframes slidem-slide-in-forward {\n          from {\n            transform: translateX(100vw);\n          }\n          to {\n            transform: translateX(0);\n          }\n        }\n\n        @keyframes slidem-slide-in-backward {\n          from {\n            transform: translateX(0);\n          }\n          to {\n            transform: translateX(100vw);\n          }\n        }\n\n        @keyframes slidem-slide-out-forward {\n          from {\n            transform: translateX(0);\n          }\n          to {\n            transform: translateX(-100vw);\n          }\n        }\n\n        @keyframes slidem-slide-out-backward {\n          from {\n            transform: translateX(-100vw);\n          }\n          to {\n            transform: translateX(0);\n          }\n        }\n        :host {\n          display: block;\n          overflow: hidden;\n          position: absolute;\n          top: 0;\n          left: 0;\n          bottom: 0;\n          right: 0;\n          font-family: \'sans-serif\';\n          font-size: 56px;\n          line-height: 1;\n        }\n\n        .slides ::slotted(*) {\n          position: absolute;\n          top: 0;\n          right: 0;\n          bottom: 0;\n          left: 0;\n          animation-duration: 0.4s;\n          animation-fill-mode: both;\n          animation-timing-function: ease-in-out;\n        }\n\n        .slides ::slotted(:not([active]):not([previous]):not([next])) {\n          display: none;\n        }\n\n        :host(:not([presenter])) .slides ::slotted([next]:not([previous])) {\n          display: none;\n        }\n\n        #progress {\n          position: absolute;\n          bottom: 0px;\n          left: 0;\n          right: 0;\n          height: 50px;\n          text-align: center;\n          display: flex;\n          flex-flow: row;\n          justify-content: center;\n          z-index: 10;\n        }\n        #progress div {\n          height: 8px;\n          width: 8px;\n          border-radius: 50%;\n          border: 2px solid white;\n          margin-left: 6px;\n          margin-right: 6px;\n          background: transparent;\n          transition: background 0.2s, transform 0.2s;\n        }\n        #progress div.active {\n          background: white;\n          transform: scale(1.3);\n        }\n        :host([progress="dark"]) #progress div {\n          border: 2px solid black;\n        }\n        :host([progress="dark"]) #progress div.active {\n          background: black;\n        }\n        :host([progress="none"]) #progress {\n          display: none;\n        }\n\n        #timer {\n          display: none;\n          position: absolute;\n          top: 5%;\n          right: 5%;\n          color: white;\n          font-size: 4vw;\n          font-weight: bold;\n          font-family: Helvetica, Arial, sans-serif;\n        }\n        :host([presenter]) #timer {\n          display: inline;\n        }\n\n        :host([presenter]) {\n          background: black;\n        }\n        /* White box around active slide */\n        :host([presenter])::before {\n          display: block;\n          position: absolute;\n          content: \'\';\n          top: calc(25% - 20px);\n          right:  calc(45% - 20px);\n          bottom:  calc(25% - 20px);\n          left:  calc(5% - 20px);\n          border: 2px solid white;\n        }\n        /* White box around next slide */\n        :host([presenter])::after {\n          display: block;\n          position: absolute;\n          content: \'\';\n          top: calc(32.5% - 20px);\n          right: calc(4.5% - 20px);\n          bottom: calc(32.5% - 20px);\n          left: calc(60.5% - 20px);\n          border: 2px solid white;\n        }\n        :host([presenter]) .slides ::slotted(*) {\n          animation: none !important; /* Block user-configured animations */\n        }\n        :host([presenter]) .slides ::slotted([previous]:not([next])) {\n          display: none;\n        }\n        :host([presenter]) .slides ::slotted([active]) {\n          transform: translate(-20%, 0) scale(0.5) !important; /* Force presenter layout */\n        }\n        :host([presenter]) .slides ::slotted([next]) {\n          transform: translate(28%, 0) scale(0.35) !important; /* Force presenter layout */\n        }\n\n        .slides ::slotted([active]) {\n          z-index: 2;\n        }\n        .slides ::slotted([previous]) {\n          z-index: 0;\n        }\n        .slides ::slotted([fade-in][active].animate-forward) {\n          animation-name: slidem-fade-in;\n        }\n        .slides ::slotted([fade-in][previous].animate-backward) {\n          animation-name: slidem-fade-out;\n          z-index: 3;\n        }\n        .slides ::slotted([fade-out][active].animate-backward) {\n          animation-name: slidem-fade-in;\n        }\n        .slides ::slotted([fade-out][previous].animate-forward) {\n          animation-name: slidem-fade-out;\n          z-index: 3;\n        }\n        .slides ::slotted([slide-in][active].animate-forward) {\n          animation-name: slidem-slide-in-forward;\n        }\n        .slides ::slotted([slide-in][previous].animate-backward) {\n          animation-name: slidem-slide-in-backward;\n          z-index: 3;\n        }\n        .slides ::slotted([slide-out][active].animate-backward) {\n          animation-name: slidem-slide-out-backward;\n        }\n        .slides ::slotted([slide-out][previous].animate-forward) {\n          animation-name: slidem-slide-out-forward;\n          z-index: 3;\n        }\n      </style>\n    '], ['\n      <div class="slides">\n        <slot id="slides"></slot>\n      </div>\n      <div id="progress"></div>\n      <div id="timer"></div>\n      <gluon-keybinding id="timerToggle" key="t"></gluon-keybinding>\n      <gluon-keybinding id="presenterToggle" key="p"></gluon-keybinding>\n      <div id="forward">\n        <gluon-keybinding key="PageDown"></gluon-keybinding>\n        <gluon-keybinding key="ArrowRight"></gluon-keybinding>\n      </div>\n      <div id="backward">\n        <gluon-keybinding key="PageUp"></gluon-keybinding>\n        <gluon-keybinding key="ArrowLeft"></gluon-keybinding>\n      </div>\n      <style>\n        @keyframes slidem-fade-in {\n          from {\n            opacity: 0;\n          }\n          to {\n            opacity: 1;\n          }\n        }\n\n        @keyframes slidem-fade-out {\n          from {\n            opacity: 1;\n          }\n          to {\n            opacity: 0;\n          }\n        }\n\n        @keyframes slidem-slide-in-forward {\n          from {\n            transform: translateX(100vw);\n          }\n          to {\n            transform: translateX(0);\n          }\n        }\n\n        @keyframes slidem-slide-in-backward {\n          from {\n            transform: translateX(0);\n          }\n          to {\n            transform: translateX(100vw);\n          }\n        }\n\n        @keyframes slidem-slide-out-forward {\n          from {\n            transform: translateX(0);\n          }\n          to {\n            transform: translateX(-100vw);\n          }\n        }\n\n        @keyframes slidem-slide-out-backward {\n          from {\n            transform: translateX(-100vw);\n          }\n          to {\n            transform: translateX(0);\n          }\n        }\n        :host {\n          display: block;\n          overflow: hidden;\n          position: absolute;\n          top: 0;\n          left: 0;\n          bottom: 0;\n          right: 0;\n          font-family: \'sans-serif\';\n          font-size: 56px;\n          line-height: 1;\n        }\n\n        .slides ::slotted(*) {\n          position: absolute;\n          top: 0;\n          right: 0;\n          bottom: 0;\n          left: 0;\n          animation-duration: 0.4s;\n          animation-fill-mode: both;\n          animation-timing-function: ease-in-out;\n        }\n\n        .slides ::slotted(:not([active]):not([previous]):not([next])) {\n          display: none;\n        }\n\n        :host(:not([presenter])) .slides ::slotted([next]:not([previous])) {\n          display: none;\n        }\n\n        #progress {\n          position: absolute;\n          bottom: 0px;\n          left: 0;\n          right: 0;\n          height: 50px;\n          text-align: center;\n          display: flex;\n          flex-flow: row;\n          justify-content: center;\n          z-index: 10;\n        }\n        #progress div {\n          height: 8px;\n          width: 8px;\n          border-radius: 50%;\n          border: 2px solid white;\n          margin-left: 6px;\n          margin-right: 6px;\n          background: transparent;\n          transition: background 0.2s, transform 0.2s;\n        }\n        #progress div.active {\n          background: white;\n          transform: scale(1.3);\n        }\n        :host([progress="dark"]) #progress div {\n          border: 2px solid black;\n        }\n        :host([progress="dark"]) #progress div.active {\n          background: black;\n        }\n        :host([progress="none"]) #progress {\n          display: none;\n        }\n\n        #timer {\n          display: none;\n          position: absolute;\n          top: 5%;\n          right: 5%;\n          color: white;\n          font-size: 4vw;\n          font-weight: bold;\n          font-family: Helvetica, Arial, sans-serif;\n        }\n        :host([presenter]) #timer {\n          display: inline;\n        }\n\n        :host([presenter]) {\n          background: black;\n        }\n        /* White box around active slide */\n        :host([presenter])::before {\n          display: block;\n          position: absolute;\n          content: \'\';\n          top: calc(25% - 20px);\n          right:  calc(45% - 20px);\n          bottom:  calc(25% - 20px);\n          left:  calc(5% - 20px);\n          border: 2px solid white;\n        }\n        /* White box around next slide */\n        :host([presenter])::after {\n          display: block;\n          position: absolute;\n          content: \'\';\n          top: calc(32.5% - 20px);\n          right: calc(4.5% - 20px);\n          bottom: calc(32.5% - 20px);\n          left: calc(60.5% - 20px);\n          border: 2px solid white;\n        }\n        :host([presenter]) .slides ::slotted(*) {\n          animation: none !important; /* Block user-configured animations */\n        }\n        :host([presenter]) .slides ::slotted([previous]:not([next])) {\n          display: none;\n        }\n        :host([presenter]) .slides ::slotted([active]) {\n          transform: translate(-20%, 0) scale(0.5) !important; /* Force presenter layout */\n        }\n        :host([presenter]) .slides ::slotted([next]) {\n          transform: translate(28%, 0) scale(0.35) !important; /* Force presenter layout */\n        }\n\n        .slides ::slotted([active]) {\n          z-index: 2;\n        }\n        .slides ::slotted([previous]) {\n          z-index: 0;\n        }\n        .slides ::slotted([fade-in][active].animate-forward) {\n          animation-name: slidem-fade-in;\n        }\n        .slides ::slotted([fade-in][previous].animate-backward) {\n          animation-name: slidem-fade-out;\n          z-index: 3;\n        }\n        .slides ::slotted([fade-out][active].animate-backward) {\n          animation-name: slidem-fade-in;\n        }\n        .slides ::slotted([fade-out][previous].animate-forward) {\n          animation-name: slidem-fade-out;\n          z-index: 3;\n        }\n        .slides ::slotted([slide-in][active].animate-forward) {\n          animation-name: slidem-slide-in-forward;\n        }\n        .slides ::slotted([slide-in][previous].animate-backward) {\n          animation-name: slidem-slide-in-backward;\n          z-index: 3;\n        }\n        .slides ::slotted([slide-out][active].animate-backward) {\n          animation-name: slidem-slide-out-backward;\n        }\n        .slides ::slotted([slide-out][previous].animate-forward) {\n          animation-name: slidem-slide-out-forward;\n          z-index: 3;\n        }\n      </style>\n    ']);

  var styleText = document.createTextNode('\n  /* SLIDEM GLOBAL STYLES */\n  body {\n    margin: 0;\n  }\n\n\n  [reveal] {\n    opacity: 0;\n    transition: opacity 0.2s;\n  }\n\n  /* Keyframes are defined here to patch a scoping bug in Chrome */\n  @keyframes slidem-fade-in {\n    from {\n      opacity: 0;\n    }\n    to {\n      opacity: 1;\n    }\n  }\n\n  @keyframes slidem-fade-out {\n    from {\n      opacity: 1;\n    }\n    to {\n      opacity: 0;\n    }\n  }\n\n  @keyframes slidem-slide-in-forward {\n    from {\n      transform: translateX(100vw);\n    }\n    to {\n      transform: translateX(0);\n    }\n  }\n\n  @keyframes slidem-slide-in-backward {\n    from {\n      transform: translateX(0);\n    }\n    to {\n      transform: translateX(100vw);\n    }\n  }\n\n  @keyframes slidem-slide-out-forward {\n    from {\n      transform: translateX(0);\n    }\n    to {\n      transform: translateX(-100vw);\n    }\n  }\n\n  @keyframes slidem-slide-out-backward {\n    from {\n      transform: translateX(-100vw);\n    }\n    to {\n      transform: translateX(0);\n    }\n  }\n');

  var styleNode = document.createElement('style');
  styleNode.appendChild(styleText);
  document.head.appendChild(styleNode);

  var SlidemDeck = function (_GluonElement) {
    inherits(SlidemDeck, _GluonElement);

    function SlidemDeck() {
      classCallCheck(this, SlidemDeck);
      return possibleConstructorReturn(this, (SlidemDeck.__proto__ || Object.getPrototypeOf(SlidemDeck)).apply(this, arguments));
    }

    createClass(SlidemDeck, [{
      key: 'connectedCallback',
      value: function connectedCallback() {
        var _this2 = this;

        get(SlidemDeck.prototype.__proto__ || Object.getPrototypeOf(SlidemDeck.prototype), 'connectedCallback', this).call(this);
        this.presenter = p() === 'presenter';
        this.$.presenterToggle.addEventListener('click', function () {
          _this2.presenter = !_this2.presenter;
          changeLocation({ query: _this2.presenter && 'presenter' || '', hash: h$1() });
        });

        // Presenter mode timer
        var timerInterval = void 0;
        this.$.timerToggle.addEventListener('click', function () {
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = undefined;
            _this2.$.timer.innerText = '';
          } else {
            _this2.$.timer.innerText = '00:00';
            var begin = new Date();
            timerInterval = setInterval(function () {
              return _this2.$.timer.innerText = __timer(begin);
            }, 1000);
          }
        });

        this.slides = Array.from(this.children);

        // Create dots for progress bar
        this.slides.forEach(function (slide) {
          _this2.$.progress.appendChild(document.createElement('div'));
        });

        r(function () {
          _this2.slides[_this2.currentSlide].step = _this2.currentStep + 1;
          _this2.slides[_this2.currentSlide].setAttribute('active', '');

          if (_this2.previousSlide === _this2.currentSlide) {
            return;
          }

          if (_this2.previousSlide !== undefined) {
            if (_this2.previousSlide < _this2.currentSlide) {
              _this2.slides[_this2.previousSlide].classList.add('animate-forward');
              _this2.slides[_this2.currentSlide].classList.add('animate-forward');
              _this2.slides[_this2.previousSlide].classList.remove('animate-backward');
              _this2.slides[_this2.currentSlide].classList.remove('animate-backward');
            } else {
              _this2.slides[_this2.previousSlide].classList.add('animate-backward');
              _this2.slides[_this2.currentSlide].classList.add('animate-backward');
              _this2.slides[_this2.previousSlide].classList.remove('animate-forward');
              _this2.slides[_this2.currentSlide].classList.remove('animate-forward');
            }
          }

          if (_this2.oldNextSlide !== undefined) {
            _this2.slides[_this2.oldNextSlide].removeAttribute('next');
          }

          _this2.nextSlide = _this2.slides[_this2.currentSlide + 1] && _this2.currentSlide + 1 || undefined;
          if (_this2.nextSlide !== undefined) {
            _this2.slides[_this2.nextSlide].setAttribute('next', '');
            _this2.oldNextSlide = _this2.nextSlide;
          }

          if (_this2.oldPreviousSlide !== undefined) {
            _this2.slides[_this2.oldPreviousSlide].removeAttribute('previous');
          }

          if (_this2.previousSlide !== undefined) {
            _this2.slides[_this2.previousSlide].removeAttribute('active');
            _this2.slides[_this2.previousSlide].setAttribute('previous', '');
            _this2.$.progress.children[_this2.previousSlide].classList.remove('active');
            _this2.oldPreviousSlide = _this2.previousSlide;
          }

          _this2.$.progress.children[_this2.currentSlide].classList.add('active');

          _this2.previousSlide = _this2.currentSlide;
        });

        var changeLocation = function changeLocation() {
          var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              _ref$path = _ref.path,
              path = _ref$path === undefined ? d() : _ref$path,
              _ref$query = _ref.query,
              query = _ref$query === undefined ? p() : _ref$query,
              _ref$hash = _ref.hash,
              hash = _ref$hash === undefined ? h$1() : _ref$hash;

          path = window.history.pushState({}, '', '' + path + (query && '?' + query || '') + (hash && '#' + hash || ''));
          window.dispatchEvent(new Event('location-changed'));
          localStorage.setItem('location', h$1());
        };

        this.$.forward.onclick = function () {
          if (_this2.slides[_this2.currentSlide].steps && _this2.slides[_this2.currentSlide].step <= _this2.slides[_this2.currentSlide].steps) {
            changeLocation({ hash: 'slide-' + (_this2.currentSlide + 1) + '/step-' + (_this2.slides[_this2.currentSlide].step + 1) });
          } else if (_this2.currentSlide < _this2.slides.length - 1) {
            changeLocation({ hash: 'slide-' + (_this2.currentSlide + 2) + '/step-1' });
          }
        };

        this.$.backward.onclick = function () {
          if (_this2.slides[_this2.currentSlide].steps && _this2.slides[_this2.currentSlide].step > 1) {
            changeLocation({ hash: 'slide-' + (_this2.currentSlide + 1) + '/step-' + (_this2.slides[_this2.currentSlide].step - 1) });
          } else if (_this2.currentSlide > 0) {
            changeLocation({ hash: 'slide-' + _this2.currentSlide + '/step-' + ((_this2.slides[_this2.currentSlide - 1].steps || 0) + 1) });
          }
        };

        // Swipe gesture support
        var touchX = void 0;
        var touchY = void 0;
        document.addEventListener('touchstart', function (e) {
          touchX = e.touches[0].clientX;
          touchY = e.touches[0].clientY;
        }, false);
        document.addEventListener('touchend', function (e) {
          var xMove = e.changedTouches[0].clientX - touchX;
          var yMove = e.changedTouches[0].clientY - touchY;
          if (Math.abs(xMove) > 60 && Math.abs(xMove) > Math.abs(yMove)) {
            if (xMove < 0) {
              _this2.$.forward.onclick();
            } else {
              _this2.$.backward.onclick();
            }
          }
        }, false);

        // FUOC prevention
        this.removeAttribute('loading');

        // Trigger the router to display the first slide
        var init = function init() {
          window.requestAnimationFrame(function () {
            return window.dispatchEvent(new Event('location-changed'));
          });
        };

        var font = this.getAttribute('font');
        if (font) {
          this.style.fontFamily = font;
        }

        // Trigger the init after all fonts are loaded or after 3 sec timeout.
        Promise.all(this.slides.filter(function (slide) {
          return slide.fonts;
        }).map(function (slide) {
          return slide.fonts;
        }).reduce(function (fonts, slideFonts) {
          return fonts.concat(slideFonts);
        }, font && [font] || []).map(function (font) {
          return new FontFaceObserver(font).load();
        })).then(init, init);

        // Shared navigation between browser windows
        window.addEventListener('storage', function (e) {
          if (e.key === 'location') {
            if (h$1() !== e.newValue) {
              changeLocation({ hash: '' + e.newValue });
            }
          }
        });
      }
    }, {
      key: 'template',
      get: function get$$1() {
        return html$1(_templateObject);
      }
    }, {
      key: 'presenter',
      get: function get$$1() {
        return this.getAttribute('presenter') !== null;
      },
      set: function set$$1(value) {
        if (value) {
          this.setAttribute('presenter', '');
        } else {
          this.removeAttribute('presenter');
        }
      }
    }, {
      key: 'currentSlide',
      get: function get$$1() {
        return (h$1().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[1] || 1) - 1;
      }
    }, {
      key: 'currentStep',
      get: function get$$1() {
        return (h$1().match(/(?:slide-(\d+))?(?:\/step-(\d+|Infinity))?/)[2] || 1) - 1;
      }
    }]);
    return SlidemDeck;
  }(h);

  // Returns a string representing elapsed time since 'begin'
  var __timer = function __timer(begin) {
    var time = new Date(new Date() - begin);
    var pad = function pad(t) {
      return t < 10 && '0' + t || t;
    };
    var hours = pad(time.getUTCHours());
    var minutes = pad(time.getUTCMinutes());
    var seconds = pad(time.getUTCSeconds());
    return '' + (time.getUTCHours() && hours + ':' || '') + minutes + ':' + seconds;
  };

  customElements.define(SlidemDeck.is, SlidemDeck);

  var _templateObject$1 = taggedTemplateLiteral(['\n  <style>\n    :host {\n      overflow: hidden;\n      justify-content: center;\n      align-items: center;\n      background-size: cover;\n      background-position: center;\n      display: flex;\n    }\n\n    :host([zoom-in]) #content, :host([zoom-out]) #content {\n      animation-duration: 0.4s;\n      animation-fill-mode: both;\n      animation-timing-function: ease-in-out;\n    }\n\n    @keyframes zoom-in {\n      from {\n        opacity: 0;\n        transform: scale(0);\n      }\n      to {\n        opacity: 1;\n        transform: scale(var(--slidem-content-scale, 1));\n      }\n    }\n\n    @keyframes zoom-out {\n      from {\n        opacity: 1;\n        transform: scale(var(--slidem-content-scale, 1));\n      }\n      to {\n        opacity: 0;\n        transform: scale(0);\n      }\n    }\n\n    :host([zoom-in][active].animate-forward) #content {\n      animation-name: zoom-in;\n    }\n\n    :host([zoom-in][previous].animate-backward) #content {\n      animation-name: zoom-out;\n    }\n\n    :host([zoom-out][previous].animate-forward) #content {\n      animation-name: zoom-out;\n    }\n\n    :host([zoom-out][active].animate-backward) #content {\n      animation-name: zoom-in;\n    }\n\n    #content {\n      width: var(--slidem-content-width, 1760px);\n      max-height: var(--slidem-content-height, 990px);\n      flex-shrink: 0;\n    }\n\n    :host(:not([center])) #content {\n      height: var(--slidem-content-height, 990px);\n    }\n  </style>\n'], ['\n  <style>\n    :host {\n      overflow: hidden;\n      justify-content: center;\n      align-items: center;\n      background-size: cover;\n      background-position: center;\n      display: flex;\n    }\n\n    :host([zoom-in]) #content, :host([zoom-out]) #content {\n      animation-duration: 0.4s;\n      animation-fill-mode: both;\n      animation-timing-function: ease-in-out;\n    }\n\n    @keyframes zoom-in {\n      from {\n        opacity: 0;\n        transform: scale(0);\n      }\n      to {\n        opacity: 1;\n        transform: scale(var(--slidem-content-scale, 1));\n      }\n    }\n\n    @keyframes zoom-out {\n      from {\n        opacity: 1;\n        transform: scale(var(--slidem-content-scale, 1));\n      }\n      to {\n        opacity: 0;\n        transform: scale(0);\n      }\n    }\n\n    :host([zoom-in][active].animate-forward) #content {\n      animation-name: zoom-in;\n    }\n\n    :host([zoom-in][previous].animate-backward) #content {\n      animation-name: zoom-out;\n    }\n\n    :host([zoom-out][previous].animate-forward) #content {\n      animation-name: zoom-out;\n    }\n\n    :host([zoom-out][active].animate-backward) #content {\n      animation-name: zoom-in;\n    }\n\n    #content {\n      width: var(--slidem-content-width, 1760px);\n      max-height: var(--slidem-content-height, 990px);\n      flex-shrink: 0;\n    }\n\n    :host(:not([center])) #content {\n      height: var(--slidem-content-height, 990px);\n    }\n  </style>\n']),
      _templateObject2 = taggedTemplateLiteral(['\n        ', '\n        ', '\n      '], ['\n        ', '\n        ', '\n      ']),
      _templateObject3 = taggedTemplateLiteral(['<slot id="slot"></slot>'], ['<slot id="slot"></slot>']),
      _templateObject4 = taggedTemplateLiteral(['\n        ', '\n        <div id="content">\n          ', '\n        </div>\n      '], ['\n        ', '\n        <div id="content">\n          ', '\n        </div>\n      ']);

  var styleText$1 = document.createTextNode('\n  /* SLIDEM SLIDE GLOBAL STYLES */\n\n  [reveal] {\n    opacity: 0;\n    transition: opacity 0.2s;\n  }\n');

  var styleNode$1 = document.createElement('style');
  styleNode$1.appendChild(styleText$1);
  document.head.appendChild(styleNode$1);

  var slidemStyle = html$1(_templateObject$1);

  var SlidemSlideBase = function (_GluonElement) {
    inherits(SlidemSlideBase, _GluonElement);

    function SlidemSlideBase() {
      classCallCheck(this, SlidemSlideBase);
      return possibleConstructorReturn(this, (SlidemSlideBase.__proto__ || Object.getPrototypeOf(SlidemSlideBase)).apply(this, arguments));
    }

    createClass(SlidemSlideBase, [{
      key: 'connectedCallback',
      value: function connectedCallback() {
        var _this2 = this;

        get(SlidemSlideBase.prototype.__proto__ || Object.getPrototypeOf(SlidemSlideBase.prototype), 'connectedCallback', this).call(this);
        this._steps = Array.from(this.querySelectorAll('[reveal]'));
        this.steps = this._steps.length;
        this.__resizeContent();
        var resizeTimeout = void 0;
        window.addEventListener('resize', function () {
          window.clearTimeout(resizeTimeout);
          resizeTimeout = window.setTimeout(function () {
            _this2.__resizeContent();
          }, 200);
        });
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(attr, oldVal, newVal) {
        if (attr === 'step') {
          var step = Number(newVal);
          if (step > this.steps + 1) {
            this.setAttribute('step', this.steps + 1);
            return;
          }
          this.__setStep(step);
        }
      }
    }, {
      key: '__setStep',
      value: function __setStep(newStep) {
        this._steps.forEach(function (step, i) {
          if (i < newStep - 1) {
            step.style.opacity = 1;
          } else {
            step.style.opacity = 0;
          }
        });
      }
    }, {
      key: '__resizeContent',
      value: function __resizeContent() {
        var width = Number((window.getComputedStyle(document.documentElement).getPropertyValue('--slidem-content-width') || '1760px').slice(0, -2));
        var height = Number((window.getComputedStyle(document.documentElement).getPropertyValue('--slidem-content-height') || '990px').slice(0, -2));
        var scale = Math.min(window.innerHeight / height, window.innerWidth / 1.1 / width);
        if (scale < 1) {
          document.documentElement.style.setProperty('--slidem-content-scale', scale);
          this.$.content && (this.$.content.style.transform = 'scale(' + scale + ')');
        } else {
          document.documentElement.style.setProperty('--slidem-content-scale', 1);
          this.$.content && (this.$.content.style.transform = 'scale(1)');
        }
      }
    }, {
      key: 'template',
      get: function get$$1() {
        if (this.getAttribute('fullscreen') !== null || this.constructor.fullscreen) {
          return html$1(_templateObject2, slidemStyle, this.constructor.name !== 'SlidemSlide' && this.content || html$1(_templateObject3));
        } else {
          return html$1(_templateObject4, slidemStyle, this.constructor.name !== 'SlidemSlide' && this.content || html$1(_templateObject3));
        }
      }
    }, {
      key: 'step',
      set: function set$$1(step) {
        this.setAttribute('step', step);
      },
      get: function get$$1() {
        return Number(this.getAttribute('step')) || 1;
      }
    }], [{
      key: 'observedAttributes',
      get: function get$$1() {
        return ['step'];
      }
    }]);
    return SlidemSlideBase;
  }(h);

  var styleText$2 = document.createTextNode('\n  /* SLIDEM BASIC SLIDE STYLE */\n  slidem-slide h1,\n  slidem-slide h2,\n  slidem-slide h3,\n  slidem-slide h4,\n  slidem-slide h5,\n  slidem-slide h6,\n  slidem-slide p {\n    margin-top: 0px;\n    margin-bottom: 0px;\n  }\n\n  slidem-slide a {\n    color: inherit;\n    text-decoration: none;\n  }\n');

  var styleNode$2 = document.createElement('style');
  styleNode$2.appendChild(styleText$2);
  document.head.appendChild(styleNode$2);

  var SlidemSlide = function (_SlidemSlideBase) {
    inherits(SlidemSlide, _SlidemSlideBase);

    function SlidemSlide() {
      classCallCheck(this, SlidemSlide);
      return possibleConstructorReturn(this, (SlidemSlide.__proto__ || Object.getPrototypeOf(SlidemSlide)).apply(this, arguments));
    }

    createClass(SlidemSlide, [{
      key: 'connectedCallback',
      value: function connectedCallback() {
        get(SlidemSlide.prototype.__proto__ || Object.getPrototypeOf(SlidemSlide.prototype), 'connectedCallback', this).call(this);
        var background = this.getAttribute('background');
        if (background) {
          if (background.match(/^--[a-zA-Z-]*$/)) {
            this.style.background = 'var(' + background + ')';
          } else if (background.match(/^(http|\/|\.)/)) {
            var image = 'url(' + background + ')';
            var darken = this.getAttribute('darken-background');
            if (darken) {
              image = 'linear-gradient(rgba(0,0,0,' + darken + '), rgba(0,0,0,' + darken + ')), ' + image;
            }
            this.style.backgroundImage = image;
          } else {
            this.style.background = background;
          }
        }

        this.textNodes = Array.from(this.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, span'));
        this.textNodes.forEach(function (textNode) {
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
          var color = textNode.getAttribute('color');
          if (color !== null) {
            if (color.match(/^--[a-zA-Z-]*$/)) {
              textNode.style.color = 'var(' + color + ')';
            } else {
              textNode.style.color = color;
            }
          }
        });

        this.layoutNodes = Array.from(this.querySelectorAll('div'));
        this.layoutNodes.forEach(function (layoutNode) {
          if (layoutNode.getAttribute('center') !== null) {
            layoutNode.style.display = 'flex';
            layoutNode.style.justifyContent = 'center';
            layoutNode.style.alignItems = 'center';
          }
        });
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(attr, oldVal, newVal) {
        get(SlidemSlide.prototype.__proto__ || Object.getPrototypeOf(SlidemSlide.prototype), 'attributeChangedCallback', this).call(this, attr, oldVal, newVal);
        if (attr === 'active' || attr === 'next') {
          if (newVal !== null) {
            this.__rescale();
          }
        }
      }
    }, {
      key: '__rescale',
      value: function __rescale() {
        var _this2 = this;

        requestAnimationFrame(function () {
          _this2.textNodes.forEach(function (textNode) {
            if (textNode.getAttribute('fit') !== null) {
              textNode.style.display = 'table';
              textNode.style.whiteSpace = 'nowrap';
              var refFontSize = parseFloat(window.getComputedStyle(textNode, null).getPropertyValue('font-size'));
              var refWidth = _this2.$.content.clientWidth;
              textNode.style.fontSize = Math.floor(refFontSize * refWidth / textNode.clientWidth) + 'px';
            }
          });
        });
      }
    }], [{
      key: 'observedAttributes',
      get: function get$$1() {
        var attrs = get(SlidemSlide.__proto__ || Object.getPrototypeOf(SlidemSlide), 'observedAttributes', this) || [];
        Array.prototype.push.apply(attrs, ['active', 'next']);
        return attrs;
      }
    }]);
    return SlidemSlide;
  }(SlidemSlideBase);

  customElements.define(SlidemSlide.is, SlidemSlide);

  var _templateObject$2 = taggedTemplateLiteral(['\n      <div class="introSlide">\n        <div class="side">\n          <div class="avatar"><slot name="avatar"></slot></div>\n          <div class="speakerDetails">\n            <slot name="speaker"></slot>\n            <div>\n              <slot name="email"></slot>\n            </div>\n            <div>\n              <slot name="twitter"></slot>\n            </div>\n          </div>\n          <div class="logo">\n            <slot name="logo"></slot>\n          </div>\n        </div>\n        <div class="event">\n          <slot name="event"></slot>\n        </div>\n        <slot name="title"></slot>\n        <slot name="subtitle"></slot>\n      </div>\n    '], ['\n      <div class="introSlide">\n        <div class="side">\n          <div class="avatar"><slot name="avatar"></slot></div>\n          <div class="speakerDetails">\n            <slot name="speaker"></slot>\n            <div>\n              <slot name="email"></slot>\n            </div>\n            <div>\n              <slot name="twitter"></slot>\n            </div>\n          </div>\n          <div class="logo">\n            <slot name="logo"></slot>\n          </div>\n        </div>\n        <div class="event">\n          <slot name="event"></slot>\n        </div>\n        <slot name="title"></slot>\n        <slot name="subtitle"></slot>\n      </div>\n    ']),
      _templateObject2$1 = taggedTemplateLiteral(['\n      <style>\n        :host {\n          background: #2e9be6;\n          font-family: \'Roboto\';\n        }\n        .introSlide {\n          overflow: hidden;\n          border-bottom: 3px solid white;\n          color: white;\n          position: relative;\n          height: 100%;\n        }\n\n        .topShade {\n          position: absolute;\n          top: 0;\n          left: 0;\n          right: 0;\n          height: 34px;\n          background: rgba(0, 0, 0, 0.2);\n        }\n\n        .introSlide .event {\n          position: absolute;\n          bottom: 26px;\n          left: 0;\n        }\n\n        .introSlide .event ::slotted([slot="event"]) {\n          margin: 0;\n          font-size: 24px;\n          letter-spacing: 1px;\n          font-weight: 700;\n        }\n\n        .introSlide .side {\n          position: absolute;\n          right: 0;\n          width: 340px;\n          height: 100%;\n          display: flex;\n          flex-flow: column;\n          justify-content: flex-end;\n        }\n\n        .introSlide .side * {\n          flex-shrink: 0;\n        }\n\n        .introSlide .avatar {\n          height: 340px;\n          width: 340px;\n          border-radius: 50%;\n          overflow: hidden;\n          margin-bottom: 56px;\n        }\n\n        .introSlide ::slotted([slot="avatar"]) {\n          max-width: 340px;\n        }\n\n        .introSlide .speakerDetails {\n          border-top: 3px solid white;\n          padding-top: 50px;\n          padding-bottom: 30px;\n        }\n\n\n        .introSlide .speakerDetails ::slotted([slot="speaker"]) {\n          font-weight: 400;\n          margin-top: 0;\n          margin-bottom: 20px;\n          font-size: 32px;\n          letter-spacing: 1px;\n        }\n\n        .introSlide .speakerDetails div {\n          margin-bottom: 20px;\n        }\n\n        .introSlide .speakerDetails div ::slotted([slot="email"]),\n        .introSlide .speakerDetails div ::slotted([slot="twitter"]) {\n          color: white;\n          font-weight: 500;\n          font-size: 28px;\n          letter-spacing: 1px;\n        }\n\n        .introSlide .logo {\n          display: flex;\n          justify-content: center;\n          align-items: center;\n          height: 260px;\n          background-color: white;\n        }\n\n        .introSlide .logo ::slotted([slot="logo"]) {\n          max-height: 200px;\n          max-width: 300px;\n          background-position: center;\n          background-size: contain;\n        }\n\n        .introSlide ::slotted([slot="title"]) {\n          margin-top: 190px;\n          margin-bottom: 0;\n          font-weight: 500;\n          font-size: 150px;\n          color: white;\n          letter-spacing: 2px;\n        }\n\n        .introSlide ::slotted([slot="subtitle"]) {\n          display: inline-block;\n          margin-top: 40px;\n          font-weight: 400;\n          font-size: 100px;\n          letter-spacing: 2px;\n          color: white;\n          padding-top: 40px;\n          border-top: 3px solid white;\n        }\n      </style>\n      <div class="topShade"></div>\n      ', '\n    '], ['\n      <style>\n        :host {\n          background: #2e9be6;\n          font-family: \'Roboto\';\n        }\n        .introSlide {\n          overflow: hidden;\n          border-bottom: 3px solid white;\n          color: white;\n          position: relative;\n          height: 100%;\n        }\n\n        .topShade {\n          position: absolute;\n          top: 0;\n          left: 0;\n          right: 0;\n          height: 34px;\n          background: rgba(0, 0, 0, 0.2);\n        }\n\n        .introSlide .event {\n          position: absolute;\n          bottom: 26px;\n          left: 0;\n        }\n\n        .introSlide .event ::slotted([slot="event"]) {\n          margin: 0;\n          font-size: 24px;\n          letter-spacing: 1px;\n          font-weight: 700;\n        }\n\n        .introSlide .side {\n          position: absolute;\n          right: 0;\n          width: 340px;\n          height: 100%;\n          display: flex;\n          flex-flow: column;\n          justify-content: flex-end;\n        }\n\n        .introSlide .side * {\n          flex-shrink: 0;\n        }\n\n        .introSlide .avatar {\n          height: 340px;\n          width: 340px;\n          border-radius: 50%;\n          overflow: hidden;\n          margin-bottom: 56px;\n        }\n\n        .introSlide ::slotted([slot="avatar"]) {\n          max-width: 340px;\n        }\n\n        .introSlide .speakerDetails {\n          border-top: 3px solid white;\n          padding-top: 50px;\n          padding-bottom: 30px;\n        }\n\n\n        .introSlide .speakerDetails ::slotted([slot="speaker"]) {\n          font-weight: 400;\n          margin-top: 0;\n          margin-bottom: 20px;\n          font-size: 32px;\n          letter-spacing: 1px;\n        }\n\n        .introSlide .speakerDetails div {\n          margin-bottom: 20px;\n        }\n\n        .introSlide .speakerDetails div ::slotted([slot="email"]),\n        .introSlide .speakerDetails div ::slotted([slot="twitter"]) {\n          color: white;\n          font-weight: 500;\n          font-size: 28px;\n          letter-spacing: 1px;\n        }\n\n        .introSlide .logo {\n          display: flex;\n          justify-content: center;\n          align-items: center;\n          height: 260px;\n          background-color: white;\n        }\n\n        .introSlide .logo ::slotted([slot="logo"]) {\n          max-height: 200px;\n          max-width: 300px;\n          background-position: center;\n          background-size: contain;\n        }\n\n        .introSlide ::slotted([slot="title"]) {\n          margin-top: 190px;\n          margin-bottom: 0;\n          font-weight: 500;\n          font-size: 150px;\n          color: white;\n          letter-spacing: 2px;\n        }\n\n        .introSlide ::slotted([slot="subtitle"]) {\n          display: inline-block;\n          margin-top: 40px;\n          font-weight: 400;\n          font-size: 100px;\n          letter-spacing: 2px;\n          color: white;\n          padding-top: 40px;\n          border-top: 3px solid white;\n        }\n      </style>\n      <div class="topShade"></div>\n      ', '\n    ']);

  var styleText$3 = document.createTextNode('\n  /* POLYMER SUMMIT SLIDE GLOBAL STYLES */\n  @font-face {\n    font-family: \'Roboto\';\n    font-style: normal;\n    font-weight: 400;\n    src: local(\'Roboto\'), local(\'Roboto-Regular\'), url(https://fonts.gstatic.com/s/roboto/v16/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2) format(\'woff2\');\n    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;\n  }\n\n  @font-face {\n    font-family: \'Roboto\';\n    font-style: normal;\n    font-weight: 500;\n    src: local(\'Roboto Medium\'), local(\'Roboto-Medium\'), url(https://fonts.gstatic.com/s/roboto/v16/RxZJdnzeo3R5zSexge8UUZBw1xU1rKptJj_0jans920.woff2) format(\'woff2\');\n    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;\n  }\n\n  @font-face {\n    font-family: \'Roboto\';\n    font-style: normal;\n    font-weight: 700;\n    src: local(\'Roboto Bold\'), local(\'Roboto-Bold\'), url(https://fonts.gstatic.com/s/roboto/v16/d-6IYplOFocCacKzxwXSOJBw1xU1rKptJj_0jans920.woff2) format(\'woff2\');\n    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215;\n  }\n');

  var styleNode$3 = document.createElement('style');
  styleNode$3.appendChild(styleText$3);
  document.head.appendChild(styleNode$3);

  var SlidemPolymersummitSlide = function (_SlidemSlideBase) {
    inherits(SlidemPolymersummitSlide, _SlidemSlideBase);

    function SlidemPolymersummitSlide() {
      classCallCheck(this, SlidemPolymersummitSlide);
      return possibleConstructorReturn(this, (SlidemPolymersummitSlide.__proto__ || Object.getPrototypeOf(SlidemPolymersummitSlide)).apply(this, arguments));
    }

    createClass(SlidemPolymersummitSlide, [{
      key: 'fonts',
      get: function get$$1() {
        return ['Roboto'];
      }
    }, {
      key: 'template',
      get: function get$$1() {
        this.content = html$1(_templateObject$2);

        return html$1(_templateObject2$1, get(SlidemPolymersummitSlide.prototype.__proto__ || Object.getPrototypeOf(SlidemPolymersummitSlide.prototype), 'template', this));
      }
    }]);
    return SlidemPolymersummitSlide;
  }(SlidemSlideBase);

  customElements.define(SlidemPolymersummitSlide.is, SlidemPolymersummitSlide);

  var _templateObject$3 = taggedTemplateLiteral(['\n      <video controls id="video"></video>\n    '], ['\n      <video controls id="video"></video>\n    ']),
      _templateObject2$2 = taggedTemplateLiteral(['\n      <style>\n        :host {\n          background: black;\n          color: white;\n        }\n\n        video {\n          width: 100%;\n          max-height: 100%;\n          max-width: 100%;\n        }\n      </style>\n      ', '\n    '], ['\n      <style>\n        :host {\n          background: black;\n          color: white;\n        }\n\n        video {\n          width: 100%;\n          max-height: 100%;\n          max-width: 100%;\n        }\n      </style>\n      ', '\n    ']);

  var SlidemVideoSlide = function (_SlidemSlideBase) {
    inherits(SlidemVideoSlide, _SlidemSlideBase);

    function SlidemVideoSlide() {
      classCallCheck(this, SlidemVideoSlide);
      return possibleConstructorReturn(this, (SlidemVideoSlide.__proto__ || Object.getPrototypeOf(SlidemVideoSlide)).apply(this, arguments));
    }

    createClass(SlidemVideoSlide, [{
      key: 'connectedCallback',
      value: function connectedCallback() {
        get(SlidemVideoSlide.prototype.__proto__ || Object.getPrototypeOf(SlidemVideoSlide.prototype), 'connectedCallback', this).call(this);
        this.$.video.src = this.getAttribute('video');
        this.$.video.muted = this.getAttribute('muted') !== null;
      }
    }, {
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(attr, oldVal, newVal) {
        get(SlidemVideoSlide.prototype.__proto__ || Object.getPrototypeOf(SlidemVideoSlide.prototype), 'attributeChangedCallback', this).call(this, attr, oldVal, newVal);
        if (attr === 'active') {
          if (newVal !== null) {
            this.$.video.currentTime = 0;
            this.$.video.play();
          } else {
            this.$.video.pause();
          }
        }
      }
    }, {
      key: 'template',
      get: function get$$1() {
        this.content = html$1(_templateObject$3);

        return html$1(_templateObject2$2, get(SlidemVideoSlide.prototype.__proto__ || Object.getPrototypeOf(SlidemVideoSlide.prototype), 'template', this));
      }
    }], [{
      key: 'observedAttributes',
      get: function get$$1() {
        var attrs = get(SlidemVideoSlide.__proto__ || Object.getPrototypeOf(SlidemVideoSlide), 'observedAttributes', this) || [];
        Array.prototype.push.apply(attrs, ['active']);
        return attrs;
      }
    }]);
    return SlidemVideoSlide;
  }(SlidemSlideBase);

  customElements.define(SlidemVideoSlide.is, SlidemVideoSlide);

}());
