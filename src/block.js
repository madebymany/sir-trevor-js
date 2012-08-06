/*
  Generic Block Implementation
*/

var Block = SirTrevor.Block = function(options){
  this.blockID = _.uniqueId('block-');
  this._configure(options || {});
  this._setElement();
  this.initialize.apply(this, arguments);
};

var blockOptions = ["className", "toolbarEnabled", "dropEnabled", "title", "limit", "editorHTML", "dropzoneHTML"];

_.extend(Block.prototype, {
  
  $: function(selector) {
    return this.$el.find(selector);
  },
  
  initialize: function(){},
  
  loadData: function(){
    /* Generic load data function for when we're not provided with one */
  },
    
  render: function(){},
  remove: function(){},
  loading: function(){},
  onDrop: function(){},
  
  // 'Private' methods
  _configure: function(options) {
    if (this.options) options = _.extend({}, this.options, options);
    for (var i = 0, l = blockOptions.length; i < l; i++) {
      var attr = blockOptions[i];
      if (options[attr]) this[attr] = options[attr];
    }
    this.options = options;
  },
  
  _create: function(){
  },
  
  _objectName: function(){
    var objName = "";
    for (var block in SirTrevor.Blocks) {
      if (SirTrevor.Blocks[block].blockID == this.blockID) {
        objName = block;
      }
    } 
    return objName;
  },
  
  /*
    Our template is always either a string or a function
  */
  _setElement: function(){
    var el = (_.isFunction(this.editorHTML)) ? this.editorHTML() : this.editorHTML;
    // Set our element references
    this.$el = $(el);
    this.el = this.$el[0];
  }
});