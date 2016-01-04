"use strict";

var _ = require('../lodash');

// disabling undefined warnings until jshint can handle argument destructing

let Dom = Object.create(null);

Dom.setAttributes = (el, attributes = {}) => {

  if (attributes.html) {
    el.innerHTML = _.result(attributes, 'html');
    delete attributes.html;
  }

  if (attributes.text) {
    el.textContent = attributes.text;
    delete attributes.text;
  }

  Object.keys(attributes).forEach((key) => {
    el.setAttribute(key, attributes[key]);
  });
  return el;
};

Dom.createElement = (tagName, attributes = {}) => {
  let el = document.createElement(tagName);
  Dom.setAttributes(el, attributes);
  return el;
};

Dom.insertAfter = (el, referenceNode) => {
  referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
};

Dom.remove = (el) => {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
};

Dom.replaceWith = (el, referenceNode) => {
  Dom.remove(referenceNode);
  el.outerHTML = referenceNode;
};

Dom.hide = (el) => {
  el.style.display = 'none';
};

Dom.show = (el) => {
  el.style.display = '';
};

Dom.matches = (function(proto) {
  var matcher =
    proto.matchesSelector ||
    proto.mozMatchesSelector ||
    proto.msMatchesSelector ||
    proto.oMatchesSelector ||
    proto.webkitMatchesSelector ||
    function (selector) {
      var element = this;
      var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
      var i = 0;
      while (matches[i] && matches[i] !== element) {
        i++;
      }
      return matches[i] ? true : false;
    };
  return function(el, selector){
    return matcher.call(el, selector);
  };
})(Element.prototype);

Dom.getClosest = function(elem, selector) {
  for (elem; elem && elem !== document.body; elem = elem.parentNode) {
    if (Dom.matches(elem, selector)) {
      break;
    }
  }
  return elem;
};

Dom.wrap = function(toWrap, wrapper) {
  wrapper = wrapper || document.createElement('div');
  if (toWrap.nextSibling) {
      toWrap.parentNode.insertBefore(wrapper, toWrap.nextSibling);
  } else {
      toWrap.parentNode.appendChild(wrapper);
  }
  return wrapper.appendChild(toWrap);
};

Dom.createDocumentFragmentFromString = function(html) {
  var frag = document.createDocumentFragment();
  var elem = document.createElement('div');
  elem.innerHTML = html;

  while (elem.childNodes[0]) {
      frag.appendChild(elem.childNodes[0]);
  }
  return frag;
};

module.exports = Dom;
