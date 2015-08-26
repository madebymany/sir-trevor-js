"use strict";

/*
  Text Block
*/

var Block = require('../block');
var _ = require('../lodash');

module.exports = Block.extend({

  type: "text",

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: [
    '<div class="st-text-block" data-ref="text" data-primitive="text" data-formattable="true"></div>',
    '<div class="st-text-block" data-ref="caption" data-primitive="text" data-formattable="true"></div>'
  ].join(''),

  icon_name: 'text',

  onBlockRender: function() {
    var data = this._getData();
    this.loadPrimitiveFields(data);
    this.focus();
  },

});
