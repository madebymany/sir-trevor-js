"use strict";

var Block = require('../block');

module.exports = Block.extend({

  type: "image_with_caption",

  title: function() { return i18n.t('blocks:image:title'); },

  editorHTML: [
    '<div data-primitive="image" data-ref="file" data-draggable="true"></div>',
    '<p><b>Caption:</b></p>',
    '<div class="st-text-block" data-ref="text" data-primitive="text"></div>'
  ].join(''),

  icon_name: 'image',

  onBlockRender: function() {
    this.loadPrimitives({});
  },

});
