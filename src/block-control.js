"use strict";

var _ = require('./lodash');
var Blocks = require('./blocks');

var BlockControl = function(type) {
  this.type = type;
  this.block_type = Blocks[this.type].prototype;
  this.can_be_rendered = this.block_type.toolbarEnabled;

  this._ensureElement();
};

Object.assign(BlockControl.prototype, require('./function-bind'), require('./renderable'), require('./events'), {

  tagName: 'a',
  className: "st-block-control",

  attributes: function() {
    return {
      'data-type': this.block_type.type
    };
  },

  render: function() {
    this.$el.html('<span class="st-icon">'+ _.result(this.block_type, 'icon_name') +'</span>' + _.result(this.block_type, 'title'));
    return this;
  }
});

module.exports = BlockControl;
