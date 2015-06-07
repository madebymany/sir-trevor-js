"use strict";

/*
  Text Block
*/

var Block = require('../../block');
var stToHTML = require('../../to-html');
var template = require("./text.ejs");

module.exports = Block.extend({

  type: "text",

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: template(),
  icon_name: 'text',

  loadData: function(data){
    if (this.options.convertFromMarkdown && !data.isHtml) {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }
  },
});
