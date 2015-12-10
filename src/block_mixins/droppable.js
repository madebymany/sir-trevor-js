"use strict";

/* Adds drop functionaltiy to this block */

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');
var Dom = require('../packages/dom');

var dropEvents = require('../helpers/drop-events');

var EventBus = require('../event-bus');

module.exports = {

  mixinName: "Droppable",
  valid_drop_file_types: ['File', 'Files', 'text/plain', 'text/uri-list'],
  requireInputs: true,

  initializeDroppable: function() {
    utils.log("Adding droppable to block " + this.blockID);

    this.drop_options = Object.assign({}, config.defaults.Block.drop_options, this.drop_options);

    Dom.hide(this.editor);

    this.inputs.insertAdjacentHTML("beforeend", _.template(this.drop_options.html,
                                                    { block: this, _: _, config: config }));

    // Bind our drop event
    dropEvents
      .dropArea(this.inputs.lastElementChild)
      .addEventListener('drop', this._handleDrop.bind(this));

    this.inner.classList.add('st-block__inner--droppable');
  },

  _handleDrop: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var el = e.target,
        types = [].slice.call(e.dataTransfer.types);

    el.classList.remove('st-dropzone--dragover');

    /*
      Check the type we just received,
      delegate it away to our blockTypes to process
    */

    if (types &&
        types.some(function(type) {
                     return this.valid_drop_file_types.includes(type);
                   }, this)) {
      this.onDrop(e.dataTransfer);
    }

    EventBus.trigger('block:content:dropped', this.blockID);
  }

};
