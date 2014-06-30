SirTrevor.ErrorHandler = (function(){

  var ErrorHandler = function($wrapper, mediator, container) {
    this.$wrapper = $wrapper;
    this.mediator = mediator;
    this.$el = container;

    if (_.isUndefined(this.$el)) {
      this._ensureElement();
      this.$wrapper.prepend(this.$el);
    }

    this.$el.hide();
    this._bindFunctions();
    this._bindMediatedEvents();

    this.initialize();
  };

  _.extend(ErrorHandler.prototype, FunctionBind, MediatedEvents, Renderable, {

    errors: [],
    className: "st-errors",
    eventNamespace: 'errors',

    mediatedEvents: {
      'reset': 'reset',
      'add': 'addMessage',
      'render': 'render'
    },

    initialize: function() {
      var $list = $("<ul>");
      this.$el.append("<p>" + i18n.t("errors:title") + "</p>")
              .append($list);
      this.$list = $list;
    },

    render: function() {
      if (this.errors.length === 0) { return false; }
      _.each(this.errors, this.createErrorItem, this);
      this.$el.show();
    },

    createErrorItem: function(error) {
      var $error = $("<li>", { class: "st-errors__msg", html: error.text });
      this.$list.append($error);
    },

    addMessage: function(error) {
      this.errors.push(error);
    },

    reset: function() {
      if (this.errors.length === 0) { return false; }
      this.errors = [];
      this.$list.html('');
      this.$el.hide();
    }

  });

  return ErrorHandler;

})();
