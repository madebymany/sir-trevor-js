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
        "type": "quote",
        "data": {
          "text": "F<b>ou</b>r",
          "cite": "Author"
        }
      },
      {
        "type": "video",
        "data": {
          "remote_id": "ID",
          "source": "youtube"
        }
      },
      {
        "type": "tweet",
        "data": {
          "user": {
            "profile_image_url": "profile_image_url",
            "profile_image_url_https": "profile_image_url_https",
            "screen_name": "user.screen_name",
            "name": "name"
          },
          "id": "id_str",
          "text": "text",
          "created_at": "created_at",
          "status_url": "https://twitter.com/username/status/id"
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

  xit('should copy the content of all the blocks', function(done) {
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
            '<blockquote><p>F<b>ou</b>r</p><cite>- Author</cite></blockquote>',
            '<p>https://www.youtube.com/embed/ID</p>',
            '<p>https://twitter.com/username/status/id</p>'
          ].join("\n")
        );
        done();
      });
  });
});
