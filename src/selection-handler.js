"use strict";

var _ = require('./lodash');
var Dom = require('./packages/dom');

var SelectionHandler = function(wrapper, mediator, editor) {
  this.wrapper = wrapper;
  this.mediator = mediator;
  this.editor = editor;
  this.options = editor.options;

  this.startIndex = undefined;
  this.endIndex = undefined;
  this.selecting = false;

  this._bindFunctions();
  this._bindMediatedEvents();

  this.initialize();
};

Object.assign(SelectionHandler.prototype, require('./function-bind'), require('./mediated-events'), {

  eventNamespace: 'selection',

  mediatedEvents: {
    'start': 'start',
    'render': 'render',
    'complete': 'complete',
    'all': 'all',
    'copy': 'copy',
    'update': 'update',
    'delete': 'delete',
    'cancel': 'cancel'
  },

  cancelSelectAll: function() {
    // Don't select if within an input field
    var editorEl = Dom.getClosest(document.activeElement, 'input');
    if (editorEl !== document.body) return true;
    // Don't select all if focused on element outside of the editor.
    if (this.options.selectionLimitToEditor) {
      var editorEl = Dom.getClosest(document.activeElement, '.st-outer');
      if (editorEl === document.body) return true;
    }
  },

  initialize: function() {
    window.addEventListener("keydown", (e) => {
      e = e || window.event;
      var ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (this.options.selectionCopy && e.key === "a") {
        if (this.cancelSelectAll()) return;
        e.preventDefault();
        this.mediator.trigger("selection:all");
      } else if (this.options.selectionCopy && e.key === "c") {
        this.mediator.trigger("selection:copy");
      } else if (this.options.selectionDelete && e.key === "x") {
        this.mediator.trigger("selection:delete");
      }
    }, false);

    window.addEventListener("click", () => {
      this.mediator.trigger("selection:complete");
      this.mediator.trigger("selection:cancel");
    });
  },

  start: function(index) {
    this.startIndex = this.endIndex = index;
    window.mouseDown = true;
    this.mediator.trigger("selection:render");
    window.addEventListener("mousemove", this.onMouseMove);
  },

  onMouseMove: function() {},

  update: function(index) {
    this.endIndex = index;
    this.selecting = this.startIndex !== this.endIndex;
    this.mediator.trigger("selection:render");
  },

  complete: function() {
    this.selecting = false;
    window.removeEventListener("mousemove", this.onMouseMove);
  },

  all: function() {
    this.removeNativeSelection();

    var blocks = this.editor.getBlocks();
    this.selecting = true;
    this.startIndex = 0;
    this.endIndex = blocks.length;
    this.mediator.trigger("selection:render");
  },

  cancel: function() {
    this.mouseDown = false;
    this.render();
  },

  removeNativeSelection: function() {
    var sel = window.getSelection ? window.getSelection() : document.selection;
    if (sel) {
      if (sel.removeAllRanges) {
        sel.removeAllRanges();
      } else if (sel.empty) {
        sel.empty();
      }
    }
    document.activeElement && document.activeElement.blur();
  },

  render: function() {
    this.editor.getBlocks().forEach((blockEl, idx) => {
      var block = this.editor.findBlockById(blockEl.getAttribute('id'));
      block.select(this.selecting && idx >= Math.min(this.startIndex, this.endIndex) && idx <= Math.max(this.startIndex, this.endIndex));
    });
  },

  copy: function() {
    this.editor.getData();

    var copyArea = document.body.querySelector(".st-copy-area");
    if (!copyArea) {
      copyArea = Dom.createElement("div", {
        contenteditable: true,
        class: 'st-copy-area',
      });
      document.body.appendChild(copyArea);
    }

    var output = [];

    this.editor.getBlocks().forEach((blockEl, idx) => {
      var _selected = idx >= Math.min(this.startIndex, this.endIndex) && idx <= Math.max(this.startIndex, this.endIndex);
      if (!_selected) return;

      var _block = this.editor.findBlockById(blockEl.getAttribute('id'));
      if (_block) {
        output.push( _block.asClipboardHTML() );
      }
    });

    copyArea.innerHTML = output.join("\n");

    setTimeout(() => {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(copyArea);
      selection.removeAllRanges();
      selection.addRange(range);

      try {
        // copy text
        document.execCommand('copy');
        copyArea.blur();
      }
      catch (err) {
        alert('please press Ctrl/Cmd+C to copy');
      }
    }, 0);
  },

  delete: function() {
    this.editor.getBlocks().forEach((blockEl, idx) => {
      var _selected = idx >= Math.min(this.startIndex, this.endIndex) && idx <= Math.max(this.startIndex, this.endIndex);
      if (!_selected) return;

      var _block = this.editor.findBlockById(blockEl.getAttribute('id'));
      if (_block) {
        this.mediator.trigger("block:remove", _block.blockID, { focusOnNext: true });
      }
    });
  }

});

module.exports = SelectionHandler;
