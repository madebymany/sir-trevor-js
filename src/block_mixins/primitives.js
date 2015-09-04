"use strict";

var Primitives = require('../blocks/primitives/index');

module.exports = {
  mixinName: 'Primitives',

  initializePrimitives: function() {
    this.fields = {};
    this.setupPrimitives();
  },

  setupPrimitives: function() {
    var type, ref;

    [].forEach.call(this.getPrimitives(), (el) => {
      type = el.getAttribute('data-primitive');
      ref = el.getAttribute('name');

      this.fields[ref] = new Primitives[type](el, {}, this);
    });
    type = ref = null;
  },

  getPrimitiveData: function() {
    var data = {};

    this.getPrimitivesArray().forEach( (field) => {
      data[field.ref] = field.getData();
    });

    return data;
  },

  focusOnPrimitives: function() {
    this.getPrimitivesArray().forEach( (field) => field.focus());
  },

  blurOnPrimitives: function() {
    this.getPrimitivesArray().forEach( (field) => field.blur());
  },

  getPrimitives: function() {
    return this.inner.querySelectorAll('[data-primitive]');
  },

  removePrimitive: function(ref) {
    delete this.fields[ref];
  },

  getPrimitive: function(ref) {
    return this.fields[ref];
  },

  getPrimitivesArray: function() {
    return Object.keys(this.fields).map( (key) => {
      return this.fields[key];
    });
  }

};
