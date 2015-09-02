"use strict";

const _ = require('../../lodash');

const TYPE = 'input';

var InputField = function(template_or_node, content, block) {
  
  this.type = TYPE;

  this.block = block;
  this.options = this.block.options;
  
  this.setElement(template_or_node);
  this.setupPaste();
};

Object.assign(InputField.prototype, {

  setElement: function(template_or_node) {
    if (template_or_node.nodeType) {
      this.el = template_or_node;
    } else {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = template_or_node;
      this.el = wrapper.querySelector('[data-primitive]');
      this.node = wrapper ? wrapper.removeChild(wrapper.firstChild) : null;
    }
    this.ref = this.el.getAttribute('name');
    this.required = this.el.hasAttribute('data-required');
    this.pastable = this.el.hasAttribute('data-pastable');
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
    return this.required && this.el.value.length === 0;
  },

  addError: function() {
    this.el.classList.add('st-error');
  },

  removeError: function() {
    this.el.classList.remove('st-error');
  },

});

module.exports = InputField;
