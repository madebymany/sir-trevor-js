'use strict';

var helpers = require('./helpers');
var driver = require('selenium-webdriver');

var blockTypes = ["text", "list"]; // jshint ignore:line

describe('Selection', function() {

  beforeEach( function() {
    var data = {
      "data": [
        {
          "type": "text",
          "data": {
            "text": "O<b>n</b>e"
          }
        },
        {
          "type": "list",
          "data": {
            "listItems": [
              {"content": "T<b>w</b>o"},
              {"content": "T<b>hre</b>e"}
            ],
            "format":"html",
          }
        },
        {
          "type": "text",
          "data": {
            "text": "F<b>ou</b>r"
          }
        }
      ]
    };

    helpers.initSirTrevor(data);
  });

  it('should select all the blocks', function(done) {
    // helpers.focusOnTextBlock().then(pressRight);
    done();
  });
});
