"use strict";

/*
 * SirTrevor Block Positioner
 * --
 * Gives an interface for positioning blocks.
 */

const BLOCK_POSITIONER_TEMPLATE  = require('./templates/block-positioner');

const Dom = require("./packages/dom");

var visibleClass = 'active';
var totalBlocks = 0;

function render() {
  return Dom.createElement('div', {
    class: 'st-block-positioner',
    html: BLOCK_POSITIONER_TEMPLATE
  });
}

function renderPositionList() {
  var inner = "<option value='0'>" + i18n.t("general:position") + "</option>";
  for(var i = 1; i <= totalBlocks; i++) {
    inner += "<option value="+i+">"+i+"</option>";
  }
  return inner;
}

function onBlockCountChange(newCount) {
  totalBlocks = newCount;
}

module.exports.create = function(block, mediator) {
  var visible = false;

  /**
   * Element to be used by blocks.
   * @public
   */
  var el = render();

  var select = el.querySelector('.st-block-positioner__select');
  select.addEventListener('change', onSelectChange);

  /**
   * Trigger changePosition event and close positioner toggle
   * @private
   */
  function onSelectChange() {
    var val = select.value;
    if (val !== 0) {
      mediator.trigger(
        "block:changePosition", block, val,
        (val === 1 ? 'before' : 'after'));
      hide();
    }
  }

  /**
   * Toggle visibility
   * @public
   */
  function toggle() {
    visible ? hide() : show();
  }

  /**
   * Render and show positioner element
   * @private
   */
  function show() {
    select.innerHTML = renderPositionList();
    el.classList.add(visibleClass);
    visible = true;
  }

  /**
   * Hide and clear postioner element
   * @private
   */
  function hide() {
    el.classList.remove(visibleClass);
    select.innerHTML = '';
    visible = false;
  }

  mediator.on("block:countUpdate", onBlockCountChange);

  return {toggle, el};
};
