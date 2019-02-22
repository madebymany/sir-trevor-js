'use strict';

var helpers = require('./helpers');
var driver = require('selenium-webdriver');

describe('Format Bar', function() {

  beforeEach( function() {
    var data = {
      "data": [
        {
          "type": "text",
          "data": {
            "text": "Bold, Italic, Link"
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

  xit('should allow formatting of text', function(done) {

    var testUrl = 'http://www.example.com';
    var expectedHtmlWithoutLink = '<p><b>Bold</b>, <i>Italic</i>, Link</p>';
    var expectedFullHtml = '<p><b>Bold</b>, <i>Italic</i>, <a href="' + testUrl + '">Link</a></p>';

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

    var parent;
    helpers.findElementByCss('.st-text-block').then( function(element) {
      parent = element;
    }).then(function() {
      return helpers.focusOnTextBlock();
    }).then(selectBoldText)
      .then(selectItalicText)
      .then(selectLinkText)
      .then(function() {
        return helpers.completeAlertPopup(testUrl);
    }).then( function() {
      return parent.getInnerHtml();
    }).then( function(html) {
      expect(html).toBe(expectedFullHtml);
      return helpers.findElementByCss('.st-format-btn--Unlink').click();
    }).then( function() {
      return parent.getInnerHtml();
    }).then( function(html) {
      expect(html).toBe(expectedHtmlWithoutLink);
      done();
    });
  });
});
