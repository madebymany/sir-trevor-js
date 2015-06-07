"use strict";

/*
  Heading Block
*/

var Block = require('../../block');
var stToHTML = require('../../to-html');
var template = require('./heading.ejs');

module.exports = Block.extend({

  type: 'Heading',

  title: function(){ return i18n.t('blocks:heading:title'); },

  editorHTML: template(),

  scribeOptions: { allowBlockElements: false },

  icon_name: 'heading',

  loadData: function(data){
    if (this.options.convertFromMarkdown && !data.isHtml) {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }
  }
});
