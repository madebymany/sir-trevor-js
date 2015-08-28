"use strict";

/* Adds drop functionaltiy to this block */

var utils = require('../utils');
var DropArea = require('../blocks/helpers/drop-area');

module.exports = {

  mixinName: "Droppable",
  requireInputs: true,

  initializeDroppable: function() {
    utils.log("Adding droppable to block " + this.blockID);

    this.dropArea = new DropArea(this, {drop_options: this.drop_options});
    this.inputs.appendChild(this.dropArea.el);

    this.inner.classList.add('st-block__inner--droppable');
  }
};
