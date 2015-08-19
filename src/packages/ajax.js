"use strict";

require('whatwg-fetch');
var fetchJsonP = require('jsonp-promise');
var cancellablePromise = require('./cancellable-promise');

let Ajax = Object.create(null);

Ajax.fetch = (url, options = {}) => {
  var promise;
  if (options.jsonp) {
    promise = fetchJsonP(url).promise;
  } else {
    promise = fetch(url, options);
  }
  return cancellablePromise(promise);
};

module.exports = Ajax;