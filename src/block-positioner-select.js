"use strict";

var Dom = require('./packages/dom');

var template = [
  "<span class='st-block-positioner__selected-value'></span>",
  "<select class='st-block-positioner__select'></select>"
].join("\n");

var BlockPositionerSelect = function(mediator) {
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockPositionerSelect.prototype, require('./function-bind'), require('./renderable'), {

  total_blocks: 0,

  bound: ['onBlockCountChange', 'onSelectChange'],

  className: 'st-block-positioner__inner',

  initialize: function(){
    this.el.insertAdjacentHTML("beforeend", template);
    this.select = this.el.querySelector('.st-block-positioner__select');
    this.positioner = null;

    this.select.addEventListener('change', this.onSelectChange);
  },

  onBlockCountChange: function(new_count) {
    if (new_count !== this.total_blocks) {
      this.total_blocks = new_count;
      this.renderPositionList();
    }
  },

  onSelectChange: function() {
    var val = this.select.value;
    if (val !== 0) {
      this.mediator.trigger(
        "block:changePosition", this.positioner.block, val,
        (val === 1 ? 'before' : 'after'));
      this.positioner.toggle();
    }
  },

  renderPositionList: function() {
    var inner = "<option value='0'>" + i18n.t("general:position") + "</option>";
    for(var i = 1; i <= this.total_blocks; i++) {
      inner += "<option value="+i+">"+i+"</option>";
    }
    this.select.innerHTML = inner;
  },

  renderInBlock: function(positioner) {
    // hide old
    if (this.positioner && this.positioner !== positioner) {
      this.positioner.hide();
    }

    // add new
    this.positioner = positioner;
    this.select.value = 0;
    Dom.remove(this.el);
    positioner.el.appendChild(this.el);
  }

});

module.exports = BlockPositionerSelect;
