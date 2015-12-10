"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

const Events = require("./packages/events");

const BLOCK_ADDITION_TEMPLATE = require("./templates/top-block-addition");

module.exports.create = function(SirTrevor) {

  function createBlock(e) {
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      "block:create", 'Text', null, this.parentNode.id ? this.parentNode : this
    );
  }

  function hide() {}

  // Public
  function destroy() {
    SirTrevor = null;
  }

  SirTrevor.wrapper.insertAdjacentHTML("beforeend", BLOCK_ADDITION_TEMPLATE());

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition", "click", createBlock
  );

  return {destroy, hide};
};
