"use strict";

const Dom = require('../../packages/dom');
const _ = require('../../lodash');
const ScribeInterface = require('../../scribe-interface');
const FormatBar = require('../helpers/format-bar');
const stToHTML = require('../../to-html');

const TYPE = 'text';

var TextField = function(block, options) {
  
  this.type = TYPE;

  this.block = block;
  
  this.options = Object.assign({}, options, this.block.primitiveOptions.default, this.block.primitiveOptions[this.ref]);

  this.scribeOptions = this.options.scribeOptions || {};
  this.configureScribe = this.options.configureScribe;

  this.setElement(this.options.el);
  this.setupScribe();
  this.setupFormatting();
};

Object.assign(TextField.prototype, {

  setupScribe: function() {
    this.scribe = ScribeInterface.initScribeInstance(
      this.el, this.scribeOptions, _.isFunction(this.configureScribe) ? this.configureScribe : null
    );
  },

  setContent: function(content) {
    content = content || "";
    if (this.block.options.convertFromMarkdown && this.block._getData().format !== "html") {
      this.scribe.setContent(stToHTML(content, this.block.type));
    } else {
      this.scribe.setContent(content);
    }
  },

  setElement: function(template_or_node) {
    if (template_or_node) {
      if (template_or_node.nodeType) {
        this.el = template_or_node;
      } else {
        var wrapper = Dom.createElement('div', {html: template_or_node});
        this.el = wrapper.querySelector('[data-primitive]');
        this.node = wrapper ? wrapper.removeChild(wrapper.firstChild) : null;
        this.id = _.uniqueId('editor-');
        this.el.dataset.editorId = this.id;
      }
      this.ref = this.el.getAttribute('name');
      this.required = this.el.hasAttribute('data-required');
      this.formattable = this.el.hasAttribute('data-formattable');
    } else {
      this.el = Dom.createElement('div', {'class': 'st-text-block'});
      this.ref = this.options.name;
      this.required = this.options.required;
      this.formattable = this.options.formattable;
    }
  },

  setupFormatting: function() {
    if (!this.formattable) {
      return;
    }

    this.formatBar = new FormatBar(this, this.options.formatBar, this.block);

    this.el.addEventListener('keyup', this.getSelectionForFormatter.bind(this));
    this.el.addEventListener('mouseup', this.getSelectionForFormatter.bind(this));

    this.formatBar.getCommands().forEach( (cmd) => {

      if (_.isUndefined(cmd.keyCode)) {
        return;
      }

      var ctrlDown = false;

      this.el.addEventListener('keyup', (ev) => {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = false;
        }
      });
      this.el.addEventListener('keydown', (ev) => {
        if(ev.which === 17 || ev.which === 224 || ev.which === 91) {
          ctrlDown = true;
        }

        if(ev.which === cmd.keyCode && ctrlDown) {
          ev.preventDefault();
          this.execTextBlockCommand(cmd);
        }
      });

    });
  },

  appendToTextEditor: function(content) {
    var selection = new this.scribe.api.Selection();
    var range = selection.range.cloneRange();
    var lastChild = this.scribe.el.lastChild;
    range.setStartAfter(lastChild);
    range.collapse(true);
    selection.selection.removeAllRanges();
    selection.selection.addRange(range);

    if (content) {
      this.scribe.insertHTML(content);
    }
  },

  execTextBlockCommand: function(cmdName) {
    return ScribeInterface.execTextBlockCommand(
      this.scribe, cmdName
    );
  },

  queryTextBlockCommandState: function(cmdName) {
    return ScribeInterface.queryTextBlockCommandState(
      this.scribe, cmdName
    );
  },

  getSelectionForFormatter: function() {
    setTimeout(() => {
      var selectionStr = window.getSelection().toString().trim();
          
      if (selectionStr === '') {
        this.formatBar.hide();
      } else {
        this.formatBar.renderBySelection();
      }
    }, 1);
  },

  getData: function() {
    return this.scribe.getContent();
  },

  focus: function() {
    this.el.focus();
  },

  blur: function() {
    this.el.blur();
  },

  validate: function() {
    return !(this.required && this.el.textContent.length === 0);
  },

  addError: function() {
    this.el.classList.add('st-error');
  },

  removeError: function() {
    this.el.classList.remove('st-error');
  },

});

module.exports = TextField;
