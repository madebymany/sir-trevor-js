'use strict';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;

var helpers = require('./helpers');

// Only set to blocks that are controllable.
var blockTypes = ["list", "image", "video", "tweet"]; // jshint ignore:line

describe('Empty data', function() {

  beforeEach( function(done) {
    helpers.initSirTrevor().then(done);
  });

  it('should render with no blocks', function(done) {
    helpers.findBlocks().then( function(blocks) {
      expect(blocks.length).toBe(1);
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
    var classes, type;
    function deleteBlock(currentBlock) {
      if (currentBlock === blockTypes.length) {
        done();
        return;
      }
      helpers.createBlock(blockTypes[currentBlock], function(block) {
        block.getAttribute('class').then( function(className) {
          classes = className.split(' ');
          return block.getAttribute('data-type');
        }).then( function(res) {
          type = res;
          if (classes.indexOf('st-block--textable') > -1) {
            return helpers.focusOnTextBlock()
                    .then(helpers.pressBackSpace)
                    .then(helpers.findBlocks)
                    .then(function(blocks) {
                      if (blocks.length === 0) {
                        deleteBlock(currentBlock + 1);
                      }
                    });
          } else if (type === 'list') {
            return helpers.focusOnListBlock()
                    .then(helpers.pressBackSpace)
                    .then(helpers.findBlocks)
                    .then(function(blocks) {
                      if (blocks.length === 0) {
                        deleteBlock(currentBlock + 1);
                      }
                    });
          } else if (classes.indexOf('st-block--droppable') > -1) {
            return helpers.findElementByCss('.st-block__inner--droppable', block).click()
              .then(helpers.pressBackSpace)
              .then(helpers.findBlocks)
              .then(function(blocks) {
                if (blocks.length === 0) {
                  deleteBlock(currentBlock + 1);
                }
              });
          } else {
            return helpers.findElementByCss('.st-block-ui-btn__delete', block).click().then(function() {
              return helpers.findElementByCss('.js-st-block-confirm-delete', block).click();
            }).then(helpers.findBlocks)
              .then(function(blocks) {
                if (blocks.length === 0) {
                  deleteBlock(currentBlock + 1);
                }
              });
          }
        });
      });
    }
    deleteBlock(0);
  });

});

describe('Existing data', function() {

  beforeEach(function(done) {

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

    helpers.initSirTrevor(data).then(done);
  });

  it('should be populated with 2 text blocks', function(done) {
    helpers.findBlocks().then( function(blocks) {
      expect(blocks.length).toBe(2);
      done();
    });
  });

  describe('should allow reordering of blocks', function() {

    var blocks;

    beforeEach(function(done) {
      helpers.findBlocks().then( function(elements) {
        blocks = elements;
        done();
      });
    });

    it('with select box', function(done) {
      var id;
      blocks[1].getAttribute('id').then( function(res) {
        id = res;
      }).then( function() {
          return helpers.findElementByCss('.st-block-ui-btn__reorder', blocks[1]).click();
      }).then( function() {
        return helpers.findElementByCss('.st-block-positioner__select > option[value=\'1\']', blocks[1]).click();
      }).then(helpers.findBlocks)
        .then( function(elements) {
        elements[0].getAttribute('id').then( function(attr) {
          if (attr === id) {
            done();
          }
        });
      });
    });

    it('with drag and drop', function(done) {
      var id;
      return blocks[1].getAttribute('id').then( function(res) {
        id = res;
      }).then( function() {
        return helpers.browser.executeScript( function() {
          var elements = document.querySelectorAll('.st-block');
          var topControls = document.querySelector('.st-top-controls');
          window.simulateDragDrop(elements[1].querySelector('.st-block-ui-btn__reorder'), {dropTarget: topControls});
        });
      }).then(helpers.findBlocks)
        .then( function(elements) {
          elements[0].getAttribute('id').then( function(attr) {
            if (attr === id) {
              done();
            }
          });
      });
    }, 20000);
      
  });

});

describe('Block tests', function() {

  beforeEach( function(done) {
    helpers.initSirTrevor().then(done);
  });

  it('should allow drag and drop in a block', function(done) {
    helpers.createBlock(blockTypes[1], function(block) {
      helpers.browser.executeScript( function() {
        window.simulateDragDrop(undefined, {
          dropTarget: document.querySelector('.st-block__dropzone'),
          dataTransfer: {
            types: ['File'],
            files: [
              new Blob(['image-data'], {type: 'image/gif'}) // jshint ignore:line
            ]
          }
        });
      }).then( function() {
        return helpers.findElementByCss('.st-block__editor > img', block);
      }).then( function() {
        done();
      });
    });
  });

});
