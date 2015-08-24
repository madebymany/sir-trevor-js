"use strict";

require('whatwg-fetch');
var fetchJsonP = require('jsonp-promise');
var cancellablePromise = require('./cancellable-promise');
var config = require('../config');

let Ajax = Object.create(null);

Ajax.fetch = (url, options = {}) => {

  options = Object.assign({}, config.defaults.ajaxOptions, options);

  var promise;
  if (options.jsonp) {
    promise = fetchJsonP(url).promise;
  } else {
    promise = fetch(url, options).then( function(response) {
      if (options.dataType === 'json') {
        return response.json();
      }
      return response.text();
    });
  }
  return cancellablePromise(promise);
};

module.exports = Ajax;