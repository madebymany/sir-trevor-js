"use strict";

var _ = require('./lodash');
var dropEvents = require('./helpers/drop-events');

var EventBus = require('./event-bus');

var BlockReorder = function(block_element, mediator) {
  this.block = block_element;
  this.blockID = this.block.getAttribute('id');
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockReorder.prototype, require('./function-bind'), require('./renderable'), {

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
    this.el.addEventListener('mousedown touchstart', this.onMouseDown);
    this.el.addEventListener('dragstart', this.onDragStart);
    this.el.addEventListener('dragend touchend', this.onDragEnd);

    dropEvents.dropArea(this.block);
    this.block.addEventListener('drop', this.onDrop);
  },

  blockId: function() {
    return this.block.getAttribute('id');
  },

  onMouseDown: function() {
    this.mediator.trigger("block-controls:hide");
    EventBus.trigger("block:reorder:down");
  },

  onDrop: function(ev) {
    ev.preventDefault();

    var dropped_on = this.block,
    item_id = ev.dataTransfer.getData("text/plain"),
    block = document.querySelector('#' + item_id);

    if (!_.isUndefined(item_id) && !_.isEmpty(block) &&
        dropped_on.getAttribute('id') !== item_id &&
          dropped_on.getAttribute('data-instance') === block.getAttribute('data-instance')
       ) {
       dropped_on.insertAdjacentElement('afterend', block);
     }
     this.mediator.trigger("block:rerender", item_id);
     EventBus.trigger("block:reorder:dropped", item_id);
  },

  onDragStart: function(ev) {
    var btn = ev.currentTarget.parentNode;
    ev.dataTransfer.setDragImage(this.block, btn.offsetLeft, btn.offsetTop);
    ev.dataTransfer.setData('Text', this.blockId());

    EventBus.trigger("block:reorder:dragstart");
    this.block.classList.add('st-block--dragging');
  },

  onDragEnd: function(ev) {
    EventBus.trigger("block:reorder:dragend");
    this.block.classList.remove('st-block--dragging');
  },

  render: function() {
    return this;
  }

});

module.exports = BlockReorder;
