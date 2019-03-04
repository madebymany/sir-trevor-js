"use strict";

/*
  Block Quote
*/

var _ = require('../lodash');

var Block = require('../block');
var stToHTML = require('../to-html');
var ScribeHeadingPlugin = require('./scribe-plugins/scribe-heading-plugin');
var ScribeQuotePlugin = require('./scribe-plugins/scribe-quote-plugin');

var template = _.template([
  '<blockquote class="st-required st-text-block st-text-block--quote" contenteditable="true"></blockquote>',
  '<label class="st-input-label"> <%= i18n.t("blocks:quote:credit_field") %></label>',
  '<input maxlength="140" name="cite" placeholder="<%= i18n.t("blocks:quote:credit_field") %>"',
  ' class="st-input-string js-cite-input" type="text" />'
].join("\n"));

module.exports = Block.extend({

  type: "quote",

  icon_name: 'quote',

  mergeable: true,
  textable: true,
  toolbarEnabled: false,

  editorHTML: function() {
    return template(this);
  },

  configureScribe: function(scribe) {
    scribe.use(new ScribeHeadingPlugin(this));
    scribe.use(new ScribeQuotePlugin(this));
  },

  loadData: function(data){
    if (this.options.convertFromMarkdown && data.format !== "html") {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }

    if (data.cite) {
      this.$('.js-cite-input')[0].value = data.cite;
    }
  },

  asClipboardHTML: function() {
    return `<blockquote>${this._getData().text}<cite>- ${this._getData().cite}</cite></blockquote>`;
  }
});
