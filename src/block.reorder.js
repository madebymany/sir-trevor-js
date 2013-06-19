var BlockReorder = SirTrevor.BlockReorder = function(block_element) {
  this.$block = block_element;

  this._ensureElement();
  this._bindFunctions();
  this.initialize();

};

_.extend(BlockReorder.prototype, FunctionBind, Renderable, {

  bound: ['onDragStart', 'onDragEnd', 'onDrag', 'onDrop'],

  className: 'st-block__reorder st-icon',
  tagName: 'a',

  attributes: function() {
    return {
      'html': 'reorder',
      'draggable': 'true',
      'data-icon': 'move'
    };
  },

  initialize: function() {
    this.$el.bind('dragstart', this.onDragStart)
            .bind('dragend touchend', this.onDragEnd)
            .bind('drag touchmove', this.onDrag);

    this.$block.dropArea()
               .bind('drop', this.onDrop);
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

    var item = $(ev.target),
        block = item.parents('.st-block');

    ev.originalEvent.dataTransfer.setDragImage(block[0], 0, 0);
    ev.originalEvent.dataTransfer.setData('Text', block.attr('id'));

    SirTrevor.EventBus.trigger("block:reorder:dragstart");
    block.addClass('st-block--dragging');
  },

  onDragEnd: function(ev) {
    var item = $(ev.target),
        block = item.parents('.st-block');

    SirTrevor.EventBus.trigger("block:reorder:dragend");
    block.removeClass('st-block--dragging');
  },

  onDrag: function(ev){},

  render: function() {
    return this;
  }

});