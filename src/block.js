/* A Block representation */

var Block = SirTrevor.Block = function(instance, type, data) {
  
  this.blockID = _.uniqueId(type.blockTypeID + '_block-');
  this.instance = instance; // SirTrevor.Editor instance
  this.blockType = type;
  this.data = data;
  this.wrapperEl = $('<div>', { 
    'class': instance.options.baseCSSClass + "-block", 
    id: this.blockID,
    "data-type": this.blockType.blockType() 
  });
  this.errors = [];
    
  this._setElement();
  this.render();
};

_.extend(Block.prototype, {
  
  $: function(selector) {
    return this.$el.find(selector);
  },
  
  render: function() {
    this.instance.$wrapper.append(this.$el);
    this.$el.wrap(this.wrapperEl);
    
    // Has data already?
    if (!_.isUndefined(this.data)) {
      
    }
    
    this.$el.data('block', this.blockType.toData());
    
  },
  
  remove: function() {
    this.$el.parent().remove();
  },
  
  loadData: function() {
    this.blockType.loadData(this); // Delegate to blocktype
  },
  
  validate: function() {
    this.errors = []; 
    var result = this.blockType.validate(this); // Delegate to blocktype
    return result;
  },
  
  serialize: function() {
    this.blockType.serialize(this); 
  },
  
  deserialize: function() {
    this.blockType.deserialize(this); 
  },
  
  /*
    Our template is always either a string or a function
  */
  _setElement: function(){
    var el = (_.isFunction(this.blockType.editorHTML)) ? this.blockType.editorHTML() : this.blockType.editorHTML;
    // Set our element references
    this.$el = $(el);
    this.el = this.$el[0];
  }
});
