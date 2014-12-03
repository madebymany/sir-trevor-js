"use strict";

describe("Editor", function(){

  var element, editor;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
  });

  describe("instantiating without an element", function(){

    beforeEach(function(){
      SirTrevor.config.instances = [];
      editor = new SirTrevor.Editor();
    });

    it("won't create an instance", function(){
      expect(SirTrevor.config.instances.length).toBe(0);
    });

  });

  describe("instantiating with an element", function(){

    beforeEach(function(){
      SirTrevor.config.instances = [];
      editor = new SirTrevor.Editor({ el: element });
    });

    it("creates an instance", function(){
      expect(SirTrevor.config.instances.length).toBe(1);
    });

  });

  describe("setting elements", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({ el: element });
    });

    it("creates a $form element", function(){
      expect(editor.$form).toBeDefined();
    });

    it("creates an $outer element", function(){
      expect(editor.$outer).toBeDefined();
    });

    it("creates a $wrapper element", function(){
      expect(editor.$wrapper).toBeDefined();
    });

  });

  describe("build", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({ el: element });
    });

    it("creates a new BlockControl", function(){
      expect(editor.block_controls).toBeDefined();
    });

    it("creates a new FloatingBlockControl", function(){
      expect(editor.fl_block_controls).toBeDefined();
    });

    it("creates a new FormatBar", function(){
      expect(editor.formatBar).toBeDefined();
    });

  });

  describe("findBlockById", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({ el: element });

      editor.block_manager.blocks = [
        { blockID: 1 },
        { blockID: 2 }
      ];
    });

    it("returns a block from the blocks array if it's present", function(){
      expect(editor.findBlockById(1)).toBeDefined();
    });

    it("returns nothing if the block isn't found", function(){
      expect(editor.findBlockById(3)).toBeUndefined();
    });

  });

  describe("getBlocksByType", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({ el: element });

      editor.block_manager.blocks = [
        { type: "Text" },
        { type: "Image" }
      ];
    });

    it("returns all the blocks of the type", function(){
      expect(editor.getBlocksByType("Text").length).toBe(1);
    });
  });

  describe("getBlocksByIDs", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({ el: element });

      editor.block_manager.blocks = [
        { blockID: 1 },
        { blockID: 2 }
      ];
    });

    it("returns all the blocks of the type", function(){
      expect(editor.getBlocksByIDs([1]).length).toBe(1);
    });
  });
});
