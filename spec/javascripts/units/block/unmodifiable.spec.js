"use strict";

var config = require('../../../../src/config');

describe("UnmodifiableBlock Block", function(){

  var element, editor, block, testHandler;

  beforeEach(function(){
    element = global.createBaseElement();
    editor = new SirTrevor.Editor({ el: element });

    config.defaults.modifyBlocks = false;

    SirTrevor.Blocks.UnmodifiableBlock = SirTrevor.Block.extend({});

    block = new SirTrevor.Blocks.UnmodifiableBlock({}, editor.ID, editor.mediator);
  });

  afterEach(function(){
    delete SirTrevor.Blocks.UnmodifiableBlock;
  });

  describe("render", function(){

    it("has no reorder control", function(){
      expect(block.el.querySelectorAll('.st-block-ui-btn__reorder').length)
        .toBe(0);
    });

    it("has no delete control", function(){
      expect(block.el.querySelectorAll('.st-block-ui-btn__delete').length)
        .toBe(0);
    });

  });

});
