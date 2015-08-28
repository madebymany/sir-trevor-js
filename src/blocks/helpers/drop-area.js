"use strict";

/**
 * Drop Area
 * --
 * Used to drop files
 */

var _ = require('../../lodash');
var config = require('../../config');
var Dom = require('../../packages/dom');

var dropEvents = require('../../helpers/drop-events');

var valid_drop_file_types = ['File', 'Files', 'text/plain', 'text/uri-list'];

var DropArea = function(parent, options) {
  this.parent = parent;
  this.options = options;

  this.initialize.apply(this, arguments);
};

Object.assign(DropArea.prototype, {

  initialize: function() {
    this.drop_options = Object.assign({}, config.defaults.Block.drop_options, this.options.drop_options);
    
    this.el = Dom.createElement('div', {
      html: _.template(this.drop_options.html, { block: parent, _: _ })
    });

    // Bind our drop event
    dropEvents
      .dropArea(this.el)
      .addEventListener('drop', this.handleDrop.bind(this));
  },

  handleDrop: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var el = e.target,
        types = e.dataTransfer.types;

    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */

    if (types &&
        types.some(function(type) {
                     return valid_drop_file_types.includes(type);
                   }, this)) {
    }

    this.parent.onDrop(e.dataTransfer);
  }

});

module.exports = DropArea;
