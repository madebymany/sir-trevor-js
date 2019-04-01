"use strict";

var _ = require('./lodash');
var Dom = require('./packages/dom');

var TYPE = 'application/vnd.sirtrevor+json'

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

  bound: ['onCopy', 'onCut', 'onKeyDown', 'onMouseUp', 'onPaste'],

  mediatedEvents: {
    'start': 'start',
    'render': 'render',
    'complete': 'complete',
    'all': 'all',
    'copy': 'copy',
    'update': 'update',
    'delete': 'delete',
    'cancel': 'cancel',
    'block': 'block'
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
    if (!this.enabled()) return false;

    window.addEventListener("keydown", this.onKeyDown, false);
    window.addEventListener('mouseup', this.onMouseUp, false);
    document.addEventListener('copy', this.onCopy, false);

    if (this.options.selectionCut) {
      document.addEventListener('cut', this.onCut, false);
    }

    if (this.options.selectionPaste) {
      document.addEventListener('paste', this.onPaste, true);
    }
  },

  enabled: function() {
    return !!this.options.selectionCopy;
  },

  start: function(index, options = {}) {
    if (!this.enabled()) return false;

    options = Object.assign({ mouseEnabled: false }, options);

    this.startIndex = this.endIndex = index;
    this.selecting = true;

    if (options.mouseEnabled) {
      window.mouseDown = true;
      this.selecting = false;
      window.addEventListener("mousemove", this.onMouseMove);
    }

    this.mediator.trigger("selection:render");
  },

  startAtEnd: function() {
    this.start(this.editor.getBlocks().length - 1);
  },

  move: function(offset) {
    this.start(this.endIndex + offset);
  },

  onMouseMove: function() {},

  update: function(index) {
    if (index < 0 || index >= this.editor.getBlocks().length) return;
    this.endIndex = index;
    if (index !== this.startIndex) this.selecting = true;
    this.removeNativeSelection();
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
    if (!this.enabled()) return false;

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
    var visible = this.selecting;

    this.editor.getBlocks().forEach((block, idx) => {
      block.select(visible && this.indexSelected(idx));
    });
  },

  getClipboardData: function() {
    this.editor.getData();

    var htmlOutput = [];
    var textOutput = [];
    var dataOutput =  [];

    this.editor.getBlocks().forEach((block, idx) => {
      if (this.indexSelected(idx)) {
        var html = block.asClipboardHTML();
        var text = html;
        htmlOutput.push(html);
        textOutput.push(text);
        dataOutput.push(block.getData());
      }
    });

    return {
      html: htmlOutput.join(""),
      text: textOutput.join("\n\n"),
      data: dataOutput
    };
  },

  copy: function() {
    var copyArea = this.createFakeCopyArea();
    copyArea.innerHTML = this.getClipboardData().html;

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

  createFakeCopyArea: function() {
    var copyArea = document.body.querySelector(".st-copy-area");
    if (!copyArea) {
      copyArea = Dom.createElement("div", {
        contenteditable: true,
        class: 'st-copy-area st-utils__hidden',
      });
      document.body.appendChild(copyArea);
    }
    return copyArea;
  },

  delete: function() {
    this.editor.getBlocks().forEach((block, idx) => {
      if (!this.indexSelected(idx)) return;
      this.mediator.trigger("block:remove", block.blockID, { focusOnNext: true });
    });
    this.cancel();
  },

  indexSelected: function(index) {
    return index >= this.getStartIndex() && index <= this.getEndIndex();
  },

  block: function(block) {
    var blockPosition = this.editor.blockManager.getBlockPosition(block.el);

    this.mediator.trigger("formatter:hide");
    this.removeNativeSelection();
    this.start(blockPosition);
  },

  getStartIndex: function() {
    return Math.min(this.startIndex, this.endIndex);
  },


  getEndIndex: function() {
    return Math.max(this.startIndex, this.endIndex);
  },

  getStartBlock: function() {
    return this.editor.getBlocks()[this.getStartIndex()];
  },

  getEndBlock: function() {
    return this.editor.getBlocks()[this.getEndIndex()];
  },

  onKeyDown: function(ev) {
    ev = ev || window.event;
    var ctrlKey = ev.ctrlKey || ev.metaKey;
    var key = ev.key;

    if (this.selecting && key === "Backspace") {
      ev.preventDefault();
      this.delete();
    } else if (ctrlKey && key === "a") {
      if (!this.selecting && this.cancelSelectAll()) return;
      ev.preventDefault();
      this.mediator.trigger("selection:all");
    } else if (this.selecting) {
      if (["Down", "ArrowDown"].indexOf(key) > -1) {
        ev.preventDefault();
        if (ev.shiftKey && ev.altKey) this.expandToEnd();
        else if (ev.shiftKey) this.expand(1);
        else if (ev.altKey) this.startAtEnd();
        else {
          this.cancel();
          this.mediator.trigger("block:focusNext", this.getEndBlock().blockID, { force: true });
          return;
        }
        this.focusAtEnd();
      } else if (["Up", "ArrowUp"].indexOf(key) > -1) {
        ev.preventDefault();
        if (ev.shiftKey && ev.altKey) this.expandToStart();
        else if (ev.shiftKey) this.expand(-1);
        else if (ev.altKey) this.start(0);
        else {
          this.cancel();
          this.mediator.trigger("block:focusPrevious", this.getStartBlock().blockID, { force: true });
          return;
        }
        this.focusAtEnd();
      } else if (this.options.selectionCut && !ev.metaKey && ["Shift", "Control", "Meta", "Alt"].indexOf(key) === -1) {
        const nextBlock = this.editor.getBlocks()[this.getEndIndex() + 1];
        this.delete();
        if (nextBlock) {
          this.mediator.trigger("block:createBefore", "text", "", nextBlock, { autoFocus: true });
        } else {
          this.mediator.trigger("block:create", "text", "", { autoFocus: true });
        }
      }
    }
  },

  onMouseUp: function() {
    if (!window.mouseDown) {
      this.mediator.trigger("selection:complete");
      this.mediator.trigger("selection:cancel");
      return;
    }

    window.mouseDown = false;
    this.mediator.trigger("selection:complete");
    this.mediator.trigger("selection:render");
  },

  copySelection: function(ev) {
    var content = this.getClipboardData();

    ev.clipboardData.setData(TYPE, JSON.stringify(content.data));
    ev.clipboardData.setData('text/html', content.html);
    ev.clipboardData.setData('text/plain', content.text);
    ev.preventDefault();
  },

  onCopy: function(ev) {
    if (!this.selecting) return;

    this.copySelection(ev);
  },

  onCut: function(ev) {
    if (!this.selecting) return;

    this.copySelection(ev);
    this.delete();
  },

  onPaste: function(ev) {
    if (ev.clipboardData.types.includes(TYPE)) {
      ev.preventDefault();
      ev.stopPropagation();
      let data = JSON.parse(ev.clipboardData.getData(TYPE));
      var nextBlock = this.editor.getBlocks()[this.getEndIndex() + 1];
      if (this.selecting) this.delete();
      if (this.selecting && nextBlock) {
        data.reverse().forEach((block) => {
          this.mediator.trigger("block:createBefore", block.type, block.data, nextBlock, { focusAtEnd: true });
        });
      } else {
        data.forEach((block) => {
          this.mediator.trigger("block:create", block.type, block.data, undefined, { focusAtEnd: true });
        });
      }
    } else if (ev.clipboardData.types.includes('text/html')) {
      if (!this.selecting) return;

      let html = ev.clipboardData.getData('text/html');
      // this.delete();
      // console.log(html);
    } else if (ev.clipboardData.types.includes('text/plain')) {
      if (!this.selecting) return;

      let text = ev.clipboardData.getData('text/plain');
      // this.delete();
      // console.log(html);
    }
  }
});

module.exports = SelectionHandler;
