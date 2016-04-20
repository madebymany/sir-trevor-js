"use strict";

/*
  Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

var ScribeTextBlockPlugin = require('./scribe-plugins/scribe-text-block-plugin');
var ScribePastePlugin = require('./scribe-plugins/scribe-paste-plugin');
var ScribeHeadingPlugin = require('./scribe-plugins/scribe-heading-plugin');
var ScribeQuotePlugin = require('./scribe-plugins/scribe-quote-plugin');

module.exports = Block.extend({

  type: "text",

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: '<div class="st-text-block" contenteditable="true"></div>',

  icon_name: 'text',

  textable: true,
  toolbarEnabled: false,

  configureScribe: function(scribe) {
    scribe.use(new ScribeTextBlockPlugin(this));
    scribe.use(new ScribePastePlugin(this));
    scribe.use(new ScribeHeadingPlugin(this));
    scribe.use(new ScribeQuotePlugin(this));

    scribe.on('content-changed', this.toggleEmptyClass.bind(this));
  },

  scribeOptions: { 
    allowBlockElements: true,
    tags: {
      p: {}
    }
  },

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

    if(Object.hasOwnProperty.call(window, "ActiveXObject") && !window.ActiveXObject) {
      this._scribe.el.addEventListener('paste', () => {
        setTimeout(() => {
          
          var fakeContent = document.createElement('div');
          fakeContent.innerHTML = this._scribe.getContent();

          if (fakeContent.childNodes.length > 1) {

            var nodes = Array.from(fakeContent.childNodes);
            this._scribe.setContent( nodes.shift().innerHTML );
            nodes.reverse().forEach((node) => {
              var data = {
                format: 'html',
                text: node.innerHTML
              };
              this.mediator.trigger("block:create", 'Text', data, this.el);
            });
            this._scribe.el.focus();
          }

        }, 1);
      });
    }
  },

  toggleEmptyClass: function() {
    this.el.classList.toggle('st-block--empty', this.isEmpty());
  },

  isEmpty: function() {
    return this._scribe.getTextContent() === '';
  }
});