/*
  Generic Block Type Implementation
  --
  SirTrevor 0..N BlockTypes
  BlockType 0..Limit Blocks
*/

var BlockType = SirTrevor.BlockType = function(options){
  this.instances = {};
  this.instanceCount = 0;
  this._configure(options || {});
  this.blockTypeID = _.uniqueId(this.className + '-');
  this.initialize.apply(this, arguments);
};

var blockTypeOptions = ["className", "toolbarEnabled", "dropEnabled", "title", "limit", "editorHTML", "dropzoneHTML"];

_.extend(BlockType.prototype, {
  
  initialize: function(){},
  
  loadData: function(){
    /* Generic load data function for when we're not provided with one */
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
  
  blockType: function(){
    var objName = "";
    for (var block in SirTrevor.BlockTypes) {
      if (SirTrevor.BlockTypes[block] == this) {
        objName = block;
      }
    } 
    return objName;
  }
});