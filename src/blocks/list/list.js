"use strict";

var _ = require('../../lodash');

var Block = require('../../block');
var stToHTML = require('../../to-html');
var template = require("./list.ejs");

module.exports = Block.extend({

  type: 'list',

  title: function() { return i18n.t('blocks:list:title'); },

  icon_name: 'list',

  editorHTML: template(),

  loadData: function(data){
    if (this.options.convertFromMarkdown && !data.isHtml) {
      this.setTextBlockHTML("<ul>" + stToHTML(data.text, this.type) + "</ul>");
    } else {
      this.setTextBlockHTML(data.text);
    }
  },

  onBlockRender: function() {
    this.checkForList = this.checkForList.bind(this);
    this.getTextBlock().on('click keyup', this.checkForList);
    this.focus();
  },

  checkForList: function() {
    if (this.$('ul').length === 0) {
      document.execCommand("insertUnorderedList", false, false);
    }
  },

  toHTML: function(html) {
    html = html.replace(/^ - (.+)$/mg,"<li>$1</li>")
               .replace(/\n/mg, "");

    return html;
  },

  onContentPasted: function(event, target) {
    this.$('ul').html(
      this.pastedMarkdownToHTML(target[0].innerHTML));
    this.getTextBlock().caretToEnd();
  },

  isEmpty: function() {
    return _.isEmpty(this.getBlockData().text);
  }

});
