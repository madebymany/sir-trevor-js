"use strict";

var BlockDeletion = function() {
  this._ensureElement();
  this._bindFunctions();
};

Object.assign(BlockDeletion.prototype, require('./function-bind'), require('./renderable'), {

  tagName: 'a',
  className: 'st-block-ui-btn__delete',

  attributes: {
    html: 'delete',
    'data-icon': 'close'
  }

});

module.exports = BlockDeletion;
