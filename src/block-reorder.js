"use strict";

var dropEvents = require('./helpers/drop-events');

var EventBus = require('./event-bus');
var Dom = require('./packages/dom');

var config = require('./config');

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

  className: 'st-block-ui-btn__reorder',
  tagName: 'a',

  attributes: function() {
    return {
      'html': `<svg role="img" class="st-icon">
                 <use xlink:href="${config.defaults.iconUrl}#move"/>
               </svg>`,
      'draggable': 'true',
      'data-icon': 'move'
    };
  },

  initialize: function() {
    this.el.addEventListener('mousedown', this.onMouseDown);
    this.el.addEventListener('dragstart', this.onDragStart);
    this.el.addEventListener('dragend', this.onDragEnd);

    dropEvents.dropArea(this.block);
    this.block.addEventListener('drop', this.onDrop);
  },

  blockId: function() {
    return this.block.getAttribute('id');
  },

  onMouseDown: function() {
    EventBus.trigger("block:reorder:down");
  },

  onDrop: function(ev) {
    ev.preventDefault();

    var dropped_on = this.block,
    item_id = ev.dataTransfer.getData("text/plain"),
      block = document.querySelector('#' + item_id);

    if (!!item_id, !!block, dropped_on.id !== item_id) {
      Dom.insertAfter(block, dropped_on);
    }
    this.mediator.trigger("block:rerender", item_id);
    EventBus.trigger("block:reorder:dropped", item_id);
  },

  onDragStart: function onDragStart(ev) {
    var block = this.block;

    // Without this blocks are not commited to their new position
    ev.dataTransfer.setData("text/plain", this.blockId());

    this.mediator.trigger("block-controls:hide");
    EventBus.trigger("block:reorder:dragstart");
  },

  onDragEnd: function(ev) {
    EventBus.trigger("block:reorder:dragend");
  },

  render: function() {
    return this;
  }
});

module.exports = BlockReorder;
