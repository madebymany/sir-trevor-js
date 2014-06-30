SirTrevor.BlockReorder = (function(){

  var BlockReorder = function(block_element, mediator) {
    this.$block = block_element;
    this.mediator = mediator;
    this.blockID = this.$block.attr('id');

    this._ensureElement();
    this._bindFunctions();

    this.initialize();
  };

  _.extend(BlockReorder.prototype, FunctionBind, Renderable, {

    bound: ['onMouseDown', 'onDragStart', 'onDragEnd', 'onDrop'],

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
              .bind('dragstart', this.onDragStart)
              .bind('dragend touchend', this.onDragEnd);

      this.$block.dropArea()
                 .bind('drop', this.onDrop);
    },

    onMouseDown: function() {
      this.mediator.trigger('block-controls:hide');
      SirTrevor.EventBus.trigger("block:reorder:down", this.blockID);
    },

    onDrop: function(ev) {
      ev.preventDefault();

      var dropped_on = this.$block,
          item_id = ev.originalEvent.dataTransfer.getData("text/plain"),
          block = $('#' + item_id);

      if (!_.isUndefined(item_id) && !_.isEmpty(block) &&
        dropped_on.attr('id') != item_id &&
        dropped_on.attr('data-instance') == block.attr('data-instance')
      ) {
        dropped_on.after(block);
      }

      this.mediator.trigger('block:rerender', item_id);
      SirTrevor.EventBus.trigger("block:reorder:dropped", item_id);
    },

    onDragStart: function(ev) {
      var btn = $(ev.currentTarget).parent();

      ev.originalEvent.dataTransfer.setDragImage(this.$block[0], btn.position().left, btn.position().top);
      ev.originalEvent.dataTransfer.setData('Text', this.blockID);

      SirTrevor.EventBus.trigger("block:reorder:dragstart", this.blockID);
      this.$block.addClass('st-block--dragging');
    },

    onDragEnd: function(ev) {
      SirTrevor.EventBus.trigger("block:reorder:dragend", this.blockID);
      this.$block.removeClass('st-block--dragging');
    },

    render: function() {
      return this;
    }

  });

  return BlockReorder;

})();
