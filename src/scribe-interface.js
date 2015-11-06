"use strict";

var _ = require('./lodash');
var Scribe = require('scribe-editor');
var config = require('./config');


var scribePluginBlockquoteCommand = require('scribe-plugin-blockquote-command');
var scribePluginHeadingCommand = require('scribe-plugin-heading-command');
var scribePluginIntelligentUnlinkCommand = require('scribe-plugin-intelligent-unlink-command');
var scribePluginSmartLists = require('scribe-plugin-smart-lists');
var scribePluginKeyboardShortcuts = require('scribe-plugin-keyboard-shortcuts');

var scribePluginFormatterPlainTextConvertNewLinesToHTML = require('scribe-plugin-formatter-plain-text-convert-new-lines-to-html');
var scribePluginLinkPromptCommand = require('scribe-plugin-link-prompt-command');
var scribePluginSanitizer = require('scribe-plugin-sanitizer');

var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };

module.exports = {

  initScribeInstance: function(el, scribeOptions, textFormatting, configureScribe) {

    scribeOptions = scribeOptions || {};

    var scribeConfig = {debug: config.scribeDebug};

    if (_.isObject(scribeOptions)) {
      scribeConfig = Object.assign(scribeConfig, scribeOptions);
    }

    var scribeConfiguration = {
      sanitize: {
        p: {},
        br: {}
      },
      shortcuts: {},
      formatBarCommands: []
    };

    var scribe = new Scribe(el, scribeConfig);

    this.configureBold(scribe, textFormatting, scribeConfiguration);
    this.configureItalic(scribe, textFormatting, scribeConfiguration);
    this.configureUnderline(scribe, textFormatting, scribeConfiguration);
    this.configureStrikethrough(scribe, textFormatting, scribeConfiguration);
    this.configureLink(scribe, textFormatting, scribeConfiguration);
    this.configureH1(scribe, textFormatting, scribeConfiguration);
    this.configureH2(scribe, textFormatting, scribeConfiguration);
    this.configureList(scribe, textFormatting, scribeConfiguration);
    this.configureBlockquote(scribe, textFormatting, scribeConfiguration);

    var tags = scribeConfiguration.sanitize;
    if (scribeOptions.hasOwnProperty("tags")) {
      tags = Object.assign(tags, scribeOptions.tags);
    }

    if (_.isFunction(configureScribe)) {
      configureScribe.call(this, scribe, scribeConfiguration);
    }

    if (_.isFunction(textFormatting.configure)){
      textFormatting.configure.call(this, scribe, scribeConfiguration);
    }

    scribe.use(scribePluginKeyboardShortcuts(Object.freeze(scribeConfiguration.shortcuts)));
    scribe.use(scribePluginSanitizer({tags: tags}));
    scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHTML());

    return { scribe: scribe, formatBarCommands: scribeConfiguration.formatBarCommands };
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

  configureBold: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.bold) {
      scribeConfiguration.shortcuts.bold = function (event) {
        return ctrlKey(event) && event.keyCode === 66; // b
      };
      scribeConfiguration.sanitize.b = {};
      scribeConfiguration.sanitize.strong = {};
      scribeConfiguration.formatBarCommands.push({
        name: "Bold",
        title: "bold",
        cmd: "bold",
        text: "B"
      });
    }
  },

  configureItalic: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.italic) {
      scribeConfiguration.shortcuts.italic = function (event) {
        return ctrlKey(event) && event.keyCode === 73; // i
      };
      scribeConfiguration.sanitize.i = {};
      scribeConfiguration.sanitize.em = {};
      scribeConfiguration.formatBarCommands.push({
        name: "Italic",
        title: "italic",
        cmd: "italic",
        text: "i"
      });
    }
  },

  configureUnderline: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.underline) {
      scribeConfiguration.shortcuts.italic = function (event) {
        return ctrlKey(event) && event.keyCode === 85; // u
      };
      scribeConfiguration.sanitize.u = {};
      scribeConfiguration.formatBarCommands.push({
        name: "Underline",
        title: "underline",
        cmd: "underline",
        text: "U"
      });
    }
  },

  configureStrikethrough: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.strikethrough) {
      scribeConfiguration.shortcuts.strikeThrough = function (event) {
        return event.altKey && event.shiftKey && event.keyCode === 83; // s
      };
      scribeConfiguration.sanitize.strike = {};
      scribeConfiguration.formatBarCommands.push({
        name: "Strikethrough",
        title: "strikethrough",
        cmd: "strikeThrough",
        text: "S"
      });
    }
  },

  configureLink: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.link) {
      scribeConfiguration.shortcuts.linkPrompt = function (event) {
        return ctrlKey(event) && !event.shiftKey && event.keyCode === 75; // k
      };
      scribeConfiguration.shortcuts.unlink = function (event) {
        return ctrlKey(event) && event.shiftKey && event.keyCode === 75; // k
      };

      scribeConfiguration.sanitize.a = {
        href: true
      };
      if (_.isObject(textFormatting.link) && textFormatting.link.target) {
        scribeConfiguration.sanitize.a.target = textFormatting.link.target;
      }

      scribeConfiguration.formatBarCommands.push({
        name: "Link",
        title: "link",
        iconName: "link",
        cmd: "linkPrompt",
        text: "link"
      });
      scribeConfiguration.formatBarCommands.push({
        name: "Unlink",
        title: "unlink",
        iconName: "link",
        cmd: "unlink",
        text: "link"
      });

      scribe.use(scribePluginLinkPromptCommand());
      scribe.use(scribePluginIntelligentUnlinkCommand());
    }
  },

  configureH1: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.h1) {
      scribeConfiguration.shortcuts.h1 = function (event) {
        return ctrlKey(event) && event.keyCode === 49; // 1
      };
      scribeConfiguration.sanitize.h1 = {};
      scribeConfiguration.formatBarCommands.push({
        name: "Heading1",
        title: "h1",
        cmd: "h1",
        text: "H1"
      });
      scribe.use(scribePluginHeadingCommand(1));
    }
  },

  configureH2: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.h2) {
      scribeConfiguration.shortcuts.h2 = function (event) {
        return ctrlKey(event) && event.keyCode === 50; // 2
      };
      scribeConfiguration.sanitize.h2 = {};
      scribeConfiguration.formatBarCommands.push({
        name: "Heading2",
        title: "h2",
        cmd: "h2",
        text: "H2"
      });
      scribe.use(scribePluginHeadingCommand(2));
    }
  },

  configureList: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.list) {
      scribeConfiguration.shortcuts.insertOrderedList = function (event) {
        return event.altKey && event.shiftKey && event.keyCode === 78; // n
      };
      scribeConfiguration.shortcuts.insertUnorderedList = function (event) {
        return event.altKey && event.shiftKey && event.keyCode === 66; // b
      };
      scribeConfiguration.sanitize.ol = {};
      scribeConfiguration.sanitize.ul = {};
      scribeConfiguration.sanitize.li = {};
      scribeConfiguration.formatBarCommands.push({
        name: "OrderedList",
        title: "orderedlist",
        cmd: "insertOrderedList",
        text: "1."
      });
      scribeConfiguration.formatBarCommands.push({
        name: "UnorderedList",
        title: "unorderedlist",
        cmd: "insertUnorderedList",
        text: "・"
      });
      scribe.use(scribePluginSmartLists());
    }
  },

  configureBlockquote: function (scribe, textFormatting, scribeConfiguration) {
    if (textFormatting.blockquote) {
      scribeConfiguration.shortcuts.blockquote = function (event) {
        return event.altKey && event.shiftKey && event.keyCode === 87; // w
      };
      scribeConfiguration.sanitize.blockquote = {};
      scribeConfiguration.formatBarCommands.push({
        name: "Blockquote",
        title: "blockquote",
        cmd: "blockquote",
        text: "\""
      });
      scribe.use(scribePluginBlockquoteCommand());
    }
  }
};
