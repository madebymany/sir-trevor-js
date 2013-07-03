SirTrevor.BlockReorder = (function(){

  var BlockReorder = function(block_element) {
    this.$block = block_element;

    this._ensureElement();
    this._bindFunctions();

    this.initialize();
  };

  _.extend(BlockReorder.prototype, FunctionBind, Renderable, {

    bound: ['onMouseDown', 'onClick', 'onDragStart', 'onDragEnd', 'onDrag', 'onDrop'],

    className: 'st-block-ui-btn st-block-ui-btn--reorder st-icon',
    tagName: 'a',

    attributes: function() {
      return {
        'html': 'reorder',
        'draggable': 'true',
        'data-icon': 'move'
      };
    },

    initialize: function() {
      this.$el.bind('mousedown touchstart', this.onMouseDown)
              .bind('click', this.onClick)
              .bind('dragstart', this.onDragStart)
              .bind('dragend touchend', this.onDragEnd)
              .bind('drag touchmove', this.onDrag);

      this.$block.dropArea()
                 .bind('drop', this.onDrop);
    },

    onMouseDown: function() {
      SirTrevor.EventBus.trigger("block:reorder:down");
    },

    onDrop: function(ev) {
      ev.preventDefault();

      var dropped_on = this.$block,
          item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
          block = $('#' + item_id);

      if (!_.isUndefined(item_id) &&
        !_.isEmpty(block) &&
        dropped_on.attr('id') != item_id &&
        dropped_on.attr('data-instance') == block.attr('data-instance')
      ) {
        dropped_on.after(block);
      }
      SirTrevor.EventBus.trigger("block:reorder:dropped", item_id);
    },

    onDragStart: function(ev) {
      var btn = $(ev.currentTarget).parent();

      ev.originalEvent.dataTransfer.setDragImage(this.$block[0], btn.position().left, btn.position().top);
      ev.originalEvent.dataTransfer.setData('Text', this.$block.attr('id'));

      SirTrevor.EventBus.trigger("block:reorder:dragstart");
      this.$block.addClass('st-block--dragging');
    },

    onDragEnd: function(ev) {
      SirTrevor.EventBus.trigger("block:reorder:dragend");
      this.$block.removeClass('st-block--dragging');
    },

    onDrag: function(ev){},

    onClick: function() {
    },

    render: function() {
      return this;
    }

  });

  return BlockReorder;

})();