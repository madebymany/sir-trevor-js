"use strict";

var utils = require('../utils');
var stToHTML = require('../to-html');
var Primitives = require('../blocks/primitives/index');

module.exports = {
  mixinName: 'Primitives',

  initializePrimitives: function() {
    this.fields = {};
  },

  loadPrimitives: function(data) {
    var type, ref;

    [].forEach.call(this.getPrimitives(), (el) => {
      type = el.getAttribute('data-primitive');
      ref = el.getAttribute('data-ref');

      this.fields[ref] = new Primitives[type](el, data[ref], this);
    });
    type = ref = null;
  },

  getPrimitiveData: function() {
    var data = {}, field;

    Object.keys(this.fields).forEach( (ref) => {
      field = this.fields[ref];
      data[ref] = field.getData();
    });

    return data;
  },

  focusOnPrimitives: function() {
    [].forEach.call(this.fields, (field) => field.focus);
  },

  blurOnPrimitives: function() {
    [].forEach.call(this.fields, (field) => field.blur);
  },

  getPrimitives: function() {
    return this.inner.querySelectorAll('[data-primitive]');
  },

  removePrimitive: function(ref) {
    delete this.getPrimitive(ref);
  },

  getPrimitive: function(ref) {
    return this.fields[ref];
  },

};
