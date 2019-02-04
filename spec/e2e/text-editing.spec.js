'use strict';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

var helpers = require('./helpers');
var driver = require('selenium-webdriver');

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
var pressDown = function() {
  return helpers.browser.actions()
    .sendKeys(driver.Key.ARROW_DOWN)
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

var getBlockData = function(index) {
  var str = 'return window.editor.blockManager.blocks[' + index + '].getData()';
  return helpers.browser.executeScript(str);
}

describe('Text block', function() {

  beforeEach( function() {
    var data = {
      "data": [
        {
          "type": "text",
          "data": {
            "text": "O<b>n</b>e"
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
            expect(htmlArr[1]).toBe("<p><b>n</b>e</p>");
            done();
        });
    });

    it('should add a breakline when combined with shift', function(done) {
      helpers.focusOnTextBlock().then(pressShiftEnter).then(pressShift)
        .then(function() {
          return getTextFromBlock([0]);
        }).then(function(htmlArr) {
          expect(htmlArr[0]).toBe("<p><br>O<b>n</b>e</p>");
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
          expect(htmlArr[0]).toBe("<p><b>n</b>e</p>");
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
              .then(getTextBeforeCaret)
              .then(function(text) {
                return expect(text).toBe("One");
              })
              .then(function() {
                return getTextFromBlock([0]);
              }).then(function(htmlArr) {
                expect(htmlArr[0]).toBe("<p>O<b>n</b>eTwo</p>");
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

describe('List block', function() {

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

  describe('Pressing Enter', function() {
    it('should create a new list element at the start', function(done) {
      helpers.focusOnListBlock()
        .then(pressEnter)
        .then(function() {
          return helpers.findElementsByCss('.st-list-block__item')
        })
        .then(function(fields) {
          return expect(fields.length).toBe(3);
        })
        .then(function() { return getBlockData(1); })
        .then(function(data) {
          expect(data.data.listItems[0].content).toBe("");
          expect(data.data.listItems[1].content).toBe("T<b>w</b>o");
          expect(data.data.listItems[2].content).toBe("T<b>hre</b>e");
          done();
        });
    });
    it('should create a new list element in the middle', function(done) {
      helpers.focusOnListBlock()
        .then(pressRight)
        .then(pressRight)
        .then(pressRight)
        .then(pressEnter)
        .then(function() {
          return helpers.findElementsByCss('.st-list-block__item')
        })
        .then(function(fields) {
          return expect(fields.length).toBe(3);
        })
        .then(function() { return getBlockData(1); })
        .then(function(data) {
          expect(data.data.listItems[0].content).toBe("T<b>w</b>o");
          expect(data.data.listItems[1].content).toBe("");
          expect(data.data.listItems[2].content).toBe("T<b>hre</b>e");
          done();
        });
    });
    it('should split a list element', function(done) {
      helpers.focusOnListBlock()
        .then(pressRight)
        .then(pressEnter)
        .then(function() {
          return helpers.findElementsByCss('.st-list-block__item')
        })
        .then(function(fields) {
          return expect(fields.length).toBe(3);
        })
        .then(function() { return getBlockData(1); })
        .then(function(data) {
          expect(data.data.listItems[0].content).toBe("T");
          expect(data.data.listItems[1].content).toBe("<b>w</b>o");
          expect(data.data.listItems[2].content).toBe("T<b>hre</b>e");
          done();
        });
    });
    it('should create a new block at the end', function(done) {
      helpers.focusOnListBlock()
        .then(pressRight)
        .then(pressRight)
        .then(pressRight)
        .then(pressRight)
        .then(pressRight)
        .then(pressRight)
        .then(pressRight)
        .then(pressRight)
        .then(pressRight)
        .then(pressEnter)
        .then(function() {
          return helpers.findElementsByCss('.st-list-block__item')
        })
        .then(function(fields) {
          return expect(fields.length).toBe(3);
        })
        .then(function() { return getBlockData(1); })
        .then(function(data) {
          expect(data.data.listItems[0].content).toBe("T<b>w</b>o");
          expect(data.data.listItems[1].content).toBe("T<b>hre</b>e");
          return expect(data.data.listItems[2].content).toBe("");
        })
        .then(pressEnter)
        .then(function() {
          return helpers.findElementsByCss('.st-list-block__item')
        })
        .then(function(fields) {
          return expect(fields.length).toBe(2);
        })
        .then(function() { return getBlockData(1); })
        .then(function(data) {
          expect(data.data.listItems[0].content).toBe("T<b>w</b>o");
          return expect(data.data.listItems[1].content).toBe("T<b>hre</b>e");
        })
        .then(function() { return getBlockData(3); })
        .then(function(data) {
          return expect(data.data.text).toBe("<p><br></p>");
        })
        .then(function() { return getBlockData(2); })
        .then(function(data) {
          expect(data.data.text).toBe("<p>F<b>ou</b>r</p>");
          done();
        });
    });
  });

  describe('Pressing Backspace', function() {

    it('should delete a character', function(done) {
      helpers.focusOnListBlock().then(pressRight).then(pressBackSpace)
        .then(function() {
          return getBlockData(1);
        }).then(function(data) {
          expect(data.data.listItems[0].content).toBe("<b>w</b>o");
          done();
        });
    });

    it('should delete the block when caret is at the start of the block and there is a block above', function(done) {
      helpers.focusOnTextBlock(1)
        .then(pressRight).then(pressRight).then(pressRight).then(pressRight)
        .then(pressEnter)
        .then(function() {
          helpers.createBlock('list', function() {
            helpers.hasBlockCount(4)
              .then(pressBackSpace)
              .then(function() {
                return helpers.hasBlockCount(4);
              })
              .then(pressBackSpace)
              .then(function() {
                return helpers.hasBlockCount(3);
              }).then(done);
          });
        });
    });

    it('should transpose the block content when caret is at the start of the block and there is a block above', function(done) {
      helpers.focusOnTextBlock(1)
        .then(pressRight).then(pressRight).then(pressRight).then(pressRight)
        .then(pressEnter)
        .then( function() {
          helpers.createBlock('list', function() {
            helpers.hasBlockCount(4)
              .then( function() {
                return enterText("Five");
              })
              .then(pressLeft)
              .then(pressLeft)
              .then(pressLeft)
              .then(pressLeft)
              .then(pressBackSpace)
              .then(pressBackSpace)
              .then(function() {
                return getBlockData(2);
              })
              .then(function(data) {
                expect(data.data.text).toBe("<p>F<b>ou</b>rFive</p>");
                done();
              });
          });
        });
    });

    it('should transpose the list content from the deleted list item', function(done) {
      helpers.focusOnListBlock()
        .then(pressRight).then(pressRight).then(pressRight).then(pressRight)
        .then(pressBackSpace)
        .then(function() {
          return getBlockData(1);
        })
        .then(function(data) {
          expect(data.data.listItems[0].content).toBe("T<b>w</b>oT<b>hre</b>e");
          done();
        });
    });
  });
});
