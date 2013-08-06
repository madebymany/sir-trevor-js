/*
  Format Bar
  --
  Displayed on focus on a text area.
  Renders with all available options for the editor instance
*/

SirTrevor.FormatBar = (function(){

  var FormatBar = function(options) {
    this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
    this._ensureElement();
    this._bindFunctions();

    this.initialize.apply(this, arguments);
  };

  _.extend(FormatBar.prototype, FunctionBind, SirTrevor.Events, Renderable, {

    className: 'st-format-bar',

    bound: ["onFormatButtonClick", "renderBySelection", "hide"],

    initialize: function() {
      var formatName, format, btn;
      this.$btns = [];

      for (formatName in SirTrevor.Formatters) {
        if (SirTrevor.Formatters.hasOwnProperty(formatName)) {
          format = SirTrevor.Formatters[formatName];
          btn = $("<button>", {
                  'class': 'st-format-btn st-format-btn--' + formatName + ' ' + (format.iconName ? 'st-icon' : ''),
                  'text': format.text,
                  'data-type': formatName,
                  'data-cmd': format.cmd
                });

          this.$btns.push(btn);
          btn.appendTo(this.$el);
        }
      }

      this.$b = $(document.body);
      this.$el.bind('click', '.st-format-btn', this.onFormatButtonClick);
    },

    hide: function() {
      this.$el.removeClass('st-format-bar--is-ready');
    },

    show: function() {
      this.$el.addClass('st-format-bar--is-ready');
    },

    remove: function(){ this.$el.remove(); },

    renderBySelection: function(rectangles) {
      var coords = {},
          width = this.$el.width();

      if (rectangles.length == 1) {

        coords = {
          left: rectangles[0].left + ((rectangles[0].width - width) / 2),
          top: rectangles[0].top + this.$b.scrollTop()
        };
      } else {
        // Calculate the mid position
        var max_width = _.max(rectangles, function(rect){ return rect.width; });
        coords = {
          left: max_width.width / 2,
          top: rectangles[0].top + this.$b.scrollTop()
        };
      }

      this.highlightSelectedButtons();

      this.show();
      this.$el.css(coords);
    },

    highlightSelectedButtons: function() {
      var formatter;
      _.each(this.$btns, function($btn) {
        formatter = SirTrevor.Formatters[$btn.attr('data-type')];
        $btn.toggleClass("st-format-btn--is-active",
                         formatter.isActive());
      }, this);
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

      this.highlightSelectedButtons();
      return false;
    }

  });

  return FormatBar;

})();