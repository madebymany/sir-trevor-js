"use strict";

/*
  Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

  type: "text",

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',

  icon_name: 'text',

  markdownSupport: true,

  loadData: function(data){
    if (this.markdownSupport && !data.isHtml) {
      this.getTextBlock().html(stToHTML(data.text, this.type));
      data.isHtml = true;
    } else {
      this.getTextBlock().html(data.text);
    }
  },
});
