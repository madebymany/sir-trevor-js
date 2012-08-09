/*
  SirTrevor Marker
  --
  This is our toolbar. It's attached to a SirTrveor.Editor instance. 
*/

var Marker = SirTrevor.Marker = function(options, editorInstance){
  this.instance = editorInstance;
  this.options = _.extend({}, SirTrevor.DEFAULTS.marker, options || {});
  this._bindFunctions();
};

_.extend(Marker.prototype, Events, {
  
  bound: ["onButtonClick", "show", "hide"],
  
  render: function() {
    
    var marker = $('<span>', {
      'class': this.instance.options.baseCSSClass + "-" + this.options.baseCSSClass,
      html: '<p>' + this.options.addText + '</p><div class="buttons"></div>'
    });
    
    // Bind to the wrapper
    this.instance.$wrapper.append(marker);
    
    // Cache our elements for later use
    this.$el = marker;
    this.$btns = this.$el.find('.buttons');
    this.$p = this.$el.find('p');
    
    // Add all of our buttons
    var blockName, block; 
    
    for (blockName in this.instance.blockTypes) {
      if (SirTrevor.BlockTypes.hasOwnProperty(blockName)) {
        block = SirTrevor.BlockTypes[blockName];
        if (block.toolbarEnabled) {
          this.$btns.append(
           $("<a>", {
            "href": "#",
            "class": this.options.buttonClass + " new-" + block.className,
            "data-type": blockName,
            "text": block.title,
            click: this.onButtonClick
           }) 
          );
        }
      }
    }
    
    this.$el.addClass('ready');
  },
    
  /* Convienience methods */
  show: function(){ this.$el.show(); },
  hide: function(){ this.$el.hide(); },
  remove: function(){ this.$el.remove(); },
  
  onButtonClick: function(ev){
    halt(ev);
    var button = $(ev.target);
    this.instance.createBlock(button.attr('data-type'), {});
  }
});



