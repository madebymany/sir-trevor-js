"use strict";

var _ = require('../lodash');
var config = require('../config');
var utils = require('../utils');

module.exports = {

  mixinName: "Pastable",
  requireInputs: true,

  initializePastable: function() {
    utils.log("Adding pastable to block " + this.blockID);

    this.paste_options = Object.assign(
      {}, config.defaults.Block.paste_options, this.paste_options);

    this.inputs.insertAdjacentHTML("beforeend", _.template(this.paste_options.html, this));

    Array.prototype.forEach.call(this.$('.st-paste-block'), (el) => {
      el.addEventListener('click', function() { 
        var event = document.createEvent('HTMLEvents');
        event.initEvent('select', true, false);
        this.dispatchEvent(event);
      });
      el.addEventListener('paste', this._handleContentPaste);
      el.addEventListener('submit', this._handleContentPaste);
    });
  }

};
