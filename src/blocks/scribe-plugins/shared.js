"use strict";

var selectionRange = require('selection-range');

var utils = require('../../utils');

var selectToEnd = function(scribe) {
  var selection = new scribe.api.Selection();
  var range = selection.range.cloneRange();
  range.setEndAfter(scribe.el.lastChild, 0);

  return range;
};

var isAtStart = function(scribe) {
  var currentRange = selectionRange(scribe.el);

  return (
    currentRange.start === 0 &&
    currentRange.end === 0 &&
    currentRange.atStart
  );
};

var getTotalLength = function(scribe) {
  var selection = new scribe.api.Selection();
  var range = selection.range.cloneRange();
  range.selectNodeContents(scribe.el);

  return range.toString().length;
};

var isAtEnd = function(scribe) {
  var currentRange = selectionRange(scribe.el);

  return (getTotalLength(scribe) === currentRange.end) && (currentRange.start === currentRange.end);
};

var isSelectedToEnd = function(scribe) {
  var currentRange = selectionRange(scribe.el);

  return (getTotalLength(scribe) === currentRange.end);
}

var isSelectedFromStart = function(scribe) {
  var currentRange = selectionRange(scribe.el);

  return currentRange.atStart && currentRange.start === 0;
}

// Remove any empty elements at the start of the range.
var stripFirstEmptyElement = function(div) {
  if (div.firstChild === null) { return; }

  var firstChild = div.firstChild.childNodes[0];
  if (firstChild && firstChild.nodeName !== '#text') {
    if (firstChild.innerText === '') {
      div.firstChild.removeChild(firstChild);
    }
  }
};

var createBlocksFromParagraphs = function(block, scribe) {
  var fakeContent = document.createElement('div');
  fakeContent.appendChild(selectToEnd(scribe).extractContents());

  stripFirstEmptyElement(fakeContent);

  // Add wrapper div which is missing in non blockElement scribe.
  if (!scribe.allowsBlockElements()) {
    var tempContent = document.createElement('div');
    tempContent.appendChild(fakeContent);
    fakeContent = tempContent;
  }

  if (fakeContent.childNodes.length >= 1) {
    var data;
    var nodes = [].slice.call(fakeContent.childNodes);
    nodes.reverse().forEach(function(node) {
      if (node.innerText !== '') {
        data = {
          format: 'html',
          text: node.innerHTML.trim()
        };
        block.mediator.trigger("block:create", block.type, data, block.el, { autoFocus: true });
      }
    });
  }
};

var rangeToHTML = function(range) {
  var div = document.createElement('div');
  div.appendChild(range.extractContents());

  return div.innerHTML;
};

var trimScribeContent = function(scribe) {
  // Remove any whitespace in the first node, otherwise selections won't work.
  var firstNode = scribe.node.firstDeepestChild(scribe.el);
  if (firstNode.nodeName === '#text') {
    firstNode.textContent = utils.leftTrim(firstNode.textContent);
  }

  // Remove all empty nodes at the front to get blocks working.
  // Don't remove nodes that can't contain text content (e.g. <input>)
  while (scribe.el.firstChild && scribe.el.firstChild.textContent === '' && document.createElement(scribe.el.firstChild.tagName).outerHTML.indexOf("/") != -1) {
    scribe.el.removeChild(scribe.el.firstChild);
  }

  // Remove all empty nodes at the end to get blocks working.
  // Don't remove nodes that can't contain text content (e.g. <input>)
  while (scribe.el.lastChild && scribe.el.lastChild.textContent === '' && document.createElement(scribe.el.lastChild.tagName).outerHTML.indexOf("/") != -1) {
    scribe.el.removeChild(scribe.el.lastChild);
  }

  // Firefox adds empty br tags at the end of content.
  while(scribe.el.lastChild && scribe.el.lastChild.nodeName === 'BR') {
    scribe.el.removeChild(scribe.el.lastChild);
  }
}

export {
  createBlocksFromParagraphs,
  getTotalLength,
  isAtStart,
  isAtEnd,
  selectToEnd,
  isSelectedFromStart,
  isSelectedToEnd,
  rangeToHTML,
  trimScribeContent
};
