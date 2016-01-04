"use strict";

var EventBus = require('./event-bus');

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

  bound: ['onMouseDown', 'onDragStart', 'onDragEnd'],

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
  },

  blockId: function() {
    return this.block.getAttribute('id');
  },

  onMouseDown: function() {
    EventBus.trigger("block:reorder:down");
  },

  onDragStart: function(ev) {
    this.dragEl = this.block.cloneNode(true);
    this.dragEl.classList.add("st-drag-element");
    this.dragEl.style.top = `${this.block.offsetTop}px`;
    this.dragEl.style.left = `${this.block.offsetLeft}px`;

    this.block.parentNode.appendChild(this.dragEl);

    ev.dataTransfer.setDragImage(this.dragEl, 0, 0);
    ev.dataTransfer.setData("text/plain", this.blockId());
    this.mediator.trigger("block-controls:hide");
    this.mediator.trigger("block-reorder:dragstart", this.blockId());

    EventBus.trigger("block:reorder:dragstart");
    this.block.classList.add('st-block--dragging');
  },

  onDragEnd: function(ev) {
    this.mediator.trigger("block-reorder:dragend", this.blockId());
    EventBus.trigger("block:reorder:dragend");
    this.block.classList.remove('st-block--dragging');
    this.dragEl.parentNode.removeChild(this.dragEl);
  },

  render: function() {
    return this;
  }
});

module.exports = BlockReorder;
