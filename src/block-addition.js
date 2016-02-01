"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

const dropEvents = require('./helpers/drop-events');

const EventBus = require('./event-bus');

const Dom = require('./packages/dom');
const Events = require("./packages/events");

const TOP_CONTROLS_TEMPLATE = require("./templates/top-controls");

module.exports.create = function(SirTrevor) {

  function createBlock(e) {
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      "block:create", 'Text', null, this.parentNode.parentNode.id ? this.parentNode.parentNode : this.parentNode
    );
  }

  function hide() {}

  // Public
  function destroy() {
    SirTrevor = null;
  }

  SirTrevor.wrapper.insertAdjacentHTML("beforeend", TOP_CONTROLS_TEMPLATE());

  const topControls = SirTrevor.wrapper.querySelector('.st-top-controls');

  function onDrop(ev) {
    ev.preventDefault();

    var dropped_on = topControls,
      item_id = ev.dataTransfer.getData("text/plain"),
      block = document.querySelector('#' + item_id);

    if (!!item_id, !!block, dropped_on.id !== item_id) {
      Dom.insertAfter(block, dropped_on);
    }
    SirTrevor.mediator.trigger("block:rerender", item_id);
    EventBus.trigger("block:reorder:dropped", item_id);
  }

  dropEvents.dropArea(topControls);
  topControls.addEventListener('drop', onDrop);

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition", "click", createBlock
  );

  return {destroy, hide};
};
