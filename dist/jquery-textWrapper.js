(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.jQueryTextWrapper = factory());
}(this, (function () { 'use strict';

/**
 * Allow the user to use shortcuts
 * @constructor
 */
function ShortcutHandler() {
  var keyCurrentlyPressed = [];
  // Special code-to-name mapping
  var keyMap = { "17": "CTRL" };
  var listeners = [];

  /**
   * Return true if the key is pressed
   * @param name
   * @returns {boolean}
   */
  function isKeyPressed(name) {
    return keyCurrentlyPressed.indexOf(name) >= 0;
  }

  /**
   * Return the key name for ASCII code
   * @param code
   * @returns {*}
   */
  function getKeyNameForCode(code) {
    if (keyMap[code]) return keyMap[code];
    return String.fromCharCode(code);
  }

  /**
   * Check that a listener is currently waiting for the current call
   */
  function check() {
    listeners.forEach(function (listener) {
      var currentCombination = keyCurrentlyPressed.join("+");
      if (currentCombination === listener.combination) {
        listener.callback();
      }
    });
  }

  /**
   * Handle pressing down
   * @param event
   * @returns
   */
  this.handleKeyDown = function handleKeyDown(event) {
    var keyName = getKeyNameForCode(event.which);

    // If the CTRL key is not pressed already we don't need to go further.
    if (isKeyPressed("CTRL") === false && event.which !== 17) return;

    if (keyCurrentlyPressed.indexOf(keyName) < 0) {
      event.preventDefault();
      keyCurrentlyPressed.push(keyName);
      check();
      return false;
    }
  };

  /**
   * Handle pressing up
   * @param event
   */
  this.handleKeyUp = function handleKeyUp(event) {
    var keyName = getKeyNameForCode(event.which);
    if (keyCurrentlyPressed.indexOf(keyName) >= 0) {
      keyCurrentlyPressed.splice(keyCurrentlyPressed.indexOf(keyName), 1);
      check();
    }
  };

  /**
   * Hook to call a function when a combination of keys is pressed
   * @param combination
   * @param callback
   */
  this.onPress = function onPress(combination, callback) {
    listeners.push({
      combination: combination,
      callback: callback
    });
  };
}

var ShortcutHandler_1 = ShortcutHandler;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Wrap the selected text in the element
 * @param el
 * @param startTag
 * @param endTag
 */
function wrap(el, startTag, endTag) {
  var selectedText = el.val().slice(el.prop("selectionStart"), el.prop("selectionEnd"));

  if (!selectedText) return; // We don't need to wrap anything if no text is selected

  var nextText = wrapText(el.val(), el.prop("selectionStart"), el.prop("selectionEnd"), startTag + selectedText + endTag);

  el.val(nextText);
}

/**
 * Wrap the text
 * @param text
 * @param selectionStart
 * @param selectionEnd
 * @param wrapBy
 * @returns {*}
 */
function wrapText(text, selectionStart, selectionEnd, wrapBy) {
  var textBefore = text.slice(0, selectionStart);
  var textAfter = text.slice(selectionEnd);
  return textBefore + wrapBy + textAfter;
}

/**
 * Return the (html) attribute name
 * Javascript has a reserved class keywords so, in definitions, we convert className to class for example.
 * @param key
 * @returns {*}
 */
function getAttributeName(key) {
  if (key === "className") return "class";
  return key;
}

/**
 * Force the value into an array
 * @param value
 * @param copyIfIsArray
 * @returns {*}
 */
function forceArray(value, copyIfIsArray) {
  return Array.isArray(value) ? copyIfIsArray ? value.slice() : value : [];
}

/**
 * Create definitions for buttons
 * @param definitions
 * @returns {Array.<*>}
 */
function createDefinitions(definitions) {
  if ($.fn.textWrapper.defaults && $.fn.textWrapper.defaults.definitions) {
    return [].concat($.fn.textWrapper.defaults.definitions, forceArray(definitions));
  } else {
    return forceArray(definitions, true);
  }
}

$(document).ready(function () {
  /**
   * Allow a textarea's selected content to be wrapped in custom elements such has BBCode or HTML tags.
   *
   * @param options
   * An object of options
   * - definitions : an array of definition
   *   We call "definition" what define a tag. It's composed of :
   *   - startTag : the first element that will surround the text
   *   - endTag : the last element that will surround the text
   *   - label : the name to display
   *   - attr : an object where keys are HTML attributes and values are the values of the attributes
   *     beware that to add a class, you should use className.
   * - buttonContainer : a jQuery element that will host all the buttons
   */
  $.fn.textWrapper = function (options) {
    var defs = createDefinitions(options.definitions);
    var textArea = $(this);

    var shortcutHandler = new ShortcutHandler_1();

    textArea.keydown(shortcutHandler.handleKeyDown);
    textArea.keyup(shortcutHandler.handleKeyUp);

    // Creating buttons from their definitions
    var buttons = defs.map(function (def) {
      var button = $('<button type="button">' + def.label + '</button>');
      var innerWrap = function innerWrap() {
        wrap(textArea, def.startTag, def.endTag);
      };

      button.click(innerWrap);

      // Adding user defined attributes to the HTML element
      if (_typeof(def.attr) === "object" && def.attr !== null) {
        Object.keys(def.attr).forEach(function (key) {
          button.attr(getAttributeName(key), def.attr[key]);
        });
      }

      // Handling shortcut
      if (typeof def.shortcut === "string") {
        shortcutHandler.onPress(def.shortcut, innerWrap);
      }

      return button;
    }.bind(this));

    // Appending the buttons dynamically
    buttons.forEach(function (button) {
      options.buttonContainer.append(button);
    });
  };
});

var src = {};

return src;

})));
