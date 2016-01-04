"use strict";

describe("BlockManager", function() {

  var manager;

  beforeEach(function(){
    var element = global.createBaseElement();
    var editor = new SirTrevor.Editor({
      el: element
    });
    manager = editor.blockManager;
  });

  describe("findBlockById", function(){

    beforeEach(function(){
      manager.createBlock("Text");
      manager.createBlock("Text");
    });

    it("returns a block from the blocks array if it's present", function(){
      expect(manager.findBlockById(manager.blocks[0].blockID)).toEqual(manager.blocks[0]);
    });

    it("returns nothing if the block isn't found", function(){
      expect(manager.findBlockById("st-block-crazy-id")).toBeUndefined();
    });

  });

  describe("getBlocksByType", function(){

    beforeEach(function(){
      manager.createBlock("Text");
      manager.createBlock("Image");
    });

    it("returns all the blocks of the type", function(){
      expect(manager.getBlocksByType("Text").length).toBe(1);
    });

  });

  describe("getBlocksByIDs", function(){

    beforeEach(function(){
      manager.createBlock("Text");
      manager.createBlock("Text");
    });

    it("returns all the blocks of the type", function(){
      expect(manager.getBlocksByIDs([manager.blocks[0].blockID]).length).toBe(1);
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
      manager.createBlock("Text");
      manager.createBlock("Text");
      spyOn(manager.mediator, 'trigger');
    });

    it("emits the correct length of the blocks", function(){
      manager.triggerBlockCountUpdate();
      expect(manager.mediator.trigger).toHaveBeenCalledWith(
             'block:countUpdate', manager.blocks.length);
    });

  });

  describe("getBlockPosition", function(){

    beforeEach(function(){
      manager.createBlock("Text");
      manager.createBlock("Text");
    });

    it("returns correct position for block", function(){
      expect(manager.getBlockPosition(manager.blocks[0].el)).toBe(0);
      expect(manager.getBlockPosition(manager.blocks[1].el)).toBe(1);
    });
  });

});
