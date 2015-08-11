"use strict";

/*
   SirTrevor Floating Block Controls
   --
   Draws the 'plus' between blocks
   */

var _ = require('./lodash');
var Events = require('./packages/events');
var dropEvents = require('./helpers/drop-events');

var EventBus = require('./event-bus');

var FloatingBlockControls = function(wrapper, instance_id, mediator) {
  this.wrapper = wrapper;
  this.instance_id = instance_id;
  this.mediator = mediator;

  this._ensureElement();
  this._bindFunctions();

  this.initialize();
};

Object.assign(FloatingBlockControls.prototype, require('./function-bind'), require('./renderable'), require('./events'), {

  className: "st-block-controls__top",

  attributes: function() {
    return {
      'data-icon': 'add'
    };
  },

  bound: ['handleBlockMouseOut', 'handleBlockMouseOver', 'handleBlockClick', 'onDrop'],

  initialize: function() {
    this.el.addEventListener('click', this.handleBlockClick);
    dropEvents.dropArea(this.el).addEventListener('drop', this.onDrop);

    Events.delegate(this.wrapper, '.st-block', 'mouseover', this.handleBlockMouseOver);
    Events.delegate(this.wrapper, '.st-block', 'mouseout', this.handleBlockMouseOut);
    Events.delegate(this.wrapper, '.st-block--with-plus', 'click', this.handleBlockClick);
  },

  onDrop: function(ev) {
    ev.preventDefault();

    var dropped_on = this.el,
    item_id = ev.dataTransfer.getData("text/plain"),
    block = document.querySelector('#' + item_id);

    if (!_.isUndefined(item_id) &&
        !_.isEmpty(block) &&
          dropped_on.getAttribute('id') !== item_id &&
            this.instance_id === block.getAttribute('data-instance')
       ) {
         dropped_on.insertAdjacentElement('afterend', block);
       }

       EventBus.trigger("block:reorder:dropped", item_id);
  },

  handleBlockMouseOver: function(e) {
    var block = e.currentTarget;

    block.classList.add('st-block--with-plus');
  },

  handleBlockMouseOut: function(e) {
    var block = e.currentTarget;

    block.classList.remove('st-block--with-plus');
  },

  handleBlockClick: function(e, currentTarget) {
    e.stopPropagation();

    this.mediator.trigger('block-controls:render', e.currentTarget);
  }

});

module.exports = FloatingBlockControls;
