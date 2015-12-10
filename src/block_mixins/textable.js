"use strict";

var selectionRange = require('selection-range');

module.exports = {
  mixinName: 'Textable',

  initializeTextable: function() {
    this.el.classList.add('st-block--textable');
  },

  focusAtEnd: function() {
    this.focus();
    this.selectText();
  },

  selectText: function() {
    var range = document.createRange();
    range.collapse(false);
    range.setStartAfter(this._scribe.el.firstChild, 0);
    var selection = new this._scribe.api.Selection();
    selection.selection.removeAllRanges();
    selection.selection.addRange(range);
  },

  getScribeInnerContent: function(block) {
    var content = '';
    if (this._scribe.getTextContent() !== '') {
      var fakeContent = document.createElement('div');
      fakeContent.innerHTML = this.getTextBlockHTML();
      content = fakeContent.firstChild.innerHTML || fakeContent.innerHTML;
      return content.replace(/^[\s\uFEFF\xA0]+|$/g, '');
    }
    return content;
  },

  getCaretPositionAtEnd: function() {
    this.selectText();

    return selectionRange(this._scribe.el);
  },

  appendContent: function(content, options) {
    options = options || {};

    var caretPosition = this.getCaretPositionAtEnd();

    var currentContent = this.getScribeInnerContent();
    if (currentContent !== '') {
      content = currentContent + content;
    }

    if (content === '') {
      content = '<br>';
    }

    this.setTextBlockHTML(content);

    this.focus();

    if (options.keepCaretPosition && caretPosition.start !== 0 && caretPosition.end !== 0) {
      selectionRange(this._scribe.el, {
        start: caretPosition.start, 
        end: caretPosition.end
      });
    }
  }
};
