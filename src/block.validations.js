var bestNameFromField = function(field) {
  return field.attr("data-st-name") || field.attr("name");
};

SirTrevor.BlockValidations = {

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
    _.each(required_fields, _.bind(this.validateField, this));
    _.each(this.validations, _.bind(this.runValidator, this));

    this.$el.toggleClass('st-block--with-errors', this.errors.length > 0);
  },

  // Everything in here should be a function that returns true or false
  validators: [],

  validateField: function(field) {
    field = $(field);

    var content = field.attr('contenteditable') ? field.text() : field.val();

    if (content.length === 0) {
      this.setError(field, bestNameFromField(field) + " must not be empty");
    }
  },

  runValidator: function(validator) {
    if (!_.isUndefined(this[validator])) {
      this[validator].call(this);
    }
  },

  setError: function(field, reason, appendTo) {
    if (_.isUndefined(appendTo)) {
      appendTo = this.$messages;
    }

    var msg = $("<span>", { html: reason, class: 'st-error-msg' });

    field.addClass('st-error');
    appendTo.append(msg);

    this.errors.push({ field: field, reason: reason, msg: msg });
  },

  resetErrors: function() {
    _.each(this.errors, function(error){
      error.field.removeClass('st-error');
      error.msg.remove();
    });

    this.errors = [];
  }

};