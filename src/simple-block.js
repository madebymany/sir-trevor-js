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

    className: 'st-block',

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
      // Memoize the slug.
      this.blockCSSClass = _.to_slug(this.type);
      return this.blockCSSClass;
    },

    $$: function(selector) {
      return this.$el.find(selector);
    },

    type: '',
    editorHTML: '',

    initialize: function() {},

    loadData: function() {},
    onBlockRender: function(){},
    beforeBlockRender: function(){},
    toHTML: function(html){ return html; },

    store: function(){ return SirTrevor.blockStore.apply(this, arguments); },

    _loadAndSetData: function() {
      var currentData = this.getData();
      if (!_.isUndefined(currentData) && !_.isEmpty(currentData)) {
        this._loadData();
      }
    },

    render: function() {
      this.beforeBlockRender();

      var editor_html = _.result(this, 'editorHTML');

      this._loadAndSetData();

      this.$el.addClass('st-item-ready');
      this.save();

      this.onBlockRender();

      return this;
    },

    /* Save the state of this block onto the blocks data attr */
    save: function() {
      // this.toData();
      return this.store("read", this);
    },

    getData: function() {
      return this.store("read", this).data;
    },

    setData: function(data) {
      SirTrevor.log("Setting data for block " + this.blockID);
      this.store("save", this, { data: _.extend(this.dataStore.data, data) });
    },

    /*
      Generic toData implementation.
      Can be overwritten, although hopefully this will cover most situations
    */
    // toData: function() {
    //   SirTrevor.log("toData for " + this.blockID);

    //   var bl = this.$el,
    //       dataObj = {};

    //   /* Simple to start. Add conditions later */
    //   if (this.hasTextBlock()) {
    //     var content = this.getTextBlock().html();
    //     if (content.length > 0) {
    //       dataObj.text = SirTrevor.toMarkdown(content, this.type);
    //     }
    //   }

    //   var hasTextAndData = (!_.isUndefined(dataObj.text) || !this.hasTextBlock());

    //   // Add any inputs to the data attr
    //   if(this.$$('input[type="text"]').not('.st-paste-block').length > 0) {
    //     this.$$('input[type="text"]').each(function(index,input){
    //       input = $(input);
    //       if (hasTextAndData) {
    //         dataObj[input.attr('name')] = input.val();
    //       }
    //     });
    //   }

    //   // Set
    //   if(!_.isEmpty(dataObj)) {
    //     this.setData(dataObj);
    //   }
    // },

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

      this.loading();

      if(this.droppable || this.uploadable || this.pastable) {
        this.$editor.show();
        this.$inputs.hide();
      }

      SirTrevor.EventBus.trigger("editor/block/loadData");

      this.loadData(this.getData());
      this.ready();
    },

    _getBlockClass: function() {
      return 'st-block--' + this.className;
    },

    focus : function() {}

  });

  SimpleBlock.extend = extend; // Allow our Block to be extended.

  return SimpleBlock;

})();