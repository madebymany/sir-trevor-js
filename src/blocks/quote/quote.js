"use strict";

/*
  Block Quote
*/

var Block = require('../../block');
var stToHTML = require('../../to-html');
var template = require("./quote.ejs");

module.exports = Block.extend({

  type: "quote",

  title: function() { return i18n.t('blocks:quote:title'); },

  icon_name: 'quote',

  editorHTML: template(),

  loadData: function(data){
    if (this.options.convertFromMarkdown && !data.isHtml) {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }

    this.$('.js-cite-input').val(data.cite);
  }
});
