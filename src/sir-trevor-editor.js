/*
  Sir Trevor Editor
  --
  Represents one Sir Trevor editor instance (with multiple blocks)
  Each block references this instance.
  BlockTypes are global however.
*/

SirTrevor.Editor = (function(){

  var SirTrevorEditor = function(options) {
    this.initialize(options);
  };

  _.extend(SirTrevorEditor.prototype, FunctionBind, SirTrevor.Events, {

    bound: ['onFormSubmit', 'showBlockControls', 'hideAllTheThings', 'hideBlockControls',
            'onNewBlockCreated', 'changeBlockPosition', 'onBlockDragStart', 'onBlockDragEnd',
            'removeBlockDragOver', 'onBlockDropped', 'renderBlock'],

    events: {
      'block:reorder:down':       'hideBlockControls',
      'block:reorder:dragstart':  'onBlockDragStart',
      'block:reorder:dragend':    'onBlockDragEnd',
      'block:content:dropped':    'removeBlockDragOver',
      'block:reorder:dropped':    'onBlockDropped',
      'block:create:new':         'onNewBlockCreated'
    },

    initialize: function(options) {
      SirTrevor.log("Init SirTrevor.Editor");

      this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
      this.ID = _.uniqueId('st-editor-');

      if (!this._ensureAndSetElements()) { return false; }

      if(!_.isUndefined(this.options.onEditorRender) && _.isFunction(this.options.onEditorRender)) {
        this.onEditorRender = this.options.onEditorRender;
      }

      // Mediated events for *this* Editor instance
      this.mediator = _.extend({}, SirTrevor.Events);

      this._bindFunctions();

      this.store("create");
      this.build();

      SirTrevor.instances.push(this);
      SirTrevor.bindFormSubmit(this.$form);
    },

    /*
      Build the Editor instance.
      Check to see if we've been passed JSON already, and if not try and create a default block.
      If we have JSON then we need to build all of our blocks from this.
    */
    build: function() {
      this.$el.hide();

      this.block_manager = new SirTrevor.BlockManager(this.options,
        this.ID, this.mediator);
      this.block_controls = new SirTrevor.BlockControls(this.block_manager.blockTypes,
        this.ID, this.mediator);
      this.fl_block_controls = new SirTrevor.FloatingBlockControls(this.$wrapper, this.ID);
      this.formatBar = new SirTrevor.FormatBar(this.options.formatBar);

      this.errorHandler = new SirTrevor.ErrorHandler(this.$outer,
        this.mediator, this.options.errorsContainer);

      this.listenTo(this.fl_block_controls, 'showBlockControls', this.showBlockControls);
      this.listenTo(this.mediator, 'renderBlock', this.renderBlock);

      this._setEvents();

      SirTrevor.EventBus.on(this.ID + ":blocks:change_position", this.changeBlockPosition);
      SirTrevor.EventBus.on("formatter:positon", this.formatBar.renderBySelection);
      SirTrevor.EventBus.on("formatter:hide", this.formatBar.hide);

      this.$wrapper.prepend(this.fl_block_controls.render().$el);
      $(document.body).append(this.formatBar.render().$el);
      this.$outer.append(this.block_controls.render().$el);

      $(window).bind('click', this.hideAllTheThings);

      this.createBlocks();
      this.$wrapper.addClass('st-ready');

      if(!_.isUndefined(this.onEditorRender)) {
        this.onEditorRender();
      }
    },

    createBlocks: function() {
      var store = this.store("read");

      if (store.data.length > 0) {
        _.each(store.data, function(block) {
          this.mediator.trigger('createBlock', block.type, block.data);
        }, this);
      } else if (this.options.defaultType !== false) {
        this.mediator.trigger('createBlock', this.options.defaultType, {});
      }
    },

    destroy: function() {
      // Destroy the rendered sub views
      this.formatBar.destroy();
      this.fl_block_controls.destroy();
      this.block_controls.destroy();

      // Destroy all blocks
      _.each(this.blocks, function(block) {
        this.removeBlock(block.blockID);
      }, this);

      // Stop listening to events
      this.mediator.stopListening();
      this.stopListening();

      // Cleanup element
      var el = this.$el.detach();

      // Remove instance
      SirTrevor.instances = _.reject(SirTrevor.instances, _.bind(function(instance) {
        return instance.ID == this.ID;
      }, this));

      // Clear the store
      this.store("reset");
      this.$outer.replaceWith(el);
    },

    reinitialize: function(options) {
      this.destroy();
      this.initialize(options || this.options);
    },

    _setEvents: function() {
      _.each(this.events, function(callback, type) {
        SirTrevor.EventBus.on(type, this[callback], this);
      }, this);
    },

    hideAllTheThings: function(e) {
      this.block_controls.hide();
      this.formatBar.hide();

      if (!_.isUndefined(this.block_controls.current_container)) {
        this.block_controls.current_container.removeClass("with-st-controls");
      }
    },

    showBlockControls: function(container) {
      if (!_.isUndefined(this.block_controls.current_container)) {
        this.block_controls.current_container.removeClass("with-st-controls");
      }

      this.block_controls.show();

      container.append(this.block_controls.$el.detach());
      container.addClass('with-st-controls');

      this.block_controls.current_container = container;
    },

    store: function(method, options){
      return SirTrevor.editorStore(this, method, options || {});
    },

    renderBlock: function(block) {
      this._renderInPosition(block.render().$el);
      block.trigger("onRender");
    },

    onNewBlockCreated: function(block) {
      this.hideBlockControls();
      this.scrollTo(block.$el);
    },

    scrollTo: function(element) {
      $('html, body').animate({ scrollTop: element.position().top }, 300, "linear");
    },

    blockFocus: function(block) {
      this.block_controls.current_container = null;
    },

    hideBlockControls: function() {
      if (!_.isUndefined(this.block_controls.current_container)) {
        this.block_controls.current_container.removeClass("with-st-controls");
      }

      this.block_controls.hide();
    },

    removeBlockDragOver: function() {
      this.$outer.find('.st-drag-over').removeClass('st-drag-over');
    },

    triggerBlockCountUpdate: function() {
      SirTrevor.EventBus.trigger(this.ID + ":blocks:count_update", this.blocks.length);
    },

    changeBlockPosition: function($block, selectedPosition) {
      selectedPosition = selectedPosition - 1;

      var blockPosition = this.getBlockPosition($block);
      var $blockBy = this.$wrapper.find('.st-block').eq(selectedPosition);

      var where = (blockPosition > selectedPosition) ? "Before" : "After";

      if($blockBy && $blockBy.attr('id') !== $block.attr('id')) {
        this.hideAllTheThings();
        $block["insert" + where]($blockBy);
        this.scrollTo($block);
      }
    },

    onBlockDropped: function(block_id) {
      this.hideAllTheThings();
      var block = this.findBlockById(block_id);
      if (!_.isUndefined(block) &&
          !_.isEmpty(block.getData()) &&
          block.drop_options.re_render_on_reorder) {
        block.beforeLoadingData();
      }
    },

    onBlockDragStart: function() {
      this.hideBlockControls();
      this.$wrapper.addClass("st-outer--is-reordering");
    },

    onBlockDragEnd: function() {
      this.removeBlockDragOver();
      this.$wrapper.removeClass("st-outer--is-reordering");
    },

    _renderInPosition: function(block) {
      if (this.block_controls.current_container) {
        this.block_controls.current_container.after(block);
      } else {
        this.$wrapper.append(block);
      }
    },

    performValidations : function(block, should_validate) {
      var errors = 0;

      if (!SirTrevor.SKIP_VALIDATION && should_validate) {
        if(!block.valid()){
          this.mediator.trigger('errors:add', { text: _.result(block, 'validationFailMsg') });
          SirTrevor.log("Block " + block.blockID + " failed validation");
          ++errors;
        }
      }

      return errors;
    },

    saveBlockStateToStore: function(block) {
      var store = block.saveAndReturnData();
      if(store && !_.isEmpty(store.data)) {
        SirTrevor.log("Adding data for block " + block.blockID + " to block store");
        this.store("add", { data: store });
      }
    },

    /*
      Handle a form submission of this Editor instance.
      Validate all of our blocks, and serialise all data onto the JSON objects
    */
    onFormSubmit: function(should_validate) {
      // if undefined or null or anything other than false - treat as true
      should_validate = (should_validate === false) ? false : true;

      SirTrevor.log("Handling form submission for Editor " + this.ID);

      this.mediator.trigger('errors:reset');
      this.store("reset");

      this.validateBlocks(should_validate);
      this.validateBlockTypesExist(should_validate);

      this.mediator.trigger('errors:render');
      this.store("save");

      return this.errorHandler.errors.length;
    },

    validateBlocks: function(should_validate) {
      if (!this.required && (SirTrevor.SKIP_VALIDATION && !should_validate)) {
        return false;
      }

      var blockIterator = function(block,index) {
        var _block = this.block_manager.findBlockById($(block).attr('id'));
        if (_.isUndefined(_block)) { return false; }

        // Find our block
        this.performValidations(_block, should_validate);
        this.saveBlockStateToStore(_block);
      };

      _.each(this.$wrapper.find('.st-block'), blockIterator, this);
    },

    validateBlockTypesExist: function(should_validate) {
      if (!this.required && (SirTrevor.SKIP_VALIDATION && !should_validate)) {
        return false;
      }

      var blockTypeIterator = function(type, index) {
        if (!this.block_manager.isBlockTypeAvailable(type)) { return; }

        if (this.block_manager._getBlockTypeCount(type) === 0) {
          SirTrevor.log("Failed validation on required block type " + type);
          this.mediator.trigger('errors:add',
              { text: i18n.t("errors:type_missing", { type: type }) });
        } else {
          var blocks = _.filter(this.getBlocksByType(type),
                                function(b) { return !b.isEmpty(); });

          if (blocks.length > 0) { return false; }

          this.mediator.trigger('errors:add',
              { text: i18n.t("errors:required_type_empty", { type: type }) });
          SirTrevor.log("A required block type " + type + " is empty");
        }
      };

      if (_.isArray(this.block_manager.required)) {
        _.each(this.block_manager.required, blockTypeIterator, this);
      }
    },

    findBlockById: function(block_id) {
      return this.block_manager.findBlockById(block_id);
    },

    getBlocksByType: function(block_type) {
      return this.block_manager.getBlocksByType(block_type);
    },

    getBlocksByIDs: function(block_ids) {
      return this.block_manager.getBlocksByIDs(block_ids);
    },

    getBlockPosition: function($block) {
      return this.$wrapper.find('.st-block').index($block);
    },

    _ensureAndSetElements: function() {
      if(_.isUndefined(this.options.el) || _.isEmpty(this.options.el)) {
        SirTrevor.log("You must provide an el");
        return false;
      }

      this.$el = this.options.el;
      this.el = this.options.el[0];
      this.$form = this.$el.parents('form');

      var $outer = $("<div>").attr({ 'id': this.ID, 'class': 'st-outer', 'dropzone': 'copy link move' });
      var $wrapper = $("<div>").attr({ 'class': 'st-blocks' });

      // Wrap our element in lots of containers *eww*
      this.$el.wrap($outer).wrap($wrapper);

      this.$outer = this.$form.find('#' + this.ID);
      this.$wrapper = this.$outer.find('.st-blocks');

      return true;
    }

  });

  return SirTrevorEditor;

})();

