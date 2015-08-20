"use strict";

/*
 * SirTrevor Block Controls
 * --
 * Gives an interface for adding new Sir Trevor blocks.
 */

const Blocks = require("./blocks");
const Events = require("./packages/events");

const BLOCK_CONTROL_TEMPLATE  = require("./templates/block-control");
const BLOCK_ADDITION_TEMPLATE = require("./templates/top-block-addition");

function generateBlocksHTML(Blocks, availableTypes) {
  return availableTypes.reduce((memo, type) => {
    if (Blocks.hasOwnProperty(type) && Blocks[type].prototype.toolbarEnabled) {
      return memo += BLOCK_CONTROL_TEMPLATE(Blocks[type].prototype);
    }
    return memo;
  }, "");
}

function render(Blocks, availableTypes) {
  var el = document.createElement('div');
  el.className = "st-block-controls";
  el.innerHTML = generateBlocksHTML.apply(null, arguments);
  return el;
}

module.exports.create = function(SirTrevor) {
  // REFACTOR - should probably not know about blockManager
  var el = render(Blocks, SirTrevor.blockManager.blockTypes);

  function createBlock(e) {
    // REFACTOR: mediator so that we can trigger events directly on instance?
    // REFACTOR: block create event expects data as second argument.
    /*jshint validthis:true */
    SirTrevor.mediator.trigger(
      "block:create", this.dataset.type, null, el.parentNode.id
    );
  }

  function insert(e) {
    e.stopPropagation(); // we don't want el to be removed by the window click
    /*jshint validthis:true */
    var parent = this.parentNode;
    if (!parent || hide() === parent) { return; }
    parent.appendChild(el);
    parent.classList.toggle("st-block--active");
  }

  // Public
  function hide() {
    var parent = el.parentNode;
    if (!parent) { return; }
    parent.removeChild(el);
    parent.classList.remove("st-block--active");
    return parent;
  }

  // Public
  function destroy() {
    SirTrevor.wrapper.removeEventListener("click", insert);
    SirTrevor = null;
    el = null;
  }

  // REFACTOR: reassess how mediator works
  SirTrevor.mediator.on('block-controls:hide', hide);

  SirTrevor.wrapper.insertAdjacentHTML("beforeend", BLOCK_ADDITION_TEMPLATE);

  Events.delegate(
    SirTrevor.wrapper, ".st-block-addition", "click", insert
  );

  Events.delegate(
    SirTrevor.wrapper, ".st-block-controls__button", "click", createBlock
  );

  return {el, hide, destroy};
};
