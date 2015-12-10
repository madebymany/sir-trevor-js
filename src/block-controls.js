"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

const Blocks = require("./blocks");
const Events = require("./packages/events");

const BLOCK_REPLACER_CONTROL_TEMPLATE  = require("./templates/block-control");

function generateBlocksHTML(Blocks, availableTypes) {
  return availableTypes.reduce((memo, type) => {
    if (Blocks.hasOwnProperty(type) && Blocks[type].prototype.toolbarEnabled) {
      return memo += BLOCK_REPLACER_CONTROL_TEMPLATE(Blocks[type].prototype);
    }
    return memo;
  }, "");
}

function render(Blocks, availableTypes) {
  var el = document.createElement('div');
  el.className = "st-block-controls__buttons";
  el.innerHTML = generateBlocksHTML.apply(null, arguments);

  var elButtons = document.createElement('div');
  elButtons.className = "st-block-controls";
  elButtons.appendChild(el);
  return elButtons;
}

module.exports.create = function(SirTrevor) {

  // REFACTOR - should probably not know about blockManager
  var el = render(Blocks, SirTrevor.blockManager.blockTypes);

  function replaceBlock(e) {
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      "block:replace", el.parentNode, this.dataset.type
    );
  }

  function insert(e) {
    e.stopPropagation(); // we don't want el to be removed by the window click
    /*jshint validthis:true */
    var parent = this.parentNode;
    if (!parent || hide() === parent) { return; }
    parent.appendChild(el);
    parent.classList.toggle("st-block--controls-active");
  }

  // Public
  function hide() {
    var parent = el.parentNode;
    if (!parent) { return; }
    parent.removeChild(el);
    parent.classList.remove("st-block--controls-active");
    return parent;
  }

  // Public
  function destroy() {
    SirTrevor = null;
    el = null;
  }

  Events.delegate(
    SirTrevor.wrapper, ".st-block-replacer", "click", insert
  );

  Events.delegate(
    SirTrevor.wrapper, ".st-block-controls__button", "click", replaceBlock
  );

  return {el, hide, destroy};
};
