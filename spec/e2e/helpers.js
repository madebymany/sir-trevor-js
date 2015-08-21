"use strict";

var driver = require('selenium-webdriver');

var APP_URL = 'http://localhost:8000/spec/app/index.html';
var USE_SAUCELABS = false;

exports.findElementByCss = function(css, parent) {
  return (parent || exports.browser).findElement(driver.By.css(css));
};

exports.findElementsByCss = function(css, parent) {
  return (parent || exports.browser).findElements(driver.By.css(css));
};

exports.createBlock = function(blockType, cb) {

  function createSecondaryBlock(parent) {
    var height;
    parent.getSize().then( function(size) {
      height = size.height;
    }).then( function() {
      return exports.browser.actions().mouseMove(parent, {x: 0, y: height - 10}).click().perform();
    }).then( function() {
      return exports.findElementByCss('.st-block-control[data-type="'+blockType+'"]', parent).click();
    }).then( function() {
      return exports.findElementByCss('.st-block[data-type="'+blockType+'"]');
    }).then(cb);
  }

  function createFirstBlock() {
    var parent;
    exports.findElementByCss('.st-block-controls__top').then( function(element) {
      parent = element;
      return parent.click();
    }).then( function() {
      return exports.findElementByCss('.st-block-control[data-type="'+blockType+'"]', parent).click();
    }).then( function() {
      return exports.findElementByCss('.st-block[data-type="'+blockType+'"]');
    }).then(cb);
  }
    
  exports.findElementsByCss('.st-block').then( function(blocks) {
    if (blocks.length > 0) {
      createSecondaryBlock(blocks[blocks.length-1]);
    } else {
      createFirstBlock();
    }
  });
};

exports.initSirTrevor = function(data) {
  var javascriptString = [];
  
  if (data) {
    data = JSON.stringify(data).replace("'", "\\'");

    javascriptString.push(
      /*jshint multistr: true */
      "var textarea = document.querySelector('.sir-trevor'); \
       textarea.value = '" + data + "';"
    );
  }

  javascriptString.push(
    /*jshint multistr: true */
    "window.editor = new SirTrevor.Editor({ \
      el: $('.sir-trevor'), \
      blockTypes: ['Heading', 'Text', 'List', 'Quote', 'Image', 'Video', 'Tweet'] \
    });"
  );

  return exports.browser.executeScript(javascriptString.join("")).then( function() {
    return exports.findElementByCss('.st-outer');
  });
};

exports.completeAlertPopup = function(text) {
  return exports.browser.wait(driver.until.alertIsPresent()).then( function() {
    var alert = exports.browser.switchTo().alert();
    alert.sendKeys(text);
    return alert.accept();
  });
};

beforeAll(function() {

  var serverUrl = null;
  
  var capabilities = {
    browserName: 'chrome'
  };

  if (process.env.TRAVIS) {

    capabilities.browserName = 'firefox';

    if (USE_SAUCELABS) {

      serverUrl = 'http://ondemand.saucelabs.com:80/wd/hub';

      Object.assign(capabilities, {
        build: process.env.TRAVIS_BUILD_NUMBER,
        tags: [process.env.TRAVIS_NODE_VERSION, 'CI'],
      });
    
      Object.assign(capabilities, {
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      });
    }
  }

  exports.browser = new driver.Builder().usingServer(serverUrl).withCapabilities(capabilities).build();
  exports.browser.manage().timeouts().setScriptTimeout(20000);
});

beforeEach(function(done) {
  exports.browser.get(APP_URL).then(done);
});

afterAll(function(done) {
  exports.browser.quit().then(done);
});
