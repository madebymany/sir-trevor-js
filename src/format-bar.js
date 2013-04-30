/*
  Format Bar
  --
  Displayed on focus on a text area.
  Renders with all available options for the editor instance
*/

var FormatBar = SirTrevor.FormatBar = function(options) {
  this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
  this._ensureElement();
  this._bindFunctions();

  this.initialize.apply(this, arguments);
};

_.extend(FormatBar.prototype, FunctionBind, Events, Renderable, {

  className: 'st-format-bar',

  bound: ["onFormatButtonClick"],

  initialize: function() {
    var formatName, format;

    for (formatName in SirTrevor.Formatters) {
      if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
        format = SirTrevor.Formatters[formatName];
        $("<button>", {
          'class': 'st-format-btn st-icon st-format-btn--' + formatName,
          'text': format.title,
          'data-type': formatName,
          'data-cmd': format.cmd
        }).appendTo(this.$el);
      }
    }

    this.width = this.$el.width();
    this.$el.bind('click', '.st-format-btn', this.onFormatButtonClick);
  },

  hide: function() {
    this.$el.removeClass('st-format-bar--is-ready');
  },

  show: function() {
    this.$el.addClass('st-format-bar--is-ready');
  },

  remove: function(){ this.$el.remove(); },

  render_by_selection: function(rectangles) {
    var coords = {},
        width = this.$el.width();

    if (rectangles.length == 1) {
      coords = {
        left: rectangles[0].left + ((rectangles[0].width - width) / 2),
        top: rectangles[0].top
      };
    } else {
      // Calculate the mid position
      var max_width = _.max(rectangles, function(rect){ return rect.width; });
      coords = {
        left: max_width.width / 2,
        top: rectangles[0].top
      };
    }

    this.show();
    this.$el.css(coords);
  },

  onFormatButtonClick: function(ev){
    ev.stopPropagation();

    var btn = $(ev.target),
        format = SirTrevor.Formatters[btn.attr('data-type')];

    // Do we have a click function defined on this formatter?
    if(!_.isUndefined(format.onClick) && _.isFunction(format.onClick)) {
      format.onClick(); // Delegate
    } else {
      // Call default
      document.execCommand(btn.attr('data-cmd'), false, format.param);
    }

    return false;
  }

});