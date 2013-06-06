/*
  Sir Trevor Editor
  --
  Represents one Sir Trevor editor instance (with multiple blocks)
  Each block references this instance.
  BlockTypes are global however.
*/

var SirTrevorEditor = SirTrevor.Editor = function(options) {
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

  this.store("create", this);
  this.build();

  SirTrevor.instances.push(this);
  SirTrevor.bindFormSubmit(this.$form);
};

_.extend(SirTrevorEditor.prototype, FunctionBind, Events, {

  bound: ['onFormSubmit', 'showBlockControls', 'hideAllTheThings'],

  initialize: function() {},
  /*
    Build the Editor instance.
    Check to see if we've been passed JSON already, and if not try and create a default block.
    If we have JSON then we need to build all of our blocks from this.
  */
  build: function() {
    this.$el.hide();

    this.block_controls = new SirTrevor.BlockControls(this.blockTypes, this.ID);
    this.fl_block_controls = new SirTrevor.FloatingBlockControls(this.$wrapper);
    this.formatBar = new SirTrevor.FormatBar(this.options.formatBar);

    this.listenTo(this.block_controls, 'createBlock', this.createBlock);
    this.listenTo(this.fl_block_controls, 'showBlockControls', this.showBlockControls);

    SirTrevor.EventBus.on("block:reorder:dragstart", this.hideBlockControls);
    SirTrevor.EventBus.on("block:reorder:dragend", this.removeBlockDragOver);
    SirTrevor.EventBus.on("block:content:dropped", this.removeBlockDragOver);
    SirTrevor.EventBus.on("formatter:positon", this.formatBar.render_by_selection);
    SirTrevor.EventBus.on("formatter:hide", this.formatBar.hide);

    this.$outer.append(this.formatBar.render().$el);
    this.$outer.append(this.block_controls.render().$el);

    $(window).bind('click', this.hideAllTheThings);

    var store = this.store("read", this);

    if (store.data.length === 0) {
      // Create a default instance
      this.createBlock(this.options.defaultType);
    } else {
      // We have data. Build our blocks from here.
      _.each(store.data, _.bind(function(block){
        SirTrevor.log('Creating: ', block);
        this.createBlock(block.type, block.data);
      }, this));
    }

    this.$wrapper.addClass('st-ready');

    if(!_.isUndefined(this.onEditorRender)) {
      this.onEditorRender();
    }
  },

  hideAllTheThings: function(e) {
    this.block_controls.hide();
    this.formatBar.hide();

    if (!_.isUndefined(this.block_controls.current_container)) {
      this.block_controls.current_container.removeClass("st-block--with-controls");
    }
  },

  showBlockControls: function(container) {
    if (!_.isUndefined(this.block_controls.current_container)) {
      this.block_controls.current_container.removeClass("st-block--with-controls");
    }

    this.block_controls.show();
    container.append(this.block_controls.$el.detach());
    container.addClass('st-block--with-controls');
    this.block_controls.current_container = container;
  },

  store: function(){
    return SirTrevor.editorStore.apply(this, arguments);
  },

  /*
    Create an instance of a block from an available type.
    We have to check the number of blocks we're allowed to create before adding one and handle fails accordingly.
    A block will have a reference to an Editor instance & the parent BlockType.
    We also have to remember to store static counts for how many blocks we have, and keep a nice array of all the blocks available.
  */
  createBlock: function(type, data, render_at) {
    type = _.capitalize(type); // Proper case

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

    SirTrevor.publish("editor/block/createBlock");
    SirTrevor.log("Block created of type " + type);
  },

  blockFocus: function(block) {
    this.block_controls.current_container = null;
  },

  hideBlockControls: function() {
    this.block_controls.hide();
  },

  removeBlockDragOver: function() {
    this.$wrapper.find('.st-drag-over').removeClass('st-drag-over');
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

    return !(block_type_limit !== 0 && this._getBlockTypeCount(type) > block_type_limit);
  },

  _blockLimitReached: function() {
    return (this.options.blockLimit !== 0 && this.blocks.length >= this.options.blockLimit);
  },

  removeBlock: function(block_id, type) {
    this.blockCounts[type] = this.blockCounts[type] - 1;
    this.blocks = _.reject(this.blocks, function(item){ return (item.blockID == block_id); });
    SirTrevor.publish("editor/block/removeBlock");
  },

  performValidations : function(block, should_validate) {
    var errors = 0;

    block._beforeValidate();

    if (!SirTrevor.SKIP_VALIDATION && should_validate) {
      if(!block.validate()){
        this.errors.push({ text: _.result(block, 'validationFailMsg') });
        SirTrevor.log("Block " + block.blockID + " failed validation");
        ++errors;
      }
    }

    return errors;
  },

  saveBlockStateToStore: function(block) {
    var store = block.save();
    if(!_.isEmpty(store.data)) {
      SirTrevor.log("Adding data for block " + block.blockID + " to block store");
      this.store("add", this, { data: store });
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
    this.store("reset", this);

    this.validateBlocks(should_validate);
    this.validateBlockTypesExist(should_validate);

    this.renderErrors();
    this.store("save", this);

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

    _.each(this.$wrapper.find('.st-block'), _.bind(blockIterator, this));
  },

  validateBlockTypesExist: function(should_validate) {
    if (!this.required && (SirTrevor.SKIP_VALIDATION && !should_validate)) {
      return false;
    }

    var blockTypeIterator = function(type, index) {
      if (this._isBlockTypeAvailable(type)) {
        if (this._getBlockTypeCount(type) === 0) {
          SirTrevor.log("Failed validation on required block type " + type);
          this.errors.push({ text: "You must have a block of type " + type });
        } else {
          var blocks = _.filter(this.blocks, function(b){ return (b.type == type && !_.isEmpty(b.getData())); });
          if (blocks.length > 0) { return false; }

          this.errors.push({ text: "A required block type " + type + " is empty" });
          SirTrevor.log("A required block type " + type + " is empty");
        }
      }
    };

    _.each(this.required, _.bind(blockTypeIterator, this));
  },

  renderErrors: function() {
    if (this.errors.length === 0) { return false; }

    if (_.isUndefined(this.$errors)) {
      this.$errors = $("<div>", {
        'class': 'st-errors',
        html: "<p>You have the following errors: </p><ul></ul>"
      });
      this.$outer.prepend(this.$errors);
    }

    var str = "";

    _.each(this.errors, function(error) {
      str += '<li class="st-errors__msg">'+ error.text +'</li>';
    });

    this.$errors.find('ul').append(str);
    this.$errors.show();
  },

  removeErrors: function() {
    if (this.errors.length === 0) { return false; }

    this.$errors.hide();
    this.$errors.find('ul').html('');

    this.errors = [];
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
    this.required = (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) ? this.options.required : false;
  }
});

