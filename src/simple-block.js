SirTrevor.SimpleBlock = (function(){

  var SimpleBlock = function(data, instance_id) {
    this.store("create", this, { data: data || {} });
    this.blockID = _.uniqueId('st-block-');
    this.instanceID = instance_id;

    this._ensureElement();
    this._bindFunctions();

    this.initialize.apply(this, arguments);
  };

  _.extend(SimpleBlock.prototype, FunctionBind, SirTrevor.Events, Renderable, {

    focus : function() {},

    validate : function() { return true; },
    toData : function() {},

    className: 'st-block',

    block_template: _.template(
      "<div class='st-block__inner'><%= editor_html %></div>"
    ),

    attributes: function() {
      return {
        'id': this.blockID,
        'data-type': this.type,
        'data-instance': this.instanceID
      };
    },

    title: function() {
      return _.capitalize(this.type);
    },

    blockCSSClass: function() {
      this.blockCSSClass = _.to_slug(this.type);
      return this.blockCSSClass;
    },

    type: '',
    editorHTML: '',

    initialize: function() {},

    loadData: function() {},
    onBlockRender: function(){},
    beforeBlockRender: function(){},

    store: function(){ return SirTrevor.blockStore.apply(this, arguments); },

    _loadAndSetData: function() {
      var currentData = this.getData();
      if (!_.isUndefined(currentData) && !_.isEmpty(currentData)) {
        this._loadData();
      }
    },

    _setBlockInner : function() {
      var editor_html = _.result(this, 'editorHTML');

      this.$el.append(
        this.block_template({ editor_html: editor_html })
      );

      this.$inner = this.$el.find('.st-block__inner');
      this.$inner.bind('click mouseover', function(e){ e.stopPropagation(); });
    },

    render: function() {
      this.beforeBlockRender();

      this._setBlockInner();
      this._blockPrepare();

      this.onBlockRender();

      return this;
    },

    _blockPrepare : function() {
      this._loadAndSetData();
      this._initUI();

      this.$el.addClass('st-item-ready');
      this.save();
    },

    /* Save the state of this block onto the blocks data attr */
    save: function() {
      this.toData();
      return this.store("read", this);
    },

    getData: function() {
      return this.store("read", this).data;
    },

    setData: function(data) {
      SirTrevor.log("Setting data for block " + this.blockID);
      this.store("save", this, { data: _.extend(this.dataStore.data, data) });
    },

    _withUIComponent: function(component, className, callback) {
      this.$ui.append(component.render().$el);
      (className && callback) && this.$ui.on('click', className, callback);
    },

    _initUI : function() {
      var ui_element = $("<div>", { 'class': 'st-block__ui' });
      this.$inner.append(ui_element);
      this.$ui = ui_element;
      this._initUIComponents();
    },

    _initUIComponents: function() {
      this._withUIComponent(new SirTrevor.BlockReorder(this.$el));
    },

    _loadData: function() {
      SirTrevor.log("loadData for " + this.blockID);
      SirTrevor.EventBus.trigger("editor/block/loadData");
      this.loadData(this.getData());
    },

    /* Block validator methods */

    errors: [],

    valid: function(){
      this.performValidations();
      return this.errors.length > 0;
    },

    // This method actually does the leg work
    // of running our validators and custom validators
    performValidations: function() {
      var required_fields = this.$('.st-required');
      _.each(required_fields, _.bind(this.validateField, this));
      _.each(this.validations, _.bind(this.runValidator, this));
    },

    // Everything in here should be a function that returns true or false
    validations: [],

    validateField: function(field) {
      field = $(field);
      this.setError(field, "must not be empty");
    },

    runValidator: function(validator) {
      if (!_.isUndefined(this[validator])) {
        this[validator].call(this);
      }
    },

    setError: function(field, reason) {
      field.addClass('st-error')
           .append("<span>", { html: reason, class: 'st-error-msg' });
      this.errors.push({ field: field, reason: reason });
    },

    _resetErrors: function() {
      _.each(this.errors, function(error){
        if (!_.isUndefined(error.field)) {
          error.field.removeClass('st-error')
                     .find('.st-error-msg').remove();
        }
      });

      this.errors = [];
    }

  });

  SimpleBlock.fn = SimpleBlock.prototype;

  SimpleBlock.extend = extend; // Allow our Block to be extended.

  return SimpleBlock;

})();