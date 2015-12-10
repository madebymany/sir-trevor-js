"use strict";

var driver = require('selenium-webdriver');

var APP_URL = 'http://localhost:8000/spec/app/index.html';
var USE_SAUCELABS = true;

exports.findElementByCss = function(css, parent) {
  return (parent || exports.browser).findElement(driver.By.css(css));
};

exports.findElementsByCss = function(css, parent) {
  return (parent || exports.browser).findElements(driver.By.css(css));
};

exports.findBlocks = function() {
  return exports.findElementsByCss('.st-block');
};

exports.createBlock = function(blockType, cb) {

  function createBlock(parent) {
    exports.findElementByCss('.st-block-replacer', parent).click().then( function() {
      return exports.findElementByCss('.st-block-controls__button[data-type="'+blockType+'"]', parent).click();
    }).then( function() {
      return exports.findElementByCss('.st-block[data-type="'+blockType+'"]');
    }).then(cb);
  }

  exports.findBlocks().then( function(blocks) {
    if (blocks.length > 0) {
      createBlock(blocks[blocks.length-1]);
    } else {
      exports.findElementByCss('.st-top-controls').then(createBlock);
    }
  });
};

exports.hasBlockCount = function(count) {
  return exports.findBlocks().then( function(blocks) {
    expect(blocks.length === count);
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
      el: document.querySelector('.sir-trevor'), \
      blockTypes: ['Heading', 'Text', 'List', 'Quote', 'Image', 'Video', 'Tweet'], \
      defaultType: 'Text' \
    });"
  );

  return exports.browser.executeScript(javascriptString.join("")).then( function() {
    return exports.findElementByCss('.st-outer');
  });
};

exports.catchError = function(err) { return false; };

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

      Object.assign(capabilities, {
        browserName: process.env.BROWSER_NAME,
        version: process.env.BROWSER_VERSION,
        platform: process.env.PLATFORM
      });

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
