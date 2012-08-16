/*
  Format Bar
  --
  Displayed on focus on a text area.
  Renders with all available options for the editor instance
*/

var FormatBar = SirTrevor.FormatBar = function(options, editorInstance) {
  this.instance = editorInstance;
  this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
  this.className = this.instance.options.baseCSSClass + "-" + this.options.baseCSSClass;
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
          'class': 'format-button ' + format.className,
          'text': format.title,
          'data-type': formatName,
          'data-cmd': format.cmd,
          click: this.onFormatButtonClick
        }).appendTo(this.$el);
      }
    }
    
    if(this.$el.find('button').length === 0) this.$el.addClass('hidden');
    
    this.$el.hide();
    this.$el.bind('mouseout', halt);
    this.$el.bind('mouseover', halt);
    
    this.instance.$wrapper.bind('click', this.onWrapperClick);
  },
  
  /* Convienience methods */
  show: function(relativeEl){
    this.$el.css({
      top: relativeEl.position().top
    });
    this.$el.show();
    this.$el.addClass('sir-trevor-item-ready'); 
  },
  
  onWrapperClick: function(ev){
    var item = $(ev.target),
        parent = item.parent();
        
    if(!(item.hasClass(this.className) || parent.hasClass(this.className) || item.hasClass('text-block') || parent.hasClass('text-block'))) {
      this.hide();
    }
  },

  hide: function(){ 
    this.$el.hide();
    this.$el.removeClass('sir-trevor-item-ready'); 
  },
  
  remove: function(){ this.$el.remove(); },
  
  onFormatButtonClick: function(ev){
    halt(ev);
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
    this.$el.addClass('sir-trevor-item-ready'); 
  }
  
});