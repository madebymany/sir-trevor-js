"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

const Events = require("./packages/events");

module.exports.create = function(SirTrevor) {

  function createBlock(e) {
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      "block:create", 'Text', null, this.parentNode.parentNode.previousSibling
    );
  }

  function hide() {}

  // Public
  function destroy() {
    SirTrevor = null;
  }

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition-top__button", "click", createBlock
  );

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition-top__icon", "click", createBlock
  );

  return {destroy, hide};
};
