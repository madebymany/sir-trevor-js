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

var blockTypeOptions = [
  "className", 
  "toolbarEnabled", 
  "dropEnabled", 
  "title", 
  "limit", 
  "editorHTML", 
  "dropzoneHTML", 
  "validate", 
  "loadData", 
  "toData",
  "onDrop",
  "onContentPasted",
  "onBlockRender",
  "beforeBlockRender",
  "onBlockActivated",
  "toMarkdown",
  "toHTML"
];

_.extend(BlockType.prototype, {
  
  initialize: function() {},
  
  loadData: function(block, data) {},
  validate: function(block) {},
  
  /*
    Generic toData implementation.
    Can be overwritten, although hopefully this will cover most situations
  */
  toData: function(block) {
    var bl = block.$el,
        dataStruct = bl.data('block'),
        content;
    
    /* Simple to start. Add conditions later */
    if (block.$('.text-block').length > 0) {
      content = block.$('.text-block').html();
      if (content.length > 0) {
        dataStruct.data.text = block.instance._toMarkdown(content, block.type);
      }
    }
    
    var hasTextAndData = (!_.isUndefined(dataStruct.data.text) || block.$('.text-block').length === 0);
    
    // Add any inputs to the data attr
    if(block.$('input[type="text"]').not('.paste-block').length > 0) {
      block.$('input[type="text"]').each(function(index,input){
        input = $(input);
        if (input.val().length > 0 && hasTextAndData) {
          dataStruct.data[input.attr('name')] = input.val();
        }
      });
    }
    
    block.$('select').each(function(index,input){
      input = $(input);
      if(input.val().length > 0 && hasTextAndData) {
        dataStruct.data[input.attr('name')] = input.val();
      }
    });
    
    block.$('input[type="file"]').each(function(index,input) {
      input = $(input);
      dataStruct.data.file = input.data('json');
    });
  },
  
  /* Callback methods that can be overriden */
  onBlockRender: function(block){},
  beforeBlockRender: function(block){},
  onBlockActivated: function(block){},
  onDrop: function(block){},
  onContentPasted: function(block, event){},
  
  // 'Private' methods
  _configure: function(options) {
    if (this.options) options = _.extend({}, this.options, options);
    for (var i = 0, l = blockTypeOptions.length; i < l; i++) {
      var attr = blockTypeOptions[i];
      if (options[attr]) this[attr] = options[attr];
    }
    this.options = options;
  },
  
  blockType: function() {
    var objName = "";
    for (var block in SirTrevor.BlockTypes) {
      if (SirTrevor.BlockTypes[block] == this) {
        objName = block;
      }
    } 
    return objName;
  }
});