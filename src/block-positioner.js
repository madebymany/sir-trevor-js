"use strict";

var BlockPositioner = function(block, mediator) {
  this.mediator = mediator;
  this.block = block;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(BlockPositioner.prototype, require('./function-bind'), require('./renderable'), {

  bound: ['toggle', 'show', 'hide'],

  className: 'st-block-positioner',
  visibleClass: 'active',

  initialize: function(){},

  toggle: function() {
    this.mediator.trigger('block-positioner-select:render', this);
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
