"use strict";

global.SirTrevor = require('../../../');

global.createBaseElement = function() {
  var form = document.createElement("form");
  var element = document.createElement("textarea");
  form.appendChild(element);
  return element;
};
