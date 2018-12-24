"use strict";

var selectionRange = require('selection-range');

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

export {
  getTotalLength,
  isAtStart,
  isAtEnd,
  selectToEnd
};
