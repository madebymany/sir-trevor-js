"use strict";

describe("BlockManager::Creating blocks", function(){

  var editorInstance, manager, options, mediator, block;

  Object.keys(SirTrevor.Blocks).forEach(function createBlockTest(blockName){

    describe("create " + blockName + "  with no editor options", function(){

      beforeEach(function(){
        mediator = _.extend({}, SirTrevor.Events);
        options = { defaultType: false };
        editorInstance = {ID: 'dummy'}; // dummy
        manager = new SirTrevor.BlockManager(_.extend({}, SirTrevor.config.defaults, options), editorInstance, mediator);
        block = new SirTrevor.Block(undefined, editorInstance);

        spyOn(SirTrevor.Blocks, blockName).and.returnValue(block);
        spyOn(SirTrevor.EventBus, 'trigger').and.callThrough();

        manager.createBlock(blockName.toLowerCase());
      });

      it("instantiates a block of the type specified", function(){
        expect(SirTrevor.Blocks[blockName]).toHaveBeenCalled();
      });

      it("adds a block to the local block store", function(){
        expect(manager.blocks.length).toBe(1);
      });

      it("increments the block type count", function(){
        expect(manager._getBlockTypeCount(blockName)).toBe(1);
      });

      it("fires a create:new block event", function() {
        var lastEvent = SirTrevor.EventBus.trigger.calls.mostRecent();

        expect(lastEvent.args[0]).toBe('block:create:new');
      });

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
