"use strict";

var selectionRange = require('selection-range');

var _ = require('../lodash');
var ScribeInterface = require('../scribe-interface');

var { trimScribeContent } = require('../blocks/scribe-plugins/shared');

module.exports = {
  mixinName: 'MultiEditable',

  initializeMultiEditable: function() {
    this.editors = {};
  },

  newTextEditor: function(template_or_node, content) {
    var editor, isTextTemplate, wrapper;

    isTextTemplate = (template_or_node.tagName === undefined);

    if (isTextTemplate) {
      // render template outside of dom
      wrapper = document.createElement('div');
      wrapper.innerHTML = template_or_node;

      editor = wrapper.querySelector('.st-block__editor');
    } else {
      editor = template_or_node;
    }

    var id = _.uniqueId('editor-');
    editor.setAttribute('data-editorId', id);
    editor.addEventListener('keyup', this.getSelectionForFormatter);
    editor.addEventListener('mouseup', this.getSelectionForFormatter);

    var configureScribe =
      _.isFunction(this.configureScribe) ? this.configureScribe.bind(this) : null;
    var scribe = ScribeInterface.initScribeInstance(
      editor, this.scribeOptions, configureScribe
    );

    scribe.setContent(content);

    var editorObject = {
      node: isTextTemplate ? wrapper.removeChild(wrapper.firstChild) : editor,
      el: editor,
      scribe: scribe,
      id: id
    };

    this.editors[id] = editorObject;

    return editorObject;
  },

  getCurrentTextEditor: function() {
    var id = document.activeElement.getAttribute('data-editorId');
    var editor = this.getTextEditor(id);

    if (editor) {
      this.currentEditor = editor;
    }

    return this.currentEditor;
  },

  appendToTextEditor: function(id, content) {
    var scribe = this.getTextEditor(id).scribe;

    trimScribeContent(scribe);

    var range = document.createRange();
    range.selectNodeContents(scribe.el);
    range.collapse(false);
    var selection = new scribe.api.Selection();
    selection.selection.removeAllRanges();
    selection.selection.addRange(range);

    var caretPosition = selectionRange(scribe.el);

    if (content) {
      scribe.insertHTML(content);
    }

    selectionRange(scribe.el, {
      start: caretPosition.start,
      end: caretPosition.end
    });
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
