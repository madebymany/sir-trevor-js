"use strict";

var _ = require('../lodash');
var ScribeInterface = require('../scribe-interface');

module.exports = {
  mixinName: 'MultiEditable',

  initializeMultiEditable: function() {
    this.editors = {};
  },

  newTextEditor: function(template, content) {
    // render template outside of dom
    var wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    var editor = wrapper.querySelector('.st-block__editor');
    var id = _.uniqueId('editor-');
    editor.dataset.editorId = id;
    editor.addEventListener('keyup', this.getSelectionForFormatter);
    editor.addEventListener('mouseup', this.getSelectionForFormatter);

    var configureScribe =
      _.isFunction(this.configureScribe) ? this.configureScribe.bind(this) : null;
    var scribe = ScribeInterface.initScribeInstance(
      editor, this.scribeOptions, configureScribe
    );

    scribe.setContent(content);

    var editorObject = {
      node: wrapper.removeChild(wrapper.firstChild),
      el: editor,
      scribe: scribe,
      id: id
    };

    this.editors[id] = editorObject;

    return editorObject;
  },

  getCurrentTextEditor: function() {
    var id = document.activeElement.dataset.editorId;
    var editor = this.getTextEditor(id);

    if (editor) {
      this.currentEditor = editor;
    }

    return this.currentEditor;
  },

  appendToTextEditor: function(id, content) {
    var scribe = this.getTextEditor(id).scribe;
    var selection = new scribe.api.Selection();
    var range = selection.range.cloneRange();
    var lastChild = scribe.el.lastChild;
    range.setStartAfter(lastChild);
    range.collapse(true);
    selection.selection.removeAllRanges();
    selection.selection.addRange(range);

    if (content) {
      scribe.insertHTML(content);
    }
  },

  getCurrentScribeInstance: function() {
    return this.getCurrentTextEditor().scribe;
  },

  getTextEditor: function(id) {
    return this.editors[id];
  },

  removeTextEditor: function(id) {
    delete this.editors[id];
  },

  // scribe commands for FormatBar
  execTextBlockCommand: function(cmdName) {
    return ScribeInterface.execTextBlockCommand(
      this.getCurrentScribeInstance(), cmdName
    );
  },

  queryTextBlockCommandState: function(cmdName) {
    return ScribeInterface.queryTextBlockCommandState(
      this.getCurrentScribeInstance(), cmdName
    );
  },
};
