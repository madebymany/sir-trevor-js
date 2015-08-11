"use strict";

require('whatwg-fetch');
var fetchJsonP = require('jsonp-promise');

let Ajax = Object.create(null);

Ajax.fetch = (url, options = {}) => {
  if (options.jsonp) {
    return fetchJsonP(url).promise;
  }
  return fetch(url, options);
};

module.exports = Ajax;