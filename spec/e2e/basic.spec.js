'use strict';

var helpers = require('./helpers');

var blockTypes = ["heading", "text", "list", "quote", "image", "video", "tweet"]; // jshint ignore:line

describe('Empty data', function() {

  beforeEach( function() {
    helpers.initSirTrevor();
  });

  it('should render with no blocks', function(done) {
    helpers.findBlocks().then( function(blocks) {
      expect(blocks.length).toBe(0);
      done();
    });
  });

  it('should be able to add all blocks specified on SirTrevor.config.blockTypes', function(done) {
    function createNextBlock(currentBlock) {
      if (currentBlock === blockTypes.length) {
        done();
        return;
      }
      var blockType = blockTypes[currentBlock];
      helpers.createBlock(blockType, function() {
        createNextBlock(currentBlock+1);
      });
    }
    createNextBlock(0);
  });

  it('should allow removal of block', function(done) {
    helpers.createBlock(blockTypes[0], function() {
      helpers.findElementByCss('.st-block-ui-btn__delete').click().then( function() {
        return helpers.findElementByCss('.js-st-block-confirm-delete').click();
      }, helpers.catchError).then( function() {
        return helpers.findElementByCss('.st-block');
      }, helpers.catchError).then( null, function(err) {
        done();
      });
    });
  });

});

describe('Existing data', function() {

  beforeEach(function() {

    var data = {
      "data": [
        {
          "type": "text",
          "data": {
            "text": "Block 1"
          }
        },
        {
          "type": "text",
          "data": {
            "text": "Block 2"
          }
        }
      ]
    };

    helpers.initSirTrevor(data);
  });

  it('should be populated with 2 text blocks', function(done) {
    helpers.findBlocks().then( function(blocks) {
      expect(blocks.length).toBe(2);
      done();
    });
  });

  describe('should allow reordering of blocks', function(done) {

    var blocks;

    beforeEach(function(done) {
      helpers.findBlocks().then( function(elements) {
        blocks = elements;
        done();
      });
    });

    it('with select box', function(done) {
      helpers.findElementByCss('.st-block-ui-btn__reorder', blocks[1]).click().then( function() {
        return helpers.findElementByCss('.st-block-positioner__select > option[value=\'1\']', blocks[1]).click();
      }).then(helpers.findBlocks)
        .then( function(elements) {
        elements[0].getAttribute('data-type').then( function(attr) {
          if (attr === blockTypes[1]) {
            done();
          }
        });
      });
    });

    it('with drag and drop', function(done) {

      return helpers.browser.executeScript( function() {
        var elements = document.querySelectorAll('.st-block');
        window.simulateDragDrop(elements[1].querySelector('.st-block-ui-btn__reorder'), {dropTarget: elements[0]});
      }).then(helpers.findBlocks)
        .then( function(elements) {
        elements[0].getAttribute('data-type').then( function(attr) {
          if (attr === blockTypes[1]) {
            done();
          }
        });
      });
    }, 20000);
      
  });

});
