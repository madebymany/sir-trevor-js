/*
  Generic Block Type Implementation
  --
  SirTrevor 0..N BlockTypes
  BlockType 0..Limit Blocks
*/

var BlockType = SirTrevor.BlockType = function(options){
  this.instances = {};
  this.instanceCount = 0;
  this.blockTypeID = _.uniqueId('blocktype-');
  this._configure(options || {});
  this.initialize.apply(this, arguments);
};

var blockTypeOptions = ["className", "toolbarEnabled", "dropEnabled", "title", "limit", "editorHTML", "dropzoneHTML"];

_.extend(BlockType.prototype, {
  
  initialize: function(){},
  
  loadData: function(){
    /* Generic load data function for when we're not provided with one */
  },
  
  createInstance: function(){
    // Check to see that we haven't met our limit
    var block = new SirTrevor.Block(this);
    this.instances[block.blockID] = block;
  },
  
  removeInstance: function(name){
    if (!_.isUndefined(this.instances[name])) {
      var instance = this.instances[name];
      instance.remove(); // Remove from the DOM
      this.instances[name] = null;
    }
  },
  
  // 'Private' methods
  _configure: function(options) {
    if (this.options) options = _.extend({}, this.options, options);
    for (var i = 0, l = blockTypeOptions.length; i < l; i++) {
      var attr = blockTypeOptions[i];
      if (options[attr]) this[attr] = options[attr];
    }
    this.options = options;
  },
  
  _objectName: function(){
    var objName = "";
    for (var block in SirTrevor.BlockTypes) {
      if (SirTrevor.BlockTypes[block].blockID == this.blockID) {
        objName = block;
      }
    } 
    return objName;
  }
});

/* A Block representation */

var Block = SirTrevor.Block = function(parent){
  this.blockID = _.uniqueId(parent.blockTypeID + '-block-');
  this.parent = parent;
  this._setElement();
};

_.extend(Block.prototype, {
  
  initialize: function(){},
  
  $: function(selector) {
    return this.$el.find(selector);
  },
  
  loadData: function() {
    this.parent.loadData(); // Super
  },
  
  /*
    Our template is always either a string or a function
  */
  _setElement: function(){
    var el = (_.isFunction(this.parent.editorHTML)) ? this.parent.editorHTML() : this.parent.editorHTML;
    // Set our element references
    this.$el = $(el);
    this.el = this.$el[0];
  }
});
