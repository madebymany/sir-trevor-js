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

    valid : function() { return true; },
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
      this._initMessages();

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

    _initMessages: function() {
      var msgs_element = $("<div>", { 'class': 'st-block__messages' });
      this.$inner.prepend(msgs_element);
      this.$messages = msgs_element;
    },

    addMessage: function(msg, additionalClass) {
      var $msg = $("<span>", { html: msg, class: "st-msg " + additionalClass });
      this.$messages.append($msg)
                    .addClass('st-block__messages--is-visible');
      return $msg;
    },

    resetMessages: function() {
      this.$messages.html('')
                    .removeClass('st-block__messages--is-visible');
    },

    _initUIComponents: function() {
      this._withUIComponent(new SirTrevor.BlockReorder(this.$el));
    },

    _loadData: function() {
      SirTrevor.log("loadData for " + this.blockID);
      SirTrevor.EventBus.trigger("editor/block/loadData");
      this.loadData(this.getData());
    }

  });

  SimpleBlock.fn = SimpleBlock.prototype;

  SimpleBlock.extend = extend; // Allow our Block to be extended.

  return SimpleBlock;

})();