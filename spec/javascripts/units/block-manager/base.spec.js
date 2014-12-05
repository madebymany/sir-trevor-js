"use strict";

describe("BlockManager", function() {

  var manager;

  beforeEach(function(){
    manager = new SirTrevor.BlockManager(SirTrevor.config.defaults, '', Object.assign({}, SirTrevor.Events));
  });

  describe("findBlockById", function(){

    beforeEach(function(){
      manager.blocks = [
        { blockID: 1 },
        { blockID: 2 }
      ];
    });

    it("returns a block from the blocks array if it's present", function(){
      expect(manager.findBlockById(1)).toBeDefined();
    });

    it("returns nothing if the block isn't found", function(){
      expect(manager.findBlockById(3)).toBeUndefined();
    });

  });

  describe("getBlocksByType", function(){

    beforeEach(function(){
      manager.blocks = [
        { type: "Text" },
        { type: "Image" }
      ];
    });

    it("returns all the blocks of the type", function(){
      expect(manager.getBlocksByType("Text").length).toBe(1);
    });

  });

  describe("getBlocksByIDs", function(){

    beforeEach(function(){
      manager.blocks = [
        { blockID: 1 },
        { blockID: 2 }
      ];
    });

    it("returns all the blocks of the type", function(){
      expect(manager.getBlocksByIDs([1]).length).toBe(1);
    });
  });

  describe("Internationalization", function(){
    beforeEach(function(){
      manager.required = ['Text'];
    });

    it("correctly sets the English text as default", function() {
      spyOn(manager.mediator, 'trigger');

      manager.validateBlockTypesExist(true);

      expect(manager.mediator.trigger).toHaveBeenCalledWith(
        'errors:add', {text: "You must have a block of type Text"});
    });
  });

  describe("triggerBlockCountUpdate", function(){

    beforeEach(function(){
      manager.blocks = [
        { blockID: 1 },
        { blockID: 2 }
      ];
      spyOn(manager.mediator, 'trigger');
    });

    it("emits the correct length of the blocks", function(){
      manager.triggerBlockCountUpdate();
      expect(manager.mediator.trigger).toHaveBeenCalledWith(
             'block:countUpdate', manager.blocks.length);
    });

  });

});
