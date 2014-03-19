/*
  SirTrevor Floating Block Controls
  --
  Draws the 'plus' between blocks
*/

SirTrevor.FloatingBlockControls = (function(){

  var FloatingBlockControls = function(wrapper, instance_id) {
    this.$wrapper = wrapper;
    this.instance_id = instance_id;

    this._ensureElement();
    this._bindFunctions();

    this.initialize();
  };

  _.extend(FloatingBlockControls.prototype, FunctionBind, Renderable, SirTrevor.Events, {

    className: "st-block-controls__top",

    attributes: function() {
      return {
        'data-icon': 'add'
      };
    },

    bound: ['handleBlockMouseOut', 'handleBlockMouseOver', 'handleBlockClick', 'onDrop'],

    initialize: function() {
      this.$el.on('click', this.handleBlockClick)
              .dropArea()
              .bind('drop', this.onDrop);

      this.$wrapper.on('mouseover', '.st-block', this.handleBlockMouseOver)
                   .on('mouseout', '.st-block', this.handleBlockMouseOut)
                   .on('click', '.st-block--with-plus', this.handleBlockClick);
    },

    onDrop: function(ev) {
      ev.preventDefault();
      ev.stopPropagation(); // to prevent event handling on outer blocks

      var dropped_on = this.$el,
          item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
          block = $('#' + item_id);

      if (!_.isUndefined(item_id) &&
        !_.isEmpty(block) &&
        dropped_on.attr('id') != item_id &&
        this.instance_id == block.attr('data-instance')
      ) {
        dropped_on.after(block);
      }

      SirTrevor.EventBus.trigger("block:reorder:dropped", item_id);
    },

    handleBlockMouseOver: function(e) {
      var block = $(e.currentTarget);

      if (!block.hasClass('st-block--with-plus')) {
        block.addClass('st-block--with-plus');
      }
    },

    handleBlockMouseOut: function(e) {
      var block = $(e.currentTarget);

      if (block.hasClass('st-block--with-plus')) {
        block.removeClass('st-block--with-plus');
      }
    },

    handleBlockClick: function(e) {
      e.stopPropagation();

      var block = $(e.currentTarget);
      this.trigger('showBlockControls', block);
    }

  });

  return FloatingBlockControls;

})();