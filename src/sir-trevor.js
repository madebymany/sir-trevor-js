(function ($, _){

  var root = this,
      SirTrevor;

  SirTrevor = root.SirTrevor = {};
  SirTrevor.DEBUG = false;
  SirTrevor.SKIP_VALIDATION = false;

  SirTrevor.version = "0.3.0";
  SirTrevor.LANGUAGE = "en";

  function $element(el) {
    return el instanceof $ ? el : $(el);
  }

  /*
   Define default attributes that can be extended through an object passed to the
   initialize function of SirTrevor
  */

  SirTrevor.DEFAULTS = {
    defaultType: false,
    spinner: {
      className: 'st-spinner',
      lines: 9,
      length: 8,
      width: 3,
      radius: 6,
      color: '#000',
      speed: 1.4,
      trail: 57,
      shadow: false,
      left: '50%',
      top: '50%'
    },
    blockLimit: 0,
    blockTypeLimits: {},
    required: [],
    uploadUrl: '/attachments',
    baseImageUrl: '/sir-trevor-uploads/',
    errorsContainer: undefined
  };

  SirTrevor.BlockMixins = {};
  SirTrevor.Blocks = {};
  SirTrevor.Formatters = {};
  SirTrevor.instances = [];
  SirTrevor.Events = Eventable;

  var formBound = false; // Flag to tell us once we've bound our submit event

  /* Generic function binding utility, used by lots of our classes */
  var FunctionBind = {
    bound: [],
    _bindFunctions: function(){
      if (this.bound.length > 0) {
        _.bindAll.apply(null, _.union([this], this.bound));
      }
    }
  };

  var Renderable = {
    tagName: 'div',
    className: 'sir-trevor__view',
    attributes: {},

    $: function(selector) {
      return this.$el.find(selector);
    },

    render: function() {
      return this;
    },

    destroy: function() {
      if (!_.isUndefined(this.stopListening)) { this.stopListening(); }
      this.$el.remove();
    },

    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes')),
            html;
        if (this.id) { attrs.id = this.id; }
        if (this.className) { attrs['class'] = this.className; }

        if (attrs.html) {
          html = attrs.html;
          delete attrs.html;
        }
        var $el = $('<' + this.tagName + '>').attr(attrs);
        if (html) { $el.html(html); }
        this._setElement($el);
      } else {
        this._setElement(this.el);
      }
    },

    _setElement: function(element) {
      this.$el = $element(element);
      this.el = this.$el[0];
      return this;
    }
  };

  //= helpers
  //= locales.js
  //= vendor
  //= extensions
  //= to-html.js
  //= to-markdown.js

  SirTrevor.EventBus = _.extend({}, SirTrevor.Events);

  /* Block Mixins */
  //= block_mixins
  //= block.positioner.js
  //= block.reorder.js
  //= block.deletion.js
  //= block.validations.js
  //= block.store.js
  //= simple-block.js
  //= block.js
  //= formatter.js

  /* Default Blocks */
  //= blocks
  /* Default Formatters */
  //= formatters
  /* Marker */
  //= block-control.js
  //= block-controls.js
  //= floating-block-controls.js
  /* FormatBar */
  //= format-bar.js
  //= sir-trevor-editor.js

  /* We need a form handler here to handle all the form submits */
  SirTrevor.setDefaults = function(options) {
    SirTrevor.DEFAULTS = _.extend(SirTrevor.DEFAULTS, options || {});
  };

  SirTrevor.bindFormSubmit = function(form) {
    if (!formBound) {
      SirTrevor.submittable();
      form.bind('submit', this.onFormSubmit);
      formBound = true;
    }
  };

  SirTrevor.onBeforeSubmit = function(should_validate) {
    // Loop through all of our instances and do our form submits on them
    var errors = 0;
    _.each(SirTrevor.instances, function(inst, i) {
      errors += inst.onFormSubmit(should_validate);
    });
    SirTrevor.log("Total errors: " + errors);

    return errors;
  };

  SirTrevor.onFormSubmit = function(ev) {
    var errors = SirTrevor.onBeforeSubmit();

    if(errors > 0) {
      SirTrevor.EventBus.trigger("onError");
      ev.preventDefault();
    }
  };

  SirTrevor.setBlockOptions = function(type, options) {
    var block = SirTrevor.Blocks[type];

    if (_.isUndefined(block)) {
      return;
    }

    _.extend(block.prototype, options || {});
  };

  SirTrevor.runOnAllInstances = function(method) {
    if (_.has(SirTrevor.Editor.prototype, method)) {
      // augment the arguments pseudo array and pass on to invoke()
      // this allows us to pass arguments on to the target methods
      [].unshift.call(arguments, SirTrevor.instances);
      _.invoke.apply(_, arguments);
    } else {
      SirTrevor.log("method doesn't exist");
    }
  };

}(jQuery, _));

