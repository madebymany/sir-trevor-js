"use strict";

var drop_options = {
  html: ['<div class="st-block__dropzone">',
    '<svg role="img" class="st-icon"><use xlink:href="<%= SirTrevor.config.defaults.iconUrl %>#<%= _.result(block, "icon_name") %>"/></svg>',
    '<p><%= i18n.t("general:drop", { block: "<span>" + _.result(block, "title") + "</span>" }) %>',
    '</p></div>'].join('\n'),
    re_render_on_reorder: false
};

var paste_options = {
  html: ['<input type="text" placeholder="<%= i18n.t("general:paste") %>"',
    ' class="st-block__paste-input st-paste-block">'].join('')
};

var upload_options = {
  html: [
    '<div class="st-block__upload-container">',
    '<input type="file" type="st-file-upload">',
    '<button class="st-upload-btn"><%= i18n.t("general:upload") %></button>',
    '</div>'
  ].join('\n')
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
    iconUrl: '../src/icons/sir-trevor-icons.svg',
    errorsContainer: undefined,
    convertFromMarkdown: true,
    formatBar: {
      commands: [
        {
          name: "Bold",
          title: "bold",
          iconName: "fmt-bold",
          cmd: "bold",
          keyCode: 66,
          text : "B"
        },
        {
          name: "Italic",
          title: "italic",
          iconName: "fmt-italic",
          cmd: "italic",
          keyCode: 73,
          text : "i"
        },
        {
          name: "Link",
          title: "link",
          iconName: "fmt-link",
          cmd: "linkPrompt",
          text : "link",
        },
        {
          name: "Unlink",
          title: "unlink",
          iconName: "fmt-link",
          cmd: "unlink",
          text : "link",
        },
        {
          name: "Heading",
          title: "heading",
          iconName: "fmt-heading",
          cmd: "heading",
          text: "heading"
        },
        {
          name: "Quote",
          title: "quote",
          iconName: "fmt-quote",
          cmd: "quote",
          text: "quote"
        }
      ],
    },
    ajaxOptions: {
      headers: {}
    }
  }
};
