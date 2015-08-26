"use strict";

var _ = require('../lodash');
var utils = require('../utils');
var ScribeInterface = require('../scribe-interface');
var stToHTML = require('../to-html');
var TextField = require('../blocks/primitives/text-field');

module.exports = {
  mixinName: 'Primitives',

  fields: {},

  initializePrimitives: function() {},

  loadPrimitiveFields: function(data) {
    var content, type, ref;

    [].forEach.call(this.getPrimitives(), (el) => {
      type = el.getAttribute('data-primitive');
      ref = el.getAttribute('data-ref');

      switch(type) {
        case 'text':
          content = "";
          if (data) {
            content = data[ref] || "";
            if (this.options.convertFromMarkdown && data.format !== "html") {
              content = stToHTML(content, this.type);
            }
          }
          this.fields[ref] = new TextField(el, content, this);
          break;
        default:
          utils.log("Primitive of type " + type + " doesn't exist");
          break;
      }
    });
    type = content = null;
  },

  savePrimitiveFields: function() {
    var data = {}, field;

    Object.keys(this.fields).forEach( (ref) => {
      field = this.fields[ref];
      switch(field.type) {
        case 'text':
          data[ref] = field.getContent();
          break;
      }
    });

    return data;
  },

  focusPrimitiveFields: function() {
    [].forEach.call(this.fields, (field) => field.focus);
  },

  blurPrimitiveFields: function() {
    [].forEach.call(this.fields, (field) => field.blur);
  },

  getPrimitives: function() {
    return this.inner.querySelectorAll('[data-primitive]');
  }

};
