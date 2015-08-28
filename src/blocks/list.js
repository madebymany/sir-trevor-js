"use strict";

var Block = require('../block');
var stToHTML = require('../to-html');
var TextField = require('./primitives/text-field');
var ScribeListBlockPlugin = require('./helpers/scribe-list-block-plugin');

module.exports = Block.extend({
  type: 'list',
  title: function() { return i18n.t('blocks:list:title'); },
  icon_name: 'list',
  formattable: true,

  scribeOptions: {
    default: { 
      allowBlockElements: false,
      tags: {
        p: false
      }
    }
  },

  configureScribe: {
    default: function(scribe) {
      scribe.use(new ScribeListBlockPlugin(this));
    }
  },

  editorHTML: '<ul class="st-list-block__list"></ul>',
  listItemEditorHTML: [
    '<li class="st-list-block__item">',
    '<div class="st-list-block__editor" data-primitive="text" data-formattable="true"></div>',
    '</li>'
  ].join(''),

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
        block.addListItem(li.content);
      });
    } else {
      block.addListItem();
    }
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

    Object.keys(this.fields).forEach(function(editorId) {
      var listItem = {content: this.fields[editorId].getData()};
      data.listItems.push(listItem);
    }.bind(this));

    return data;
  },

  // List Items manipulation functions (add, remove, etc)
  addListItemAfterCurrent: function(content) {
    this.addListItem(content, this.getCurrentTextEditor());
  },

  addListItem: function(content, after) {
    content = content || '';
    if (content.trim() === "<br>") { content = ''; }

    var editor = new TextField(this.listItemEditorHTML, content, this);

    if (after && this.ul.lastchild !== after.node) {
      var before = after.node.nextSibling;
      this.ul.insertBefore(editor.node, before);

      var idx = this.editorIds.indexOf(after.id) + 1;
      this.editorIds.splice(idx, 0, editor.id);
    } else {
      this.ul.appendChild(editor.node);
      this.editorIds.push(editor.id);
    }

    this.fields[editor.id] = editor;

    !content && this.focusOn(editor); // jshint ignore:line
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

  removeCurrentListItem: function() {
    if (this.editorIds.length === 1) { return; }

    var item = this.getCurrentTextEditor();
    var idx = this.editorIds.indexOf(item.id);

    this.focusOnNeighbor(item);
    this.editorIds.splice(idx, 1);
    this.ul.removeChild(item.node);
    this.removeTextEditor(item.id);
  },

  appendToCurrentItem: function(content) {
    this.getCurrentTextEditor().appendToTextEditor(content);
  },

  isLastListItem: function() {
    return this.editorIds.length === 1;
  },

  nextListItem: function() {
    var idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
    var editorId = this.editorIds[idx + 1];

    if (editorId !== undefined) {
      return this.getPrimitive(editorId);
    } else {
      return null;
    }
  },

  previousListItem: function() {
    var idx = this.editorIds.indexOf(this.getCurrentTextEditor().id);
    var editorId = this.editorIds[idx - 1];

    if (editorId !== undefined) {
      return this.getPrimitive(editorId);
    } else {
      return null;
    }
  },

  getCurrentTextEditor: function() {
    var id = document.activeElement.dataset.editorId;
    var editor = this.getPrimitive(id);

    if (editor) {
      this.currentEditor = editor;
    }

    return this.currentEditor;
  },

});
