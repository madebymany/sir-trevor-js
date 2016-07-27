"use strict";

import selectionRange from 'selection-range';

  // Remove any empty elements at the start of the range.
export var stripFirstEmptyElement = function(div) {
  if (div.firstChild === null) { return; }

  var firstChild = div.firstChild.childNodes[0];
  if (firstChild && firstChild.nodeName !== '#text') {
    if (firstChild.innerText === '') {
      div.firstChild.removeChild(firstChild);
    }
  }
};

export var rangeToHTML = function(range, extract) {
  var div = document.createElement('div');
  if (extract) {
    div.appendChild(range.extractContents());
  } else {
    div.appendChild(range.cloneContents());
  }
  
  stripFirstEmptyElement(div);

  // Sometimes you'll get an empty tag at the start of the block.
  if (div.firstChild && div.firstChild.nodeName !== '#text') {
    div = div.lastChild;
  }

  return div.innerHTML.trim();
};

export var selectToEnd = function(scribe) {
  var selection = new scribe.api.Selection();
  var range = selection.range.cloneRange();
  range.setEndAfter(scribe.el.lastChild, 0);

  return range;
};

export var isAtStartOfContent = function(scribe) {
  if (scribe.getTextContent() === '') { return true; }

  var selection = new scribe.api.Selection();
  var range = selection.range.cloneRange();

  range.setStartBefore(scribe.el.firstChild, 0);

  return rangeToHTML(range, false) === '';
};

export var getTotalLength = function(scribe) {
  var selection = new scribe.api.Selection();
  var range = selection.range.cloneRange();
  range.selectNodeContents(scribe.el);

  return range.toString().length;
};

export var isAtEndOfContent = function(scribe) {
  var currentRange = selectionRange(scribe.el);

  return (getTotalLength(scribe) === currentRange.end) && (currentRange.start === currentRange.end);
};

export var currentPosition = function(scribe) {
  var selection = new scribe.api.Selection();
  return selection.range.startOffset;
};
