"use strict";

var config = require('./config');
var utils = require('./utils');

var EventBus = require('./event-bus');
var Submittable = require('./extensions/submittable');

var formBound = false; // Flag to tell us once we've bound our submit event

var FormEvents = {
  bindFormSubmit: function(form) {
    if (!formBound) {
      // XXX: should we have a formBound and submittable per-editor?
      // telling JSHint to ignore as it'll complain we shouldn't be creating
      // a new object, but otherwise `this` won't be set in the Submittable
      // initialiser. Bit weird.
      new Submittable(form); // jshint ignore:line
      form.bind('submit', this.onFormSubmit);
      formBound = true;
    }
  },

  onBeforeSubmit: function(shouldValidate) {
    // Loop through all of our instances and do our form submits on them
    var errors = 0;
    config.instances.forEach(function(inst, i) {
      errors += inst.onFormSubmit(shouldValidate);
    });
    utils.log("Total errors: " + errors);

    return errors;
  },

  onFormSubmit: function(ev) {
    var errors = FormEvents.onBeforeSubmit();

    if(errors > 0) {
      EventBus.trigger("onError");
      ev.preventDefault();
    }
  },
};

module.exports = FormEvents;
