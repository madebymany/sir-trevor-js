"use strict";

var _ = require('./lodash');
var Dom = require('./packages/dom');

var SelectionHandler = function(wrapper, mediator, editor) {
  this.wrapper = wrapper;
  this.mediator = mediator;
  this.editor = editor;
  this.options = editor.options;

  this.startIndex = this.endIndex = 0;
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
    var editorEl1 = Dom.getClosest(document.activeElement, 'input');
    if (editorEl1 !== document.body) return true;

    var editorEl2 = Dom.getClosest(document.activeElement, '.st-outer');

    // Don't select all if focused on element outside of the editor.
    if (this.options.selectionLimitToEditor) {
      if (editorEl2 !== this.wrapper) return true;
    }
  },

  initialize: function() {
    window.addEventListener("keydown", (e) => {
      e = e || window.event;
      var ctrlKey = e.ctrlKey || e.metaKey;
      var key = e.key;

      if (ctrlKey) {
        if (this.options.selectionCopy && key === "a") {
          if (this.cancelSelectAll()) return;
          e.preventDefault();
          this.mediator.trigger("selection:all");
        } else if (this.options.selectionCopy && key === "c") {
          if (!this.selecting) return;
          e.preventDefault();
          this.mediator.trigger("selection:copy");
        } else if (this.options.selectionDelete && key === "x") {
          this.mediator.trigger("selection:delete");
        }
      } else if (this.selecting && ["Down", "ArrowDown"].indexOf(key) > -1) {
        e.preventDefault();
        if (e.shiftKey && e.altKey) this.expandToEnd();
        else if (e.shiftKey) this.expand(1);
        else if (e.altKey) this.startAtEnd();
        else this.move(1);
        this.focusAtEnd();
      } else if (this.selecting && ["Up", "ArrowUp"].indexOf(key) > -1) {
        e.preventDefault();
        if (e.shiftKey && e.altKey) this.expandToStart();
        else if (e.shiftKey) this.expand(-1);
        else if (e.altKey) this.start(0);
        else this.move(-1);
        this.focusAtEnd();
      }
    }, false);

    if (this.options.selectionMouse) {
      window.addEventListener('mouseup', () => {
        if (!window.mouseDown) {
          this.mediator.trigger("selection:complete");
          this.mediator.trigger("selection:cancel");
          return;
        }

        window.mouseDown = false;
        this.mediator.trigger("selection:complete");
      });
    }
  },

  start: function(index, options = {}) {
    options = Object.assign({ mouseEnabled: false }, options);

    this.startIndex = this.endIndex = index;
    this.mediator.trigger("selection:render");

    if (options.mouseEnabled) {
      window.mouseDown = true;
      window.addEventListener("mousemove", this.onMouseMove);
    }
  },

  startAtEnd: function() {
    this.start(this.editor.getBlocks().length - 1);
  },

  move: function(offset) {
    this.start(this.endIndex + offset);
  },

  onMouseMove: function() {},

  update: function(index) {
    this.endIndex = index;
    this.selecting = this.startIndex !== this.endIndex;
    this.mediator.trigger("selection:render");
  },

  expand(offset) {
    this.update(this.endIndex + offset);
  },

  expandToStart() {
    this.update(0);
  },

  expandToEnd() {
    this.update(this.editor.getBlocks().length - 1);
  },

  focusAtEnd() {
    const block = this.editor.getBlocks()[this.endIndex];
    block.el.scrollIntoView({ behavior: "smooth" });
  },

  complete: function() {
    window.removeEventListener("mousemove", this.onMouseMove);
  },

  all: function() {
    this.removeNativeSelection();

    var blocks = this.editor.getBlocks();
    this.selecting = true;
    this.startIndex = 0;
    this.endIndex = blocks.length - 1;
    this.mediator.trigger("selection:render");
  },

  cancel: function() {
    window.mouseDown = false;
    this.selecting = false;
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
    this.editor.getBlocks().forEach((block, idx) => {
      block.select(this.selecting && this.indexSelected(idx));
    });
  },

  getClipboardData: function() {
    this.editor.getData();

    var output = [];

    this.editor.getBlocks().forEach((block, idx) => {
      if (this.indexSelected(idx)) output.push(block.asClipboardHTML());
    });

    return output.join("\n");
  },

  copy: function() {
    var copyArea = document.body.querySelector(".st-copy-area");
    if (!copyArea) {
      copyArea = Dom.createElement("div", {
        contenteditable: true,
        class: 'st-copy-area st-utils__hidden',
      });
      document.body.appendChild(copyArea);
    }
    copyArea.innerHTML = this.getClipboardData();

    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(copyArea);
    selection.removeAllRanges();
    selection.addRange(range);

    try {
      document.execCommand('copy');
      copyArea.blur();
    }
    catch (err) {
      console.log("Copy could not be performed");
    }
  },

  delete: function() {
    this.editor.getBlocks().forEach((blockEl, idx) => {
      if (this.indexSelected(idx)) this.mediator.trigger("block:remove", block.blockID, { focusOnNext: true });
    });
  },

  indexSelected: function(index) {
    return index >= Math.min(this.startIndex, this.endIndex) && index <= Math.max(this.startIndex, this.endIndex);
  }
});

module.exports = SelectionHandler;
