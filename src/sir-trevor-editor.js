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

  //this.marker = new SirTrevor.Marker(this.options.marker, this);
  
  this.formatBar = new SirTrevor.FormatBar(this.options.formatBar, this);

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
  
  bound: ['onFormSubmit'],
  
  initialize: function() {},
  /*
    Build the Editor instance. 
    Check to see if we've been passed JSON already, and if not try and create a default block.
    If we have JSON then we need to build all of our blocks from this.
  */
  build: function() {
    this.$el.hide();
    
    this.block_controls = new SirTrevor.BlockControls(this.blockTypes, this.ID);
    this.listenTo(this.block_controls, 'createBlock', this.createBlock);

    // Render marker & format bar
    //this.marker.render();
    this.formatBar.render();

    this.$outer.append(this.block_controls.render().$el);
    
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
        
    this.$wrapper.addClass('sir-trevor-ready');
    
    if(!_.isUndefined(this.onEditorRender)) {
      this.onEditorRender();
    }
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
  createBlock: function(type, data) {
    type = _.capitalize(type); // Proper case
    
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
    this.$wrapper.append(block.render().$el);
    this.listenTo(block, 'removeBlock', this.removeBlock);

    this.blocks.push(block);
    this._incrementBlockTypeCount(type);

    SirTrevor.publish("editor/block/createBlock");
    SirTrevor.log("Block created of type " + type);
  },

  _incrementBlockTypeCount: function(type) {
    this.blockCounts[type] = (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type] + 1;
  },

  _getBlockTypeCount: function(type) {
    return (_.isUndefined(this.blockCounts[type])) ? 0 : this.blockCounts[type];
  },

  _canAddBlockType: function(type) {
    var block_type_limit = this._getBlockTypeLimit(type);

    return !(block_type_limit !== 0 && this._getBlockTypeCount(type) > block_type_limit);
  },
  
  removeBlock: function(block_id, type) {
    this.blockCounts[type] = this.blockCounts[type] - 1;
    this.blocks = _.reject(this.blocks, function(item){ return (item.blockID == block_id); });
    if(_.isUndefined(this.blocks)) this.blocks = [];
    
    SirTrevor.publish("editor/block/removeBlock");
  },
  
  performValidations : function(_block, should_validate) {
    
    var errors = 0;
    
    if (!SirTrevor.SKIP_VALIDATION && should_validate) {
      if(!_block.validate()){
        // fail validations
        SirTrevor.log("Block " + _block.blockID + " failed validation");
        ++errors;
      }
    } else {
      // not validating so clear validation warnings
      _block._beforeValidate();
    }
    
    // success
    var store = _block.save();
    if(!_.isEmpty(store.data)) {
      SirTrevor.log("Adding data for block " + _block.blockID + " to block store");
      this.store("add", this, { data: store });
    }
    return errors;
  },
  
  /*
    Handle a form submission of this Editor instance.
    Validate all of our blocks, and serialise all data onto the JSON objects
  */
  onFormSubmit: function(should_validate) {
    
    // if undefined or null or anything other than false - treat as true
    should_validate = (should_validate === false) ? false : true;
    
    SirTrevor.log("Handling form submission for Editor " + this.ID);
    
    var blockLength, block, result, errors = 0;
    
    this.removeErrors();
    // Reset our store
    this.store("reset", this);
    
    // Loop through blocks to validate
    var blockIterator = function(block,index) {
      // Find our block
      block = $(block);
      var _block = _.find(this.blocks, function(b){ return (b.blockID == block.attr('id')); });
      
      if (!_.isUndefined(_block) || !_.isEmpty(_block) || typeof _block == SirTrevor.Block) {
        // Validate our block
        errors += this.performValidations(_block, should_validate);
      }
    };
    _.each(this.$wrapper.find('.' + this.options.baseCSSClass + "-block"), _.bind(blockIterator, this));

    // Validate against our required fields (if there are any)
    if (this.required && (!SirTrevor.SKIP_VALIDATION && should_validate)) {
      _.each(this.required, _.bind(function(type) {
        if (this._isBlockTypeAvailable(type)) {
          // Valid block type to validate against
          if (_.isUndefined(this.blockCounts[type]) || this.blockCounts[type] === 0) {
            this.errors.push({ text: "You must have a block of type " + type });
            SirTrevor.log("Failed validation on required block type " + type);
            errors++;
          } else {
            // We need to also validate that we have some data of this type too.
            // This is ugly, but necessary for proper validation on blocks that don't have required fields.
            var blocks = _.filter(this.blocks, function(b){ return (b.type == type && !_.isEmpty(b.getData())); });
            if (blocks.length === 0) {
              this.errors.push({ text: "A required block type " + type + " is empty" });
              errors++;
              SirTrevor.log("A required block type " + type + " is empty");
            }
          }
        }
      }, this));
    }

    // Save it
    this.store("save", this);
    if (errors > 0) this.renderErrors();
    return errors;
  },
  
  renderErrors: function() {
    if (this.errors.length > 0) {
      
      if (_.isUndefined(this.$errors)) {
        this.$errors = $("<div>", {
          'class': this.baseCSS("errors"),
          html: "<p>You have the following errors: </p><ul></ul>"
        });
        this.$outer.prepend(this.$errors);
      }
      
      var list = this.$errors.find('ul');
      
      _.each(this.errors, _.bind(function(error) {
        list.append($("<li>", {
          'class': this.baseCSS("error-msg"),
          html: error.text
        }));
      }, this));
      
      this.$errors.show();
    }
  },
  
  removeErrors: function() {
    if (this.errors.length > 0) {
      // We have old errors to remove
      this.$errors.find('ul').html('');
      this.$errors.hide();
      this.errors = [];
    }
  },
  
  /*
    Get Block Type Limit
    --
    returns the limit for this block, which can be set on a per Editor instance, or on a global blockType scope.
  */
  _getBlockTypeLimit: function(t) {
    if (!this._isBlockTypeAvailable(t)) { return 0; }

    return (_.isUndefined(this.options.blockTypeLimits[t])) ? 0 : this.options.blockTypeLimits[t];
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
    this.$wrapper = this.$form.find('.st-blocks');

    return true;
  },
  
  
  /*
    Set our blockTypes
    These will either be set on a per Editor instance, or set on a global scope.
  */
  _setBlocksTypes: function() {
    this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.Blocks : this.options.blockTypes);
  },
  
  /* Get our required blocks (if any) */
  _setRequired: function() {
    this.required = (_.isArray(this.options.required) && !_.isEmpty(this.options.required)) ? this.options.required : false;
  },

  baseCSS: function(additional) {
    return this.options.baseCSSClass + "-" + additional;
  }
});

