"use strict";

var _ = require('./lodash');
var Scribe = require('scribe-editor');
var config = require('./config');

var scribePluginFormatterPlainTextConvertNewLinesToHTML = require('scribe-plugin-formatter-plain-text-convert-new-lines-to-html');
var scribePluginLinkPromptCommand = require('scribe-plugin-link-prompt-command');
var scribePluginSanitizer = require('scribe-plugin-sanitizer');

var sanitizeDefaults = {
  p: true,
  a: {
    href: true,
    target: '_blank',
    rel: true
  },
  i: true,
  b: true,
  strong: true,
  em: true
};

module.exports = {

  initScribeInstance: function(el, scribeOptions, configureScribe) {

    scribeOptions = scribeOptions || {};

    var scribeConfig = {debug: config.scribeDebug};
    var tags = sanitizeDefaults;

    if (_.isObject(scribeOptions)) {
      scribeConfig = Object.assign(scribeConfig, scribeOptions);
    }

    var scribe = new Scribe(el, scribeConfig);

    if (scribeOptions.hasOwnProperty("tags")) {
      tags = Object.assign(sanitizeDefaults, scribeOptions.tags);
    }

    scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHTML());
    scribe.use(scribePluginLinkPromptCommand());
    scribe.use(scribePluginSanitizer({tags: tags}));

    if (_.isFunction(configureScribe)) {
      configureScribe.call(this, scribe);
    }

    return scribe;
  },

  execTextBlockCommand: function(scribeInstance, cmdName) {
    if (_.isUndefined(scribeInstance)) {
      throw "No Scribe instance found to query command";
    }

    var cmd = scribeInstance.getCommand(cmdName);
    scribeInstance.el.focus();
    return cmd.execute();
  },

  queryTextBlockCommandState: function(scribeInstance, cmdName) {
    if (_.isUndefined(scribeInstance)) {
      throw "No Scribe instance found to query command";
    }

    var cmd = scribeInstance.getCommand(cmdName),
        sel = new scribeInstance.api.Selection();
    return sel.range && cmd.queryState();
  },
};
