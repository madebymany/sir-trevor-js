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
            'removeBlockDragOver', 'onBlockDropped', 'createBlock'],

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

      this.blockTypes = {};
      this.blockCounts = {}; // Cached block type counts
      this.blocks = []; // Block references
      this.errors = [];
      this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
      this.ID = _.uniqueId('st-editor-');

      if (!this._ensureAndSetElements()) { return false; }

      if(!_.isUndefined(this.options.onEditorRender) && _.isFunction(this.options.onEditorRender)) {
        this.onEditorRender = this.options.onEditorRender;
      }

      this._setRequired();
      this._setBlocksTypes();
      this._bindFunctions();

      this.store("create");
      
      SirTrevor.instances.push(this);
      
      this.build();
      
      SirTrevor.bindFormSubmit(this.$form);
    },

    /*
      Build the Editor instance.
      Check to see if we've been passed JSON already, and if not try and create a default block.
      If we have JSON then we need to build all of our blocks from this.
    */
    build: function() {
      this.$el.hide();

      this.block_controls = new SirTrevor.BlockControls(this.blockTypes, this.ID);
      this.fl_block_controls = new SirTrevor.FloatingBlockControls(this.$wrapper, this.ID);
      this.formatBar = new SirTrevor.FormatBar(this.options.formatBar);

      this.listenTo(this.block_controls, 'createBlock', this.createBlock);
      this.listenTo(this.fl_block_controls, 'showBlockControls', this.showBlockControls);

      this._setEvents();

      SirTrevor.EventBus.on(this.ID + ":blocks:change_position", this.changeBlockPosition);
      SirTrevor.EventBus.on("formatter:positon", this.formatBar.renderBySelection);
      SirTrevor.EventBus.on("formatter:hide", this.formatBar.hide);

      this.$wrapper.prepend(this.fl_block_controls.render().$el);
      $(document.body).append(this.formatBar.render().$el);
      this.$outer.append(this.block_controls.render().$el);

      $(window).bind('click', this.hideAllTheThings);

      var store = this.store("read");

      if (store.data.length > 0) {
        _.each(store.data, function(block){
          SirTrevor.log('Creating: ' + block.type);
          this.createBlock(block.type, block.data);
        }, this);
      } else if (this.options.defaultType !== false) {
        this.createBlock(this.options.defaultType, {});
      }

      this.$wrapper.addClass('st-ready');

      if(!_.isUndefined(this.onEditorRender)) {
        this.onEditorRender();
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

    /*
      Create an instance of a block from an available type.
      We have to check the number of blocks we're allowed to create before adding one and handle fails accordingly.
      A block will have a reference to an Editor instance & the parent BlockType.
      We also have to remember to store static counts for how many blocks we have, and keep a nice array of all the blocks available.
    */
    createBlock: function(type, data, render_at) {
      type = _.classify(type);

      if(this._blockLimitReached()) {
        SirTrevor.log("Cannot add any more blocks. Limit reached.");
        return false;
      }

      if (!this._isBlockTypeAvailable(type)) {
        SirTrevor.log("Block type not available " + type);
        return false;
      }

      // Can we have another one of these blocks?
      if (!this._canAddBlockType(type)) {
        SirTrevor.log("Block Limit reached for type " + type);
        return false;
      }

      var block = new SirTrevor.Blocks[type](data, this.ID);

      this._renderInPosition(block.render().$el);

      this.listenTo(block, 'removeBlock', this.removeBlock);

      this.blocks.push(block);
      this._incrementBlockTypeCount(type);

      block.focus();

      SirTrevor.EventBus.trigger(data ? "block:create:existing" : "block:create:new", block);
      SirTrevor.log("Block created of type " + type);
      block.trigger("onRender");

      this.$wrapper.toggleClass('st--block-limit-reached', this._blockLimitReached());
      this.triggerBlockCountUpdate();
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
      var blockByPosition = this.getBlockPosition($blockBy);

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

    _incrementBlockTypeCount: function(type) {
      this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 1: this.blockCounts[type] + 1;
    },

    _getBlockTypeCount: function(type) {
      return (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
    },

    _canAddBlockType: function(type) {
      var block_type_limit = this._getBlockTypeLimit(type);

      return !(block_type_limit !== 0 && this._getBlockTypeCount(type) >= block_type_limit);
    },

    _blockLimitReached: function() {
      return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
    },

    removeBlock: function(block_id) {
      var block = this.findBlockById(block_id),
          type = _.classify(block.type),
          controls = block.$el.find('.st-block-controls');

      if (controls.length) {
        this.block_controls.hide();
        this.$wrapper.prepend(controls);
      }

      this.blockCounts[type] = this.blockCounts[type] - 1;
      this.blocks = _.reject(this.blocks, function(item){ return (item.blockID == block.blockID); });
      this.stopListening(block);

      block.remove();

      SirTrevor.EventBus.trigger("block:remove");
      this.triggerBlockCountUpdate();

      this.$wrapper.toggleClass('st--block-limit-reached', this._blockLimitReached());
    },

    performValidations : function(block, should_validate) {
      var errors = 0;

      if (!SirTrevor.SKIP_VALIDATION && should_validate) {
        if(!block.valid()){
          this.errors.push({ text: _.result(block, 'validationFailMsg') });
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

      this.removeErrors();
      this.store("reset");

      this.validateBlocks(should_validate);
      this.validateBlockTypesExist(should_validate);

      this.renderErrors();
      this.store("save");

      return this.errors.length;
    },

    validateBlocks: function(should_validate) {
      if (!this.required && (SirTrevor.SKIP_VALIDATION && !should_validate)) {
        return false;
      }

      var blockIterator = function(block,index) {
        var _block = _.find(this.blocks, function(b) {
          return (b.blockID == $(block).attr('id')); });

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
        if (!this._isBlockTypeAvailable(type)) { return; }

        if (this._getBlockTypeCount(type) === 0) {
          SirTrevor.log("Failed validation on required block type " + type);
          this.errors.push({ text: i18n.t("errors:type_missing", { type: type }) });
        } else {
          var blocks = _.filter(this.getBlocksByType(type), function(b) {
            return !b.isEmpty();
          });

          if (blocks.length > 0) { return false; }

          this.errors.push({ text: i18n.t("errors:required_type_empty", { type: type }) });
          SirTrevor.log("A required block type " + type + " is empty");
        }
      };

      if (_.isArray(this.required)) {
        _.each(this.required, blockTypeIterator, this);
      }
    },

    renderErrors: function() {
      if (this.errors.length === 0) { return false; }

      if (_.isUndefined(this.$errors)) {
        this.$errors = this._errorsContainer();
      }

      var str = "<ul>";

      _.each(this.errors, function(error) {
        str += '<li class="st-errors__msg">'+ error.text +'</li>';
      });

      str += "</ul>";

      this.$errors.append(str);
      this.$errors.show();
    },

    _errorsContainer: function() {
      if (_.isUndefined(this.options.errorsContainer)) {
        var $container = $("<div>", {
          'class': 'st-errors',
          html: "<p>" + i18n.t("errors:title") + " </p>"
        });

        this.$outer.prepend($container);
        return $container;
      }

      return $element(this.options.errorsContainer);
    },

    removeErrors: function() {
      if (this.errors.length === 0) { return false; }

      this.$errors.hide().find('ul').html('');

      this.errors = [];
    },

    findBlockById: function(block_id) {
      return _.find(this.blocks, function(b){ return b.blockID == block_id; });
    },

    getBlocksByType: function(block_type) {
      return _.filter(this.blocks, function(b){ return _.classify(b.type) == block_type; });
    },

    getBlocksByIDs: function(block_ids) {
      return _.filter(this.blocks, function(b){ return _.contains(block_ids, b.blockID); });
    },

    getBlockPosition: function($block) {
      return this.$wrapper.find('.st-block').index($block);
    },

    /*
      Get Block Type Limit
      --
      returns the limit for this block, which can be set on a per Editor instance, or on a global blockType scope.
    */
    _getBlockTypeLimit: function(t) {
      if (!this._isBlockTypeAvailable(t)) { return 0; }

      return parseInt((_.isUndefined(this.options.blockTypeLimits[t])) ? 0 : this.options.blockTypeLimits[t], 10);
    },

    /*
      Availability helper methods
      --
      Checks if the object exists within the instance of the Editor.
    */
    _isBlockTypeAvailable: function(t) {
      return !_.isUndefined(this.blockTypes[t]);
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
    },

    /*
      Set our blockTypes
      These will either be set on a per Editor instance, or set on a global scope.
    */
    _setBlocksTypes: function() {
      this.blockTypes = _.flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.Blocks : this.options.blockTypes);
    },

    /* Get our required blocks (if any) */
    _setRequired: function() {
      if (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) {
        this.required = this.options.required;
      } else {
        this.required = false;
      }
    }
  });

  return SirTrevorEditor;

})();

