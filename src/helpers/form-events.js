"use strict";

var Dom = require('../packages/dom');

var FormEvents = function(editor, options) {
  this.editor = editor;
  this.options = options;
  this.form = Dom.getClosest(this.editor.el, 'form');
  this.eventsBound = false;

  this._bindFunctions();

  this.initialize();
};

Object.assign(FormEvents.prototype, require('../function-bind'), {

  bound: ["onFormSubmit"],

  initialize: function() {
    this.editor.mediator.on('initialize', () => {
      this.form.addEventListener('submit', this.onFormSubmit);
    });

    this.editor.mediator.on('destroy', () => {
      this.form.removeEventListener('submit', this.onFormSubmit);
    });
  },

  onFormSubmit: function(e) {

    if (this.editor.getData().canSubmit) {
      return true;
    }

    e.preventDefault();

    this.editor.process().then( (response) => {
      this.editor.el.value = response.data;
      if (response.canSubmit) {
        this.form.dispatchEvent(new Event('submit'));
      }
    });
  }

});

module.exports = FormEvents;
