"use strict";

var Block = require('../block');

module.exports = Block.extend({

  type: "image",
  
  title: function() { return i18n.t('blocks:image:title'); },

  editorHTML: [
    '<div data-primitive="image" name="file" data-draggable="true"></div>',
  ].join(''),

  icon_name: 'image',

});
