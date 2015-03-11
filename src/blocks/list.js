"use strict";

var _ = require('../lodash');

var Block = require('../block');
var stToHTML = require('../to-html');

var template = '<div class="st-text-block st-required" contenteditable="true"><ul><li></li></ul></div>';

module.exports = Block.extend({

  type: 'list',

  title: function() { return i18n.t('blocks:list:title'); },

  icon_name: 'list',

  markdownSupport: true,

  editorHTML: function() {
    return _.template(template, this);
  },

  loadData: function(data){
    if (this.markdownSupport && !data.isHtml) {
      this.getTextBlock().html('<ul>'+stToHTML(data.text, this.type)+'</ul>');
    } else {
      this.getTextBlock().html(data.text);
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

  toMarkdown: function(markdown) {
    return markdown.replace(/<\/li>/mg,"\n")
                   .replace(/<\/?[^>]+(>|$)/g, "")
                   .replace(/^(.+)$/mg," - $1");
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
  },

  _serializeData: function() {
    var data = Block.prototype._serializeData.apply(this);

    if (Object.keys(data).length && this.markdownSupport) {
      //console.log('data.isHtml = true');
      data.isHtml = true;
    }

    return data;
  },

});
