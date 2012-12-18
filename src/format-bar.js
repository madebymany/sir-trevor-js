/*
  Format Bar
  --
  Displayed on focus on a text area.
  Renders with all available options for the editor instance
*/

var FormatBar = SirTrevor.FormatBar = function(options, editorInstance) {
  this.instance = editorInstance;
  this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
  this.className = this.instance.baseCSS(this.options.baseCSSClass);
  this.clicked = false;
  this._bindFunctions();
};

_.extend(FormatBar.prototype, FunctionBind, {
  
  bound: ["onFormatButtonClick"],
  
  render: function(){
    
    var bar = $("<div>", {
      "class": this.className
    });
    
    this.instance.$wrapper.prepend(bar);
    this.$el = bar;
    
    var formats = this.instance.formatters,
        formatName, format;
        
    for (formatName in formats) {
      if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
        format = SirTrevor.Formatters[formatName];
        $("<button>", {
          'class': this.instance.baseCSS("format-button"),
          'text': format.title,
          'data-type': formatName,
          'data-cmd': format.cmd,
          click: this.onFormatButtonClick
        }).appendTo(this.$el);
      }
    }
    
    if(this.$el.find('button').length === 0) this.$el.addClass('hidden');
    
    this.hide();
    this.$el.bind('mouseout', _.bind(function(ev){ halt(ev); this.clicked = false; }, this));
    this.$el.bind('mouseover', halt);
  },
  
  /* Convienience methods */
  show: function(relativeEl){
    this.$el.css({ top: relativeEl.position().top })
        .addClass(this.instance.baseCSS('item-ready'))
        .show();
  },

  hide: function(){ 
    this.clicked = false;
    this.$el.removeClass(this.instance.baseCSS('item-ready')).hide();
  },
  
  remove: function(){ this.$el.remove(); },
  
  onFormatButtonClick: function(ev){
    halt(ev);
    this.clicked = true;
    var btn = $(ev.target),
        format = SirTrevor.Formatters[btn.attr('data-type')];
     
    // Do we have a click function defined on this formatter?     
    if(!_.isUndefined(format.onClick) && _.isFunction(format.onClick)) {
      format.onClick(); // Delegate
    } else {
      // Call default
      document.execCommand(btn.attr('data-cmd'), false, format.param);
    }   
    // Make sure we still show the bar
    this.$el.addClass(this.instance.baseCSS('item-ready')); 
  }
  
});