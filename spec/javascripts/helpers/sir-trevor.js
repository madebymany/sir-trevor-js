"use strict";

global.SirTrevor = require('../../../');
global._ = require('lodash');


global.createBaseElement = function() {
  var form = document.createElement("form");
  var element = document.createElement("textarea");
  form.appendChild(element);
  return element;
};

beforeEach(function() {
  jasmine.addMatchers({
    toBeAPromise: function() {
      return {
        compare: function(actual, expected) {
          var result = {};
          result.pass = actual && typeof actual.then === "function";
          return result;
        }
      };
    }
  });
});
