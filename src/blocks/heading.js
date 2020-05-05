"use strict";

/*
  Heading Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

var ScribeTextBlockPlugin = require('./scribe-plugins/scribe-text-block-plugin');
var ScribeQuotePlugin = require('./scribe-plugins/scribe-quote-plugin');
var ScribeHeadingPlugin = require('./scribe-plugins/scribe-heading-plugin');

module.exports = Block.extend({

  type: 'heading',

  editorHTML: '<h2 class="st-required st-text-block st-text-block--heading" contenteditable="true"></h2>',

  configureScribe: function(scribe) {
    scribe.use(new ScribeHeadingPlugin(this));
    scribe.use(new ScribeTextBlockPlugin(this));
    scribe.use(new ScribeQuotePlugin(this));

    scribe.on('content-changed', this.toggleEmptyClass.bind(this));
  },

  mergeable: true,
  textable: true,
  toolbarEnabled: false,

  scribeOptions: {
    allowBlockElements: false,
    tags: {
      p: false
    }
  },

  icon_name: 'heading',

  loadData: function(data) {
    if (this.options.convertFromMarkdown && data.format !== "html") {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }

    const level = data.level || this.editorOptions.defaultHeadingLevel;

    this.setData({ level });
    this.el.dataset.level = level;
  },

  onBlockRender: function() {
    this.toggleEmptyClass();
  },

  toggleEmptyClass: function() {
    this.el.classList.toggle('st-block--empty', this._scribe.getTextContent().length === 0);
  },

  asClipboardHTML: function() {
    var data = this.getBlockData();
    return `<h${data.level}>${data.text}</h${data.level}>`;
  }
});
