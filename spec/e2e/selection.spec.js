'use strict';

var helpers = require('./helpers');
var driver = require('selenium-webdriver');

var getClipboardData = function() {
  var str = "return document.body.querySelector('.st-copy-area').innerHTML;";
  return helpers.browser.executeScript(str);
};

describe('Selection', function() {

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

  beforeEach( function() {
    helpers.initSirTrevor(data);
  });

  it('should select all the blocks', function(done) {
    helpers.focusOnTextBlock()
      .then(helpers.pressCtrlA)
      .then(function() {
        return helpers.findElementsByCss(".st-block--is-selected");
      })
      .then(function(blocks) {
        expect(blocks.length).toBe(data["data"].length);
        done();
      });
  });

  it('should copy the content of all the blocks', function(done) {
    helpers.focusOnTextBlock()
      .then(helpers.pressCtrlA)
      .then(helpers.pressCtrlC)
      .then(getClipboardData)
      .then(function(clipboardData) {
        expect(clipboardData).toBe(
          [
            '<p>O<b>n</b>e</p>',
            '<ul><li>T<b>w</b>o</li>',
            '<li>T<b>hre</b>e</li></ul>',
            '<p>F<b>ou</b>r</p>'
          ].join("\n")
        );
        done();
      });
  });
});
