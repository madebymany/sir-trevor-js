"use strict";

var _ = require('./lodash');
var Dom = require('./packages/dom');
var config = require('./config');

var SelectionHandler = function(wrapper, mediator, editor) {
  this.wrapper = wrapper;
  this.mediator = mediator;
  this.editor = editor;

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
    'delete': 'delete'
  },

  initialize: function() {
    window.addEventListener('keydown', (e) => {
      e = e || window.event;
      var ctrl = e.ctrlKey || e.metaKey;
      if (config.selectionCopy && e.key == "a" && ctrl) {
        this.mediator.trigger("selection:all");
      } else if (config.selectionCopy && e.key == "c" && ctrl) {
        this.mediator.trigger("selection:copy");
      } else if (config.selectionDelete && e.key == "x" && ctrl) {
        this.mediator.trigger("selection:delete");
      }
    }, false);
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
    var blocks = this.editor.getBlocks();
    this.selecting = true;
    this.startIndex = 0;
    this.endIndex = blocks.length;

    this.mediator.trigger("selection:render");
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
