"use strict";

var utils = require('../utils');
var config = require('../config');
var Dom = require('../packages/dom');
var Events = require('../packages/events');

module.exports = {

  mixinName: "Controllable",

  initializeControllable: function() {
    utils.log("Adding controllable to block " + this.blockID);
    this.control_ui = Dom.createElement('div', {'class': 'st-block__control-ui'});
    Object.keys(this.controls).forEach(
      function(cmd) {
        // Bind configured handler to current block context
        this.addUiControl(cmd, this.controls[cmd].bind(this));
      },
      this
    );
    this.inner.appendChild(this.control_ui);
  },

  getControlTemplate: function(cmd) {
    return Dom.createElement("a", {
      'data-icon': cmd,
      'class': 'st-icon st-block-control-ui-btn st-block-control-ui-btn--' + cmd,
      'html': `<svg role="img" class="st-icon">
                  <use xlink:href="${config.defaults.iconUrl}#${cmd}"/>
                </svg>`
    });
  },

  addUiControl: function(cmd, handler) {
    this.control_ui.appendChild(this.getControlTemplate(cmd));
    Events.delegate(this.control_ui, '.st-block-control-ui-btn--' + cmd, 'click', handler);
  }
};
