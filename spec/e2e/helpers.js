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

exports.hasClassName = function(element, className) {
  return element.getAttribute('class').then( function(classes) {
    return classes.split(' ').indexOf(className) > -1;
  });
};

exports.pressBackSpace = function() {
  return exports.browser.actions()
    .sendKeys(driver.Key.BACK_SPACE)
    .perform();
};

exports.pressShift = function() {
  return exports.browser.actions()
    .sendKeys(driver.Key.SHIFT)
    .perform();
};
exports.pressEnter = function() {
  return exports.browser.actions()
    .sendKeys(driver.Key.ENTER)
    .perform();
};
exports.pressShiftEnter = function() {
  return exports.browser.actions()
    .sendKeys(driver.Key.SHIFT)
    .sendKeys(driver.Key.ENTER)
    .perform();
};
exports.pressLeft = function() {
  return exports.browser.actions()
    .sendKeys(driver.Key.ARROW_LEFT)
    .perform();
};
exports.pressRight = function() {
  return exports.browser.actions()
    .sendKeys(driver.Key.ARROW_RIGHT)
    .perform();
};
exports.pressDown = function() {
  return exports.browser.actions()
    .sendKeys(driver.Key.ARROW_DOWN)
    .perform();
};
exports.pressCtrlA = function() {
  return exports.browser.actions()
    .keyDown(driver.Key.CONTROL)
    .sendKeys("a")
    .keyUp(driver.Key.CONTROL)
    .perform();
};
exports.pressCtrlC = function() {
  return exports.browser.actions()
    .keyDown(driver.Key.CONTROL)
    .sendKeys("c")
    .keyUp(driver.Key.CONTROL)
    .perform();
};
exports.pressCtrlV = function() {
  return exports.browser.actions()
    .keyDown(driver.Key.CONTROL)
    .sendKeys("v")
    .keyUp(driver.Key.CONTROL)
    .perform();
};

exports.enterText = function(text) {
  return exports.browser.actions()
                .sendKeys(text)
                .perform();
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
      var element = blocks[blocks.length-1];
      var classes, type;
      element.getAttribute('class').then( function(className) {
        classes = className.split(' ');
        return element.getAttribute('data-type');
      }).then( function(res) {
        type = res;
        if (classes.indexOf('st-block--textable') > -1) {
          if (blockType === 'text') {
            return exports.pressEnter().then(cb);
          } else {
            return createBlock(element);
          }
        } else if (type === 'list') {
          return exports.pressEnter()
            .then(exports.findBlocks)
            .then( function(blocks2) {
              return createBlock(blocks2[blocks2.length-1]);
            });
        } else if (classes.indexOf('st-block--droppable') > -1) {
          return exports.findElementByCss('.st-block__inner--droppable', element).click()
            .then(exports.pressEnter)
            .then(exports.findBlocks)
            .then(function(blocks2) {
              return createBlock(blocks2[blocks2.length-1]);
            });
        }
      });
    } else {
      exports.findElementByCss('.st-top-controls > .st-block-addition').click()
        .then(exports.findBlocks)
        .then(function(elements) {
          createBlock(elements[0]);
        });
    }
  });
};

exports.hasBlockCount = function(count) {
  return exports.findBlocks().then( function(blocks) {
    expect(blocks.length === count);
  });
};

exports.focusOnTextBlock = function(index) {
  index = index || 0;
  return exports.findElementsByCss('.st-text-block').then(function(elements) {
    return exports.browser.actions()
              .mouseMove(elements[index], {x: 5, y: 10})
              .click()
              .perform();
  });
};

exports.focusOnListBlock = function(index) {
  index = index || 0;
  return exports.findElementsByCss('.st-list-block__list').then(function(elements) {
    return exports.findElementsByCss('.st-list-block__editor', elements[index]);
  }).then(function(elements) {
    return exports.browser.actions()
              .mouseMove(elements[0], {x: 5, y: 10})
              .click()
              .perform();
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
