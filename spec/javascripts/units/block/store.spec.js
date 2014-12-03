"use strict";

describe("Block:Store", function(){

  var element, editor, block;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
  });

  describe("create", function(){

    beforeEach(function(){
      block = new SirTrevor.Blocks.Text({ text: 'Test' }, editor.ID, editor.mediator);
    });

    it("creates the data in the block store", function(){
      expect(block.blockStorage).toBeDefined();
    });

    it("should have the data provided on intialization", function(){
      expect(block.blockStorage.data.text).toBe('Test');
    });

  });

  describe("_getData", function(){

    beforeEach(function(){
      block = new SirTrevor.Blocks.Text({ text: 'Test' }, editor.ID, editor.mediator);
    });

    it("should retrieve the data", function(){
      expect(block._getData().text).toBe("Test");
    });

  });

  describe("setData", function(){

    beforeEach(function(){
      block = new SirTrevor.Blocks.Text({ text: 'Test' }, editor.ID, editor.mediator);
    });

    it("should set the data on the block", function(){
      block.setData({ text: "Boom" });
      expect(block._getData().text).toBe("Boom");
    });

    it("should save the data, even if none is given", function(){
      block.setData({ text: '' });
      expect(block._getData().text).toBe('');
    });

  });

  describe("save", function(){

    beforeEach(function() {
      block = new SirTrevor.Blocks.Text({ text: 'Test' }, editor.ID, editor.mediator);
      spyOn(block, '_serializeData');
    });

    it("calls _serializeData on save", function(){
      block.save();
      expect(block._serializeData).toHaveBeenCalled();
    });

  });

});
