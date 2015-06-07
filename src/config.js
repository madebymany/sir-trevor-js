"use strict";

var dropTemplate   = require("./templates/drop.ejs");
var pasteTemplate  = require("./templates/paste.ejs");
var uploadTemplate = require("./templates/upload.ejs");

var drop_options = {
  html: dropTemplate,
  re_render_on_reorder: false
};

var paste_options = {
  html: pasteTemplate
};

var upload_options = {
  html: uploadTemplate
};

module.exports = {
  debug: false,
  scribeDebug: false,
  skipValidation: false,
  version: "0.4.0",
  language: "en",

  instances: [],

  defaults: {
    defaultType: false,
    spinner: {
      className: 'st-spinner',
      lines: 9,
      length: 8,
      width: 3,
      radius: 6,
      color: '#000',
      speed: 1.4,
      trail: 57,
      shadow: false,
      left: '50%',
      top: '50%'
    },
    Block: {
      drop_options: drop_options,
      paste_options: paste_options,
      upload_options: upload_options,
    },
    blockLimit: 0,
    blockTypeLimits: {},
    required: [],
    uploadUrl: '/attachments',
    baseImageUrl: '/sir-trevor-uploads/',
    errorsContainer: undefined,
    convertFromMarkdown: true,
    formatBar: {
      commands: [
        {
          name: "Bold",
          title: "bold",
          cmd: "bold",
          keyCode: 66,
          text : "B"
        },
        {
          name: "Italic",
          title: "italic",
          cmd: "italic",
          keyCode: 73,
          text : "i"
        },
        {
          name: "Link",
          title: "link",
          iconName: "link",
          cmd: "linkPrompt",
          text : "link",
        },
        {
          name: "Unlink",
          title: "unlink",
          iconName: "link",
          cmd: "unlink",
          text : "link",
        },
      ],
    },
  }
};
