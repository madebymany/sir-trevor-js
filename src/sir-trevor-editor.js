/*
  Sir Trevor Editor
  -- 
  Represents one Sir Trevor editor instance (with multiple blocks)
  Each block references this instance. 
  BlockTypes are global however.
*/

var SirTrevorEditor = SirTrevor.Editor = function(options){
  this.blockTypes = {};
  this.formatters = {};
  this.options = _.extend({}, SirTrevor.DEFAULTS, options || {});
  this.ID = _.uniqueId(this.options.baseCSSClass + "-");
  this._setBlocksAndFormatters();
  this._ensureAndSetElements();
  this.build();
};

_.extend(SirTrevorEditor.prototype, {
  
  initialize: function(){},
  
  build: function(){
    // Create a default instance
    SirTrevor.BlockTypes[this.options.defaultType].createInstance(this, {});
  },
  
  _blockTypeAvailable: function(t){
    return !_.isUndefined(this.blockTypes[t]);
  },
  
  _formatterAvailable: function(f){
    return !_.isUndefined(this.formatters[f]);
  },
  
  _ensureAndSetElements: function() {
    
    this.$el = this.options.el;
    this.el = this.options.el[0];
    this.$form = this.$el.parents('form');
    
    // Wrap our element in lots of containers *eww*
    this.$el
      .wrap(
        $('<div>', { 
          'class': this.options.baseCSSClass + "_outer"
        })
      )
      .wrap(
        $('<div>', { 
          'class': this.options.baseCSSClass + "_dragleave"
        })
      )
      .wrap(
        $('<div>', {
          id: this.ID,
          'class': this.options.baseCSSClass + "_container",
          dropzone: 'copy link move'
        })
      );
      
    this.$wrapper = this.$form.find('#' + this.ID);  
  },
  
  _setBlocksAndFormatters: function(){
    this.blockTypes = flattern((_.isUndefined(this.options.blockTypes)) ? SirTrevor.BlockTypes : this.options.blockTypes);
    this.formatters = flattern((_.isUndefined(this.options.formatters)) ? SirTrevor.Formatters : this.options.formatters);
  }
  
});

