"use strict";

const Dom = require("./packages/dom");

module.exports.create = function() {
  /**
   * Element to be used by blocks.
   * @public
   */
  var el = Dom.createElement('a', {
    'class': 'st-block-ui-btn__delete',
    'html': 'delete',
    'data-icon': 'close'
  });

  return {el};
};