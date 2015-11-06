'use strict';

var helpers = require('./helpers');
var driver = require('selenium-webdriver');

var blockTypes = ["text"]; // jshint ignore:line

describe('Format Bar', function() {

  beforeEach( function() {
    var data = {
      "data": [
        {
          "type": "text",
          "data": {
            "text": "Bold, Italic, Link, Underline, Strikethrough\\n\\nH1\\n\\nH2\\n\\nUL\\n\\nOL\\n\\nQuote"
          }
        }
      ]
    };

    helpers.initSirTrevor(data);
  });

  it('should not show as default', function(done) {
    helpers.findElementByCss('.st-format-bar ').then(null, function(err) {
      done();
    });
  });

  it('should allow formatting of text', function(done) {

    var testUrl = 'http://www.example.com';
    var expectedHtmlUpToLink = '<p><b>Bold</b>, <i>Italic</i>, <a href="' + testUrl + '">Link</a>, Underline, Strikethrough</p><p>H1</p><p>H2</p><p>UL</p><p>OL</p><p>Quote</p>';
    var expectedHtmlWithLinkRemoved = '<p><b>Bold</b>, <i>Italic</i>, Link, Underline, Strikethrough</p><p>H1</p><p>H2</p><p>UL</p><p>OL</p><p>Quote</p>';
    var expectedFinalFirefoxHtml = '<p><b>Bold</b>, <i>Italic</i>, Link, <u>Underline</u>, <strike>Strikethrough</strike></p><h1>H1</h1><h2>H2</h2><ul><li>UL</li></ul><ol><li>OL</li></ol><blockquote><p>Quote</p></blockquote>';
    var expectedFinalChromeHtml = '<p><b>Bold</b>, <i>Italic</i>, Link, <u>Underline</u>, <strike>Strikethrough</strike></p><h1>H1</h1><h2>H2</h2><ul><li>UL<br></li></ul><ol><li>OL<br></li></ol><blockquote><p>Quote</p></blockquote>';

    function selectBoldText() {
      return helpers.browser.actions()
                .keyDown(driver.Key.SHIFT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .keyUp(driver.Key.SHIFT)
                .perform().then( function() {
                  return helpers.findElementByCss('.st-format-btn--Bold').click();
                });
    }

    function selectItalicText() {
      return helpers.browser.actions()
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .keyDown(driver.Key.SHIFT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .sendKeys(driver.Key.ARROW_RIGHT)
                .keyUp(driver.Key.SHIFT)
                .perform().then( function() {
                  return helpers.findElementByCss('.st-format-btn--Italic').click();
                });
    }

    function selectLinkText() {
      return helpers.browser.actions()
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyDown(driver.Key.SHIFT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyUp(driver.Key.SHIFT)
        .perform().then( function() {
          return helpers.findElementByCss('.st-format-btn--Link').click();
        });
    }

    function selectUnderlineText() {
      return helpers.browser.actions()
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyDown(driver.Key.SHIFT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyUp(driver.Key.SHIFT)
        .perform().then( function() {
          return helpers.findElementByCss('.st-format-btn--Underline').click();
        });
    }

    function selectStrikethroughText() {
      return helpers.browser.actions()
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyDown(driver.Key.SHIFT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyUp(driver.Key.SHIFT)
        .perform().then( function() {
          return helpers.findElementByCss('.st-format-btn--Strikethrough').click();
        });
    }

    function selectH1Text() {
      return helpers.browser.actions()
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyDown(driver.Key.SHIFT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyUp(driver.Key.SHIFT)
        .perform().then( function() {
          return helpers.findElementByCss('.st-format-btn--Heading1').click();
        });
    }

    function selectH2Text() {
      return helpers.browser.actions()
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyDown(driver.Key.SHIFT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyUp(driver.Key.SHIFT)
        .perform().then( function() {
          return helpers.findElementByCss('.st-format-btn--Heading2').click();
        });
    }

    function selectUnorderedListText() {
      return helpers.browser.actions()
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyDown(driver.Key.SHIFT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyUp(driver.Key.SHIFT)
        .perform().then( function() {
          return helpers.findElementByCss('.st-format-btn--UnorderedList').click();
        });
    }

    function selectOrderedListText() {
      return helpers.browser.actions()
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyDown(driver.Key.SHIFT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyUp(driver.Key.SHIFT)
        .perform().then( function() {
          return helpers.findElementByCss('.st-format-btn--OrderedList').click();
        });
    }

    function selectQuoteText() {
      return helpers.browser.actions()
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyDown(driver.Key.SHIFT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .sendKeys(driver.Key.ARROW_RIGHT)
        .keyUp(driver.Key.SHIFT)
        .perform().then( function() {
          return helpers.findElementByCss('.st-format-btn--Blockquote').click();
        });
    }

    var parent;
    helpers.findElementByCss('.st-text-block').then( function(element) {
      parent = element;
      return helpers.browser.actions()
                .mouseMove(parent, {x: 0, y: 30})
                .click()
                .perform();
    }).then(selectBoldText)
      .then(selectItalicText)
      .then(selectLinkText)
      .then(function() {
        return helpers.completeAlertPopup(testUrl);
    }).then( function() {
      return parent.getInnerHtml();
    }).then( function(html) {
      expect(html).toBe(expectedHtmlUpToLink);
      return helpers.findElementByCss('.st-format-btn--Unlink').click();
    }).then( function() {
      return parent.getInnerHtml();
    }).then( function(html) {
      expect(html).toBe(expectedHtmlWithLinkRemoved);
    }).then(selectUnderlineText)
      .then(selectStrikethroughText)
      .then(selectH1Text)
      .then(selectH2Text)
      .then(selectUnorderedListText)
      .then(selectOrderedListText)
      .then(selectQuoteText)
      .then( function() {
        return parent.getInnerHtml();
    }).then( function(html) {
      var result = html === expectedFinalChromeHtml || html === expectedFinalFirefoxHtml;
      expect(result).toBe(true);
      done();
    });
  });

});
