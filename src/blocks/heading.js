"use strict";

/*
  Heading Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

var ScribeTextBlockPlugin = require('./scribe-plugins/scribe-text-block-plugin');
var ScribeHeadingPlugin = require('./scribe-plugins/scribe-heading-plugin');
var ScribeQuotePlugin = require('./scribe-plugins/scribe-quote-plugin');

module.exports = Block.extend({

  type: 'heading',

  title: function(){ return i18n.t('blocks:heading:title'); },

  editorHTML: '<h2 class="st-required st-text-block st-text-block--heading" contenteditable="true"></h2>',

  configureScribe: function(scribe) {
    scribe.use(new ScribeTextBlockPlugin(this));
    scribe.use(new ScribeHeadingPlugin(this));
    scribe.use(new ScribeQuotePlugin(this));
    
    scribe.on('content-changed', this.toggleEmptyClass.bind(this));
  },

  textable: true,
  toolbarEnabled: false,

  scribeOptions: { 
    allowBlockElements: false,
    tags: {
      p: false
    }
  },

  icon_name: 'heading',

  loadData: function(data){
    if (this.options.convertFromMarkdown && data.format !== "html") {
      this.setTextBlockHTML(stToHTML(data.text, this.type));
    } else {
      this.setTextBlockHTML(data.text);
    }
  },

  onBlockRender: function() {
    this.focus();
    this.toggleEmptyClass();
  },

  toggleEmptyClass: function() {
    this.el.classList.toggle('st-block--empty', this._scribe.getTextContent().length === 0);
  }
});
