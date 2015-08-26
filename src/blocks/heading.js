"use strict";

/*
  Heading Block
*/

var _ = require('../lodash');
var Block = require('../block');

module.exports = Block.extend({

  type: 'heading',

  title: function(){ return i18n.t('blocks:heading:title'); },

  editorHTML: '<h2 class="st-text-block st-text-block--heading" data-ref="text" data-primitive="text"></h2>',

  scribeOptions: {
    default: { 
      allowBlockElements: false,
      tags: {
        p: false
      }
    }
  },

  icon_name: 'heading',

  onBlockRender: function() {
    var data = this._getData();
    this.loadPrimitiveFields(data);
    this.focus();
  },
  
});
