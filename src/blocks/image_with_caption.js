"use strict";

var Block = require('../block');

module.exports = Block.extend({

  type: "imagewithcaption",

  title: function() { return i18n.t('blocks:image:title'); },

  editorHTML: `
    <div data-primitive="image" name="file" data-draggable="true"></div>
    <p><b>Caption:</b></p>
    <div class="st-text-block" name="text" data-primitive="text"></div>
  `,

  icon_name: 'image',

});
