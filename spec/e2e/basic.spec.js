'use strict';

var helpers = require('./helpers');

var blockTypes = ["heading", "text", "list", "quote", "image", "video", "tweet"]; // jshint ignore:line

describe('Empty data', function() {

  beforeEach( function() {
    helpers.initSirTrevor();
  });

  it('should render with no blocks', function(done) {
    helpers.findElementsByCss('.st-block').then( function(blocks) {
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

  it('should allow reordering of blocks', function(done) {
    helpers.createBlock(blockTypes[0], function() {
      helpers.createBlock(blockTypes[1], function(parent) {
        helpers.findElementByCss('.st-block-ui-btn__reorder', parent).click().then( function() {
          return helpers.findElementByCss('.st-block-positioner__select > option[value=\'1\']', parent).click();
        }).then( function() {
          return helpers.findElementsByCss('.st-block');
        }).then( function(elements) {
          elements[0].getAttribute('data-type').then( function(attr) {
            if (attr === blockTypes[1]) {
              done();
            }
          });
        });
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
    helpers.findElementsByCss('.st-block').then( function(blocks) {
      expect(blocks.length).toBe(2);
      done();
    });
  });

});
