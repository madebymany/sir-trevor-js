"use strict";

describe("BlockManager::Creating blocks", function(){

  var manager;

  Object.keys(SirTrevor.Blocks).forEach(function createBlockTest(blockName, i, blocks){

    describe("create " + blockName + "  with no editor options", function(){

      beforeEach(function(){
        var element = global.createBaseElement();
        var editor  = new SirTrevor.Editor({
          el: element,
          blockTypes: [blockName]
        });
        manager = editor.blockManager;

        spyOn(SirTrevor.EventBus, 'trigger').and.callThrough();
        manager.createBlock(blockName);
      });

      it("adds a block to the local block store", function(){
        expect(manager.blocks.length).toBe(1);
      });

      it("creates a block of the type specified", function(){
        expect(manager.blocks[0].type).toEqual(blockName.toLowerCase());
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
      var element = global.createBaseElement();
      var editor  = new SirTrevor.Editor({
        el: element,
        defaultType: false,
        blockLimit: 1,
        blockTypes: ["Text"]
      });
      manager = editor.blockManager;

      manager.createBlock('Text');
    });

    it("adheres to the limit", function(){
      expect(manager.blocks.length).toBe(1);
      expect(manager._blockLimitReached()).toBe(true);
    });

  });

  describe("createBlock with blockTypes set", function(){

    beforeEach(function(){
      var element = global.createBaseElement();
      var editor  = new SirTrevor.Editor({
        el: element,
        defaultType: false,
        blockTypes: ["Text"]
      });
      manager = editor.blockManager;
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
      var element = global.createBaseElement();
      var editor  = new SirTrevor.Editor({
        el: element,
        defaultType: false,
        blockTypeLimits: { 'Text': 1 },
        blockTypes: ["Text"]
      });
      manager = editor.blockManager;
    });

    it("adheres to the blockType limit", function(){
      manager.createBlock('Text');
      expect(manager.canAddBlockType('Text')).toBe(false);
    });

  });

});
