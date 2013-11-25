"use strict";

describe("BlockManager::Creating blocks", function(){

  var manager, options, mediator, block;

  describe("createBlock with no editor options", function(){

    beforeEach(function(){
      mediator = _.extend({}, SirTrevor.Events);
      options = { defaultType: false };
      manager = new SirTrevor.BlockManager(_.extend({}, SirTrevor.config.defaults, options), '', mediator);
      block = new SirTrevor.Block();

      spyOn(SirTrevor.Blocks, 'Text').and.returnValue(block);
      spyOn(SirTrevor.EventBus, 'trigger');

      manager.createBlock('text');
    });

    it("instantiates a block of the type specified", function(){
      expect(SirTrevor.Blocks.Text).toHaveBeenCalled();
    });

    it("adds a block to the local block store", function(){
      expect(manager.blocks.length).toBe(1);
    });

    it("increments the block type count", function(){
      expect(manager._getBlockTypeCount('Text')).toBe(1);
    });

  });

  describe("createBlock with overall block limit", function(){

    beforeEach(function(){
      mediator = _.extend({}, SirTrevor.Events);
      options = { defaultType: false, blockLimit: 1 };
      manager = new SirTrevor.BlockManager(_.extend({}, SirTrevor.config.defaults, options), '', mediator);

      manager.createBlock('Text');
    });

    it("adheres to the limit", function(){
      expect(manager.blocks.length).toBe(1);
      expect(manager._blockLimitReached()).toBe(true);
    });

  });

  describe("createBlock with blockTypes set", function(){

    beforeEach(function(){
      mediator = _.extend({}, SirTrevor.Events);
      options = { defaultType: false, blockTypes: ['Text'] };
      manager = new SirTrevor.BlockManager(_.extend({}, SirTrevor.config.defaults, options), '', mediator);
    });

    it("will only create a block where the type is available", function(){
      manager.createBlock('Image');
      expect(manager.blocks.length).toBe(0);

      manager.createBlock('Text');
      expect(manager.blocks.length).toBe(1);
    });

  });

  describe("createBlock with blockTypeLimits set", function(){

    beforeEach(function(){
      mediator = _.extend({}, SirTrevor.Events);
      options = { defaultType: false, blockTypeLimits: { 'Text': 1 } };
      manager = new SirTrevor.BlockManager(_.extend({}, SirTrevor.config.defaults, options), '', mediator);
    });

    it("adheres to the blockType limit", function(){
      manager.createBlock('Text');
      expect(manager.canAddBlockType('Text')).toBe(false);
    });

  });

});
