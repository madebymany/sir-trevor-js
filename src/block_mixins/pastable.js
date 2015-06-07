"use strict";

var $ = require('jquery');
var config = require('../config');
var utils = require('../utils');

module.exports = {

  mixinName: "Pastable",
  requireInputs: true,

  initializePastable: function() {
    utils.log("Adding pastable to block " + this.blockID);

    this.paste_options = Object.assign(
      {}, config.defaults.Block.paste_options, this.paste_options);
    this.$inputs.append(this.paste_options.html(this));

    this.$('.st-paste-block')
      .bind('click', function(){ $(this).select(); })
      .bind('paste', this._handleContentPaste)
      .bind('submit', this._handleContentPaste);
  }

};
