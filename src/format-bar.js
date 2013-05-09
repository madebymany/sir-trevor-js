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
    
    var throttled_scroll = _.throttle(_.bind(this.handleDocumentScroll, this), 150);
    $(document).bind('scroll', throttled_scroll);

    if(this.$el.find('button').length === 0) this.$el.addClass('hidden');
    this.show();
  },

  handleDocumentScroll: function() {
    var instance_height = this.instance.$outer.height(),
        instance_offset = this.instance.$outer.offset().top,
        viewport_top = $(document).scrollTop();

    if (this.$el.hasClass('fixed')) {
      instance_offset = this.$el.offset().top;
    }

    if ((viewport_top > 5) && viewport_top >= instance_offset) {
      this.$el.addClass('fixed')
              .css({ 'width': this.instance.$wrapper.width() });

      this.instance.$wrapper.css({ 'padding-top': '104px' });
    } else {
      this.$el.removeClass('fixed').css({ 'width': '100%' });
      this.instance.$wrapper.css({ 'padding-top': '16px' });
    }
  },

  hide: function() {
    this.$el.removeClass(this.instance.baseCSS('item-ready'));
  },

  show: function() {
    this.$el.addClass(this.instance.baseCSS('item-ready'));
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
    this.show();
  }
  
});