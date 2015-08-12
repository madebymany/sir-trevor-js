"use strict";

var EventBus = require('./event-bus');
var Submittable = require('./extensions/submittable');

var formBound = false; // Flag to tell us once we've bound our submit event

var FormEvents = {
  bindFormSubmit: function(editor) {
    if (!formBound) {
      // XXX: should we have a formBound and submittable per-editor?
      // telling JSHint to ignore as it'll complain we shouldn't be creating
      // a new object, but otherwise `this` won't be set in the Submittable
      // initialiser. Bit weird.
      new Submittable(editor.form); // jshint ignore:line
      formBound = true;
    }
    editor.form.addEventListener('submit', this.onFormSubmit.bind(editor));
  },

  unbindFormSubmit: function(editor) {
    editor.form.removeEventListener('submit', this.onFormSubmit.bind(editor));
  },

  onFormSubmit: function(ev) {
    var errors = this.onFormSubmit();

    if(errors > 0) {
      EventBus.trigger("onError");
      ev.preventDefault();
    }
  },
};

module.exports = FormEvents;
