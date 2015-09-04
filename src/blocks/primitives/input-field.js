"use strict";

const Dom = require('../../packages/dom');

const TYPE = 'input';

var InputField = function(content, options, block) {
  
  this.type = TYPE;

  this.block = block;
  
  this.setElement(this.options.template_or_node, content);
  this.setContent(content);

  this.options = Object.assign({}, options, this.block.primitiveOptions.default, this.block.primitiveOptions[this.ref]);

  this.setupPaste();
};

Object.assign(InputField.prototype, {

  setElement: function(template_or_node, content) {
    if (template_or_node) {
      if (template_or_node.nodeType) {
        this.el = template_or_node;
      } else {
        var wrapper = Dom.createElement('div', {html: template_or_node});
        this.el = wrapper.querySelector('[data-primitive]');
      }
      this.ref = this.el.getAttribute('name');
      this.required = this.el.hasAttribute('data-required');
      this.pastable = this.el.hasAttribute('data-pastable');
    } else {
      this.el = Dom.createElement('input', {type: 'text'});
      this.ref = this.options.name;
      this.required = this.options.required;
      this.pastable = this.options.pastable;
    }
  },

  setContent: function(content) {
    this.el.value = content;
  },

  setupPaste: function() {
    if (!this.pastable) {
      return;
    }

    this.el.addEventListener('click', function() { 
      var event = document.createEvent('HTMLEvents');
      event.initEvent('select', true, false);
      this.dispatchEvent(event);
    });
    this.el.addEventListener('paste', this.options.onPaste.bind(this));
    this.el.addEventListener('submit', this.options.onPaste.bind(this));
  },

  getData: function() {
    return this.el.value;
  },

  focus: function() {
    this.el.focus();
  },

  blur: function() {
    this.el.blur();
  },

  validate: function() {
    return !(this.required && this.el.value.length === 0);
  },

  addError: function() {
    this.el.classList.add('st-error');
  },

  removeError: function() {
    this.el.classList.remove('st-error');
  },

});

module.exports = InputField;
