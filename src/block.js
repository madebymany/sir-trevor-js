/* A Block representation */

var Block = SirTrevor.Block = function(instance, parentBlockType, data) {
  
  this.blockID = _.uniqueId(parentBlockType.blockTypeID + '_block-');
  this.instance = instance; // SirTrevor.Editor instance
  this.blockType = parentBlockType;
  
  this.data = data;
  this.type = this.blockType.blockType();  // Cache the blocktype. 

  this.errors = [];
  
  this._setElement();
  this.render();
};

_.extend(Block.prototype, {
  
  $: function(selector) {
    return this.$el.find(selector);
  },
  
  render: function() {
    
    this.instance.$wrapper.append(
      $('<div>', { 
        'class': this.instance.options.baseCSSClass + "-block", 
        id: this.blockID,
        "data-type": this.type,
        html: this.$el
      })
    );
    
    // Has data already?
    if (!_.isUndefined(this.data) && !_.isEmpty(this.data)) {
      this.loadData();
    }
    
    // And save the state
    this.save();
  },
  
  remove: function() {
    this.$el.parent().remove();
  },
  
  loadData: function() {
    this._super("loadData", this.data);
  },
  
  validate: function() {
    this.errors = []; 
    var result = this._super("validate");
    return result;
  },
  
  /* Save the state of this block onto the blocks data attr */
  save: function() {
    var data = this.$el.data('block');
    if (_.isUndefined(data)) {
      // Create our data object on the element
      this.$el.data('block', this.to_json(this.data));
    } else {
      // We need to grab the state and save it here.
      this._super('toData');
    }
  },
  
  to_json: function(data) {
    return {
      type: this.type,
      data: data
    };
  },
  
  /*
    Our template is always either a string or a function
  */
  _setElement: function(){
    var el = (_.isFunction(this.blockType.editorHTML)) ? this.blockType.editorHTML() : this.blockType.editorHTML;
    
    // Wrap in a block
    var block = $('<div>', {
      'class': 'block_editor',
      html: el
    });
    
    // Set our element references
    this.$el = block;
    this.el = this.$el[0];
  },
  
  /* A wrapper to call our parent object */
  _super: function(functionName, args) {
   // if (_.has(this.blockType,functionName) && _.isFunction(this.blockType[functionName])) {
     console.log(functionName, args);
     return this.blockType[functionName](this, args);
  //  } else {
   //   console.log('Function doesnt exist');
  //  }
  }
});
