"use strict";

const dropEvents = require('./helpers/drop-events');

const EventBus = require('./event-bus');
const Dom = require('./packages/dom');

module.exports.create = function(block, mediator) {
  var dragEl;
  /**
   * Element to be used by blocks.
   * @public
   */
  var el = Dom.createElement('a', {
    'class': 'st-block-ui-btn__reorder',
    'html': 'reorder',
    'draggable': 'true',
    'data-icon': 'move'
  });

  el.addEventListener('mousedown', onMouseDown);
  el.addEventListener('dragstart', onDragStart);
  el.addEventListener('dragend', onDragEnd);

  dropEvents.dropArea(block);
  block.addEventListener('drop', onDrop);

  /**
   * Trigger onMouseDown event
   * @private
   */
  function onMouseDown() {
    EventBus.trigger("block:reorder:down");
  }

  /**
   * onDrop inert element in new position
   * @private
   */
  function onDrop(ev) {
    ev.preventDefault();

    var dropped_on = block,
    item_id = ev.dataTransfer.getData("text/plain"),
      dropped_block = document.querySelector('#' + item_id);

    if (!!item_id, !!dropped_block, dropped_on.id !== item_id) {
      Dom.insertAfter(dropped_block, dropped_on);
    }
    mediator.trigger("block:rerender", item_id);
    EventBus.trigger("block:reorder:dropped", item_id);
  }

  /**
   * onDragStart copy block data to event.
   * @private
   */
  function onDragStart(ev) {
    dragEl = block.cloneNode(true);
    dragEl.classList.add("st-drag-element");
    dragEl.style.top = `${block.offsetTop}px`;
    dragEl.style.left = `${block.offsetLeft}px`;

    block.parentNode.appendChild(dragEl);

    ev.dataTransfer.setDragImage(dragEl, 0, 0);
    ev.dataTransfer.setData('Text', block.getAttribute('id'));
    mediator.trigger("block-controls:hide");

    EventBus.trigger("block:reorder:dragstart");
    block.classList.add('st-block--dragging');
  }

  /**
   * onDragEnd remove old element.
   * @private
   */
  function onDragEnd(ev) {
    EventBus.trigger("block:reorder:dragend");
    block.classList.remove('st-block--dragging');
    dragEl.parentNode.removeChild(dragEl);
  }

  return {el};
};
