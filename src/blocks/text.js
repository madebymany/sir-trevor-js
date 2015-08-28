"use strict";

/*
  Text Block
*/

var Block = require('../block');

module.exports = Block.extend({

  type: "text",

  title: function() { return i18n.t('blocks:text:title'); },

  editorHTML: '<div class="st-text-block" data-ref="text" data-primitive="text" data-formattable="true"></div>',

  icon_name: 'text',

  onBlockRender: function() {
    var data = this._getData();
    this.loadPrimitives(data);
    this.focus();
  },

});
