"use strict";

global.SirTrevor = require('../../../');
global._ = require('lodash');


global.createBaseElement = function() {
  var form = document.createElement("form");
  var element = document.createElement("textarea");
  form.appendChild(element);
  return element;
};
