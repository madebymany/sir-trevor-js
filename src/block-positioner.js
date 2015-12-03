"use strict";

var template = [
  "<div class='st-block-positioner__inner'>",
  "<span class='st-block-positioner__selected-value'></span>",
  "<select class='st-block-positioner__select'></select>",
  "</div>"
].join("\n");

var BlockPositioner = function(block, mediator) {
  this.mediator = mediator;
  this.block = block;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockPositioner.prototype, require('./function-bind'), require('./renderable'), {

  total_blocks: 0,

  bound: ['onBlockCountChange', 'onSelectChange', 'toggle', 'show', 'hide'],

  className: 'st-block-positioner',
  visibleClass: 'active',

  initialize: function(){
    this.el.insertAdjacentHTML("beforeend", template);
    this.select = this.$('.st-block-positioner__select')[0];

    this.select.addEventListener('change', this.onSelectChange);

    this.mediator.on("block:countUpdate", this.onBlockCountChange);
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
        "block:changePosition", this.block, val,
        (val === 1 ? 'before' : 'after'));
      this.toggle();
    }
  },

  renderPositionList: function() {
    var inner = "<option value='0'>" + i18n.t("general:position") + "</option>";
    for(var i = 1; i <= this.total_blocks; i++) {
      inner += "<option value="+i+">"+i+"</option>";
    }
    this.select.innerHTML = inner;
  },

  toggle: function() {
    this.select.value = 0;
    this.el.classList.toggle(this.visibleClass);
  },

  show: function(){
    this.el.classList.add(this.visibleClass);
  },

  hide: function(){
    this.el.classList.remove(this.visibleClass);
  }

});

module.exports = BlockPositioner;
