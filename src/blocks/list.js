"use strict";

var Block = require('../block');
var stToHTML = require('../to-html');

var ScribeListBlockPlugin = require('./scribe-plugins/scribe-list-block-plugin');

module.exports = Block.extend({
  type: 'list',
  icon_name: 'list',
  multi_editable: true,

  scribeOptions: { 
    allowBlockElements: false,
    tags: {
      p: false
    }
  },

  configureScribe: function(scribe) {
    scribe.use(new ScribeListBlockPlugin(this));
  },

  editorHTML: '<ul class="st-list-block__list"></ul>',
  listItemEditorHTML: '<ol class="st-list-block-list"><li class="st-list-block__item"><div class="st-list-block__editor st-block__editor"></div></li><ol>',

  initialize: function() {
    this.editorIds = [];
  },

  // Data functions (loading, converting, saving)
  beforeLoadingData: function() {
    this.setupListVariables();

    this.loadData(this._getData());
  },

  onBlockRender: function() {
    if (!this.ul) { this.setupListVariables(); }
    if (this.editorIds.length < 1) { this.addListItem(); }
  },

  setupListVariables: function() {
    this.ul = this.inner.querySelector('ul');
  },

  loadData: function(data) {
    var block = this;
    if (this.options.convertFromMarkdown && data.format !== "html") {
      data = this.parseFromMarkdown(data.text);
    }

    if (data.listItems.length) {
      data.listItems.forEach(function(li) {
        block.addListItem(li.content, undefined, li.indent);
      });
    } else {
      block.addListItem();
    }
    this.updateStartAttributes();
  },

  parseFromMarkdown: function(markdown) {
    var listItems = markdown.replace(/^ - (.+)$/mg,"$1").split("\n");
    listItems = listItems.
      filter(function(item) {
        return item.length;
      }).
      map(function(item) {
        return {content: stToHTML(item, this.type)};
      }.bind(this));

    return { listItems: listItems, format: 'html' };
  },

  _serializeData: function() {
    var data = {format: 'html', listItems: []};

    this.editorIds.forEach( (editorId) => {
      var editor = this.getTextEditor(editorId);
      var listItem = {
        content: editor.scribe.getContent(),
        indent: editor.metadata.indent
      };
      data.listItems.push(listItem);
    });

    return data;
  },

  // List Items manipulation functions (add, remove, etc)
  addListItemAfterCurrent: function(content) {
    this.addListItem(content, this.getCurrentTextEditor());
  },

  addListItem: function(content, after, indent) {
    content = content || '';
    if (content.trim() === "<br>") { content = ''; }

    var editor = this.newTextEditor(this.listItemEditorHTML, content);
    editor.metadata.indent = indent || 0;

    if (after && this.ul.lastchild !== after.node) {
      editor.metadata.indent = after.metadata.indent;
      console.log( editor.metadata.indent );
      var before = after.node.nextSibling;
      this.ul.insertBefore(editor.node, before);

      var idx = this.editorIds.indexOf(after.id) + 1;
      this.editorIds.splice(idx, 0, editor.id);
    } else {
      this.ul.appendChild(editor.node);
      this.editorIds.push(editor.id);
    }

    !content && this.focusOn(editor); // jshint ignore:line
    this.updateStartAttributes();
  },

  focusOnNeighbor: function(item) {
    var neighbor = this.previousListItem() || this.nextListItem();

    if (neighbor) {
      this.focusOn(neighbor);
    }
  },

  focusOn: function(editor) {
    var scribe = editor.scribe;
    var selection = new scribe.api.Selection();
    var lastChild = scribe.el.lastChild;
    var range;
    if (selection.range) {
      range = selection.range.cloneRange();
    }

    editor.el.focus();

    if (range) {
      range.setStartAfter(lastChild, 1);
      range.collapse(false);
    }
  },

  focusAtEnd: function() {
    var lastEditorId = this.editorIds[this.editorIds.length - 1];
    this.appendToTextEditor(lastEditorId);
  },

  removeCurrentListItem: function() {
    if (this.editorIds.length === 1) { return; }

    var item = this.getCurrentTextEditor();
    var idx = this.editorIds.indexOf(item.id);

    this.focusOnNeighbor(item);
    this.editorIds.splice(idx, 1);
    this.ul.removeChild(item.node);
    this.removeTextEditor(item.id);
    this.updateStartAttributes();
  },

  appendToCurrentItem: function(content) {
    this.appendToTextEditor(this.getCurrentTextEditor().id, content);
  },

  isLastListItem: function() {
    return this.editorIds.length === 1;
  },

  nextListItem: function() {
    var idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
    var editorId = this.editorIds[idx + 1];

    if (editorId !== undefined) {
      return this.getTextEditor(editorId);
    } else {
      return null;
    }
  },

  previousListItem: function() {
    var idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
    var editorId = this.editorIds[idx - 1];

    if (editorId !== undefined) {
      return this.getTextEditor(editorId);
    } else {
      return null;
    }
  },

  indentListItem: function() {
    var currentEditor = this.editors[this.getCurrentTextEditor().id];
    if (currentEditor.metadata.indent === 8) {
      return false;
    }
    currentEditor.metadata.indent += 1;
    this.updateStartAttributes();
  },

  outdentListItem: function() {
    var currentEditor = this.editors[this.getCurrentTextEditor().id];
    if (currentEditor.metadata.indent === 0) {
      return false;
    }
    currentEditor.metadata.indent -= 1;
    this.updateStartAttributes();
    return true;
  },

  updateStartAttributes: function() {
    var startingIndexes = [1, 1, 1, 1, 1, 1, 1, 1];
    var currentIndent = 0;
    var started = false;
    this.editorIds.forEach( (editorId) => {
      var editor = this.getTextEditor(editorId);
      if (started) {
        if (currentIndent === editor.metadata.indent) {
          startingIndexes[editor.metadata.indent] += 1;
        } else if (editor.metadata.indent > currentIndent) {
          startingIndexes[currentIndent] += 1;
        }
      }
      editor.node.setAttribute('start', startingIndexes[editor.metadata.indent]);

      var i = 0;
      while (i <= 8) {
        editor.node.classList.remove(`tab${i}`);
        i++;
      }
      editor.node.classList.add(`tab${editor.metadata.indent}`);

      currentIndent = editor.metadata.indent;
      started = true;
    });
  }

});
