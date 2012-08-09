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

_.extend(FormatBar.prototype, Events, {
  
  bound: ["onFormatButtonClick"],
  
  render: function(){
    
    var bar = $("<div>", {
      "class": this.className
    });
    
    this.instance.$wrapper.before(bar);
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
    
  },
  show: function(){},
  hide: function(){},
  
  onFormatButtonClick: function(ev){
    halt(ev);
    var btn = $(ev.target),
        format = SirTrevor.Formatters[btn.attr('data-type')];
    document.execCommand(btn.attr('data-cmd'), false, format.param);
  }
  
});