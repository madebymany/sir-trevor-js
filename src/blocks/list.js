"use strict";

var Block = require('../block');
var stToHTML = require('../to-html');
var Dom = require('../packages/dom');

var ScribeListBlockPlugin = require('./scribe-plugins/scribe-list-block-plugin');

module.exports = Block.extend({
  type: 'list',
  title: function() { return i18n.t('blocks:list:title'); },
  icon_name: 'list',

  controllable: true,
  multi_editable: true,

  controls: {
    'unorderedlist': function(e) {
      e.preventDefault();

      this.updateListType('unordered');
    },
    'orderedlist': function(e) {
      e.preventDefault();

      this.updateListType('ordered');
    }
  },

  scribeOptions: { 
    allowBlockElements: false,
    tags: {
      p: false
    }
  },

  configureScribe: function(scribe) {
    scribe.use(new ScribeListBlockPlugin(this));
  },

  listTagName: function() {
    return (this.listType === 'ordered') ? 'ol' : 'ul';
  },

  editorHTML: function() {
    return this.createRootNode().outerHTML;
  },

  createRootNode: function() {
    return Dom.createElement(this.listTagName(), {
      'class': 'st-list-block__list'
    })
  },

  listItemEditorHTML: '<li class="st-list-block__item"><div class="st-list-block__editor st-block__editor"></div></li>',

  initialize: function() {
    this.editorIds = [];
  },

  // Data functions (loading, converting, saving)
  beforeLoadingData: function() {
    this.setupListVariables();

    this.loadData(this._getData());
  },

  onBlockRender: function() {
    if (!this.list) { this.setupListVariables(); }
    if (this.editorIds.length < 1) { this.addListItem(); }
  },

  setupListVariables: function() {
    this.list = this.inner.querySelector('ul, ol');
  },

  loadData: function(data) {
    if (this.options.convertFromMarkdown && data.format !== "html") {
      data = this.parseFromMarkdown(data.text);
    }

    while(Object.keys(this.editors).length) {
      var item = this.editors[Object.keys(this.editors)[0]];

      this.editorIds.splice(0, 1);
      this.list.removeChild(item.node);
      this.removeTextEditor(item.id);
    }

    this.listType = data.listType || 'unordered';

    Dom.replaceWith(this.list, this.createRootNode());

    this.setupListVariables();
    
    if (data.listItems.length) {
      data.listItems.forEach((li) => {
        this.addListItem(li.content);
      });
    } else {
      this.addListItem();
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
    var data = {
      format: 'html', 
      listItems: [], 
      listType: this.listType
    };

    this.editorIds.forEach(function(editorId) {
      var listItem = {
        content: this.getTextEditor(editorId).scribe.getContent()
      };
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

    var editor = this.newTextEditor(this.listItemEditorHTML, content);
    if (after && this.list.lastchild !== after.node) {
      var before = after.node.nextSibling;
      this.list.insertBefore(editor.node, before);

      var idx = this.editorIds.indexOf(after.id) + 1;
      this.editorIds.splice(idx, 0, editor.id);
    } else {
      this.list.appendChild(editor.node);
      this.editorIds.push(editor.id);
    }

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
    this.list.removeChild(item.node);
    this.removeTextEditor(item.id);
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

  updateListType: function(listType) {
    this.setAndLoadData({
      listType: listType
    });
  }

});
