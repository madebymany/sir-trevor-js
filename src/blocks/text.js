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

  _serializeData: function() {
    var data = Block.prototype._serializeData.apply(this);

    if (Object.keys(data).length && this.markdownSupport) {
      data.isHtml = true;
    }

    return data;
  },

  loadData: function(data){
    if (this.markdownSupport && !data.isHtml) {
      this.getTextBlock().html(stToHTML(data.text, this.type));
    } else {
      this.getTextBlock().html(data.text);
    }
  },
});
