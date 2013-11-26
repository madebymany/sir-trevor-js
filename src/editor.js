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

    bound: ['onFormSubmit', 'hideAllTheThings', 'changeBlockPosition', 'removeBlockDragOver',
            'renderBlock', 'resetBlockControls', 'blockLimitReached'],

    events: {
      'block:reorder:dragend': 'removeBlockDragOver',
      'block:content:dropped': 'removeBlockDragOver'
    },

    initialize: function(options) {
      SirTrevor.log("Init SirTrevor.Editor");

      this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
      this.ID = _.uniqueId('st-editor-');

      if (!this._ensureAndSetElements()) { return false; }

      if(!_.isUndefined(this.options.onEditorRender) &&
        _.isFunction(this.options.onEditorRender)) {
        this.onEditorRender = this.options.onEditorRender;
      }

      // Mediated events for *this* Editor instance
      this.mediator = _.extend({}, SirTrevor.Events);

      this._bindFunctions();
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

      this.errorHandler = new SirTrevor.ErrorHandler(this.$outer, this.mediator, this.options.errorsContainer);
      this.store = new SirTrevor.EditorStore(this.$el.val(), this.mediator);
      this.block_manager = new SirTrevor.BlockManager(this.options, this.ID, this.mediator);
      this.block_controls = new SirTrevor.BlockControls(this.block_manager.blockTypes, this.mediator);
      this.fl_block_controls = new SirTrevor.FloatingBlockControls(this.$wrapper, this.ID, this.mediator);
      this.formatBar = new SirTrevor.FormatBar(this.options.formatBar, this.mediator);

      this.mediator.on('block:changePosition', this.changeBlockPosition);
      this.mediator.on('block-controls:reset', this.resetBlockControls);
      this.mediator.on('block:limitReached', this.blockLimitReached);
      this.mediator.on('block:render', this.renderBlock);

      this.dataStore = "Please use store.retrieve();";

      this._setEvents();

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
      var store = this.store.retrieve();

      if (store.data.length > 0) {
        _.each(store.data, function(block) {
          this.mediator.trigger('block:create', block.type, block.data);
        }, this);
      } else if (this.options.defaultType !== false) {
        this.mediator.trigger('block:create', this.options.defaultType, {});
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

      // Remove instance
      SirTrevor.instances = _.reject(SirTrevor.instances, _.bind(function(instance) {
        return instance.ID == this.ID;
      }, this));

      // Clear the store
      this.store.reset();
      this.$outer.replaceWith(this.$el.detach());
    },

    reinitialize: function(options) {
      this.destroy();
      this.initialize(options || this.options);
    },

    resetBlockControls: function() {
      this.block_controls.renderInContainer(this.$wrapper);
      this.block_controls.hide();
    },

    blockLimitReached: function(toggle) {
      this.$wrapper.toggleClass('st--block-limit-reached', toggle);
    },

    _setEvents: function() {
      _.each(this.events, function(callback, type) {
        SirTrevor.EventBus.on(type, this[callback], this);
      }, this);
    },

    hideAllTheThings: function(e) {
      this.block_controls.hide();
      this.formatBar.hide();
    },

    store: function(method, options){
      SirTrevor.log("The store method has been removed, please call store[methodName]");
      return this.store[method].call(this, options || {});
    },

    renderBlock: function(block) {
      this._renderInPosition(block.render().$el);
      this.hideAllTheThings();
      this.scrollTo(block.$el);

      block.trigger("onRender");
    },

    scrollTo: function(element) {
      $('html, body').animate({ scrollTop: element.position().top }, 300, "linear");
    },

    removeBlockDragOver: function() {
      this.$outer.find('.st-drag-over').removeClass('st-drag-over');
    },

    changeBlockPosition: function($block, selectedPosition) {
      selectedPosition = selectedPosition - 1;

      var blockPosition = this.getBlockPosition($block),
          $blockBy = this.$wrapper.find('.st-block').eq(selectedPosition);

      var where = (blockPosition > selectedPosition) ? "Before" : "After";

      if($blockBy && $blockBy.attr('id') !== $block.attr('id')) {
        this.hideAllTheThings();
        $block["insert" + where]($blockBy);
        this.scrollTo($block);
      }
    },

    _renderInPosition: function(block) {
      if (this.block_controls.currentContainer) {
        this.block_controls.currentContainer.after(block);
      } else {
        this.$wrapper.append(block);
      }
    },

    validateAndSaveBlock: function(block, should_validate) {
      if ((!SirTrevor.SKIP_VALIDATION || should_validate) && !block.valid()) {
        this.mediator.trigger('errors:add', { text: _.result(block, 'validationFailMsg') });
        SirTrevor.log("Block " + block.blockID + " failed validation");
        return;
      }

      SirTrevor.log("Adding data for block " + block.blockID + " to block store");
      this.store.addData(block.saveAndReturnData());
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
      this.store.reset();

      this.validateBlocks(should_validate);
      this.block_manager.validateBlockTypesExist(should_validate);

      this.mediator.trigger('errors:render');
      this.$el.val(this.store.toString());

      return this.errorHandler.errors.length;
    },

    validateBlocks: function(should_validate) {
      var blockIterator = function(block) {
        var _block = this.block_manager.findBlockById($(block).attr('id'));
        if (!_.isUndefined(_block)) {
          this.validateAndSaveBlock(_block, should_validate);
        }
      };

      _.each(this.$wrapper.find('.st-block'), blockIterator, this);
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

