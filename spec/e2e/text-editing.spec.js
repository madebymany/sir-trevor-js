'use strict';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

var helpers = require('./helpers');
var driver = require('selenium-webdriver');

var blockTypes = ["text"]; // jshint ignore:line

var pressShift = function() {
  return helpers.browser.actions()
    .sendKeys(driver.Key.SHIFT)
    .perform();
};
var pressEnter = function() {
  return helpers.browser.actions()
    .sendKeys(driver.Key.ENTER)
    .perform();
};
var pressShiftEnter = function() {
  return helpers.browser.actions()
    .sendKeys(driver.Key.SHIFT)
    .sendKeys(driver.Key.ENTER)
    .perform();
};
var pressLeft = function() {
  return helpers.browser.actions()
    .sendKeys(driver.Key.ARROW_LEFT)
    .perform();
};
var pressRight = function() {
  return helpers.browser.actions()
    .sendKeys(driver.Key.ARROW_RIGHT)
    .perform();
};
var pressBackSpace = function() {
  return helpers.browser.actions()
    .sendKeys(driver.Key.BACK_SPACE)
    .perform();
};

var enterText = function(text) {
  return helpers.browser.actions()
                .sendKeys(text)
                .perform();
};

var getTextFromBlock = function(blocks) {
  var str = 'return [';
  str += blocks.map( function(index) {
    return 'window.editor.blockManager.blocks[' + index + '].getTextBlockHTML()';
  }).join(',');
  str += '];';
  return helpers.browser.executeScript(str);
};

var getTextBeforeCaret = function(index) {
  index = index || 0;
  var str = "var currentSelection = function(scribe) {";
      str += "var selection = new scribe.api.Selection();";
      str += "var range = selection.range.cloneRange();";
      str += "range.setStartBefore(scribe.el.firstChild, 0);";
      str += "return range.toString();";
      str += "};";
      str += "return currentSelection(window.editor.blockManager.blocks[" + index + "]._scribe);";
  return helpers.browser.executeScript(str);
};

var textblockHasFocus = function(textBlock) {
  var str = "return document.activeElement === arguments[0];";
  return helpers.browser.executeScript(str, textBlock);
};

describe('Text block', function() {

  beforeEach( function() {
    var data = {
      "data": [
        {
          "type": "text",
          "data": {
            "text": "One"
          }
        }
      ]
    };

    helpers.initSirTrevor(data);
  });

  describe('Pressing Enter', function() {

    it('should create a new block', function(done) {
      helpers.focusOnTextBlock().then(pressEnter)
        .then(function() {
          return helpers.hasBlockCount(2);
        }).then(done);
    });

    it('should copy the text after the caret to a new block', function(done) {
      helpers.focusOnTextBlock().then(pressRight)
        .then(pressEnter)
        .then(function() {
          return getTextFromBlock([0, 1]);
        }).then(function(htmlArr) {
            expect(htmlArr[0]).toBe("<p>O</p>");
            expect(htmlArr[1]).toBe("<p>ne</p>");
            done();
        });
    });

    it('should add a breakline when combined with shift', function(done) {
      helpers.focusOnTextBlock().then(pressShiftEnter).then(pressShift)
        .then(function() {
          return getTextFromBlock([0]);
        }).then(function(htmlArr) {
          expect(htmlArr[0]).toBe("<p><br>One</p>");
          done();
        });
    });

  });

  describe('Pressing Backspace', function() {

    it('should delete a character', function(done) {
      helpers.focusOnTextBlock().then(pressRight).then(pressBackSpace)
        .then(function() {
          return getTextFromBlock([0]);
        }).then(function(htmlArr) {
          expect(htmlArr[0]).toBe("<p>ne</p>");
          done();
        });
    });

    it('should delete the block when caret is at the start of the block and there is a block above', function(done) {
      helpers.focusOnTextBlock().then(pressRight).then(pressRight).then(pressRight)
        .then( function() {
          helpers.createBlock('text', function() {
            helpers.hasBlockCount(2).then( function() {
              return helpers.focusOnTextBlock(1);
            }).then(pressBackSpace)
              .then(function() {
                return helpers.hasBlockCount(1);
              }).then(done);
          });
        });
    });

    it('should transpose the block content when caret is at the start of the block and there is a block above', function(done) {
      helpers.focusOnTextBlock().then(pressRight).then(pressRight).then(pressRight)
        .then( function() {
          helpers.createBlock('text', function() {
            helpers.hasBlockCount(2).then( function() {
              return helpers.focusOnTextBlock(1);
            }).then( function() {
              return enterText("Two");
            }).then(pressLeft)
              .then(pressLeft)
              .then(pressLeft)
              .then(pressBackSpace)
              .then(function() {
                return getTextFromBlock([0]);
              }).then(function(htmlArr) {
                expect(htmlArr[0]).toBe("<p>OneTwo</p>");
                done();
              });
          });
        });
    });

  });

  describe('Pressing Left', function() {

    it('should move 1 character to the left', function(done) {
      helpers.focusOnTextBlock().then( function() {
        return enterText("T");
      })
      .then(getTextBeforeCaret)
      .then(function(text) {
        expect(text).toBe("T");
      })
      .then(pressLeft)
      .then(getTextBeforeCaret)
      .then(function(text) {
        expect(text).toBe("");
        done();
      });
    });

    it('should at the start of the block move to the previous block', function(done) {
      helpers.focusOnTextBlock().then(pressRight).then(pressRight).then(pressRight)
        .then( function() {
          helpers.createBlock('text', function() {
          helpers.focusOnTextBlock(1)
            .then(function() {
              return getTextBeforeCaret(1);
            })
            .then(function(text) {
              expect(text).toBe("");
            })
            .then(pressLeft)
            .then(getTextBeforeCaret)
            .then(function(text) {
              expect(text).toBe("One");
              done();
            });
          });
        });
    });

  });

    describe('Pressing Right', function() {

    it('should move right 1 character', function(done) {
      helpers.focusOnTextBlock()
        .then(getTextBeforeCaret)
        .then(function(text) {
          expect(text).toBe("");
        })
        .then(pressRight)
        .then(pressRight)
        .then(getTextBeforeCaret)
        .then(function(text) {
          expect(text).toBe("On");
          done();
        });
    });

    it('should at the end of the block move to the next block', function(done) {
      var textfield;
      helpers.focusOnTextBlock().then(pressRight).then(pressRight).then(pressRight)
        .then( function() {
          helpers.createBlock('text', function() {
            helpers.findElementsByCss('.st-text-block')
              .then(function(fields) {
                textfield = fields[fields.length-1];
              })
              .then(function() {
                return helpers.focusOnTextBlock(0);
              })
              .then(function() {
                return getTextBeforeCaret(0);
              })
              .then(function(text) {
                expect(text).toBe("");
              })
              .then(pressRight)
              .then(pressRight)
              .then(pressRight)
              .then(pressRight)
              .then(function() {
                return textblockHasFocus(textfield);
              })
              .then(function(result) {
                expect(result).toBe(true);
                done();
              });
          });
        });
    });

  });

});
