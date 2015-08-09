"use strict";

var _ = require('./lodash');
var utils = require('./utils');

var bestNameFromField = function(field) {
  var msg = field.getAttribute("data-st-name") || field.getAttribute("name");

  if (!msg) {
    msg = 'Field';
  }

  return utils.capitalize(msg);
};

module.exports = {

  errors: [],

  valid: function(){
    this.performValidations();
    return this.errors.length === 0;
  },

  // This method actually does the leg work
  // of running our validators and custom validators
  performValidations: function() {
    this.resetErrors();

    var required_fields = this.$('.st-required');
    Array.prototype.forEach.call(required_fields, function (f, i) {
      this.validateField(f);
    }.bind(this));
    this.validations.forEach(this.runValidator, this);

    this.el.classList.toggle('st-block--with-errors', this.errors.length > 0);
  },

  // Everything in here should be a function that returns true or false
  validations: [],

  validateField: function(field) {
    
    var content = field.getAttribute('contenteditable') ? field.textContent : field.value;

    if (content.length === 0) {
      this.setError(field, i18n.t("errors:block_empty",
                                 { name: bestNameFromField(field) }));
    }
  },

  runValidator: function(validator) {
    if (!_.isUndefined(this[validator])) {
      this[validator].call(this);
    }
  },

  setError: function(field, reason) {
    var msg = this.addMessage(reason, "st-msg--error");
    field.classList.add('st-error');

    this.errors.push({ field: field, reason: reason, msg: msg });
  },

  resetErrors: function() {
    this.errors.forEach(function(error){
      error.field.classList.remove('st-error');
      error.msg.remove();
    });

    this.messages.classList.remove("st-block__messages--is-visible");
    this.errors = [];
  }

};
