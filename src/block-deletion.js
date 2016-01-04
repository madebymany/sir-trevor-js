"use strict";

var config = require('./config');

var BlockDeletion = function() {
  this._ensureElement();
  this._bindFunctions();
};

Object.assign(BlockDeletion.prototype, require('./function-bind'), require('./renderable'), {

  tagName: 'a',
  className: 'st-block-ui-btn__delete',

  attributes: {
    html: () => `<svg role="img" class="st-icon">
                   <use xlink:href="${config.defaults.iconUrl}#cross"/>
                 </svg>`,
    'data-icon': 'close'
  }

});

module.exports = BlockDeletion;
