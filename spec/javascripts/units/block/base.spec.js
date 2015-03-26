"use strict";

describe("Block", function(){

  var element, editor, block, block_two, block_three;

  SirTrevor.Blocks.ComplexType = SirTrevor.Block.extend({
    type: "complex_type"
  });

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    block = new SirTrevor.Blocks.Text({}, editor, editor.mediator);
    block_two = new SirTrevor.Blocks.Text({}, editor, editor.mediator);
    block_three = new SirTrevor.Blocks.ComplexType({}, editor, editor.mediator);
  });

  it("block is instance of ST.Block", function(){
    expect(block instanceof SirTrevor.Block).toBeTruthy();
  });

  it("can be able to be created", function(){
    expect(block).not.toBe(undefined);
  });

  it("has a type set", function(){
    expect(block.type.toLowerCase()).toBe("text");
  });

  it("has a unique identifier", function(){
    expect(block.blockID).not.toBe(block_two.blockID);
  });

  it("has a title", function(){
    expect(block.title()).toBe("Text");
  });

  it("correctly titleizes underscored types", function(){
    expect(block_three.title()).toBe("Complex Type");
  });

  describe("dom functions", function(){

    it("has an $el associated with it", function(){
      expect(block.$el).not.toBe(undefined);
    });

    it("has have a shorthand method for selecting elements under the $el", function(){
      expect(typeof block.$).toBe('function');
    });

  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'beforeBlockRender');
      spyOn(block, 'checkAndLoadData');

      block.render();
    });

    it("is renderable", function(){
      expect(typeof block.render).toBe('function');
    });

    it("has an $inner element", function(){
      expect(block.$inner).not.toBe(undefined);
    });

    it("has an $editor element", function(){
      expect(block.$editor).not.toBe(undefined);
    });

    it("has a ready class", function(){
      expect(block.$el.hasClass('st-item-ready')).toBe(true);
    });

    it("calls beforeBlockRender", function(){
      expect(block.beforeBlockRender).toHaveBeenCalled();
    });

    it("calls checkAndLoadData", function(){
      expect(block.checkAndLoadData).toHaveBeenCalled();
    });

    describe('initTextBlocks', function() {
      beforeEach(function() {
        spyOn(block, '_initTextBlocks');
      });

      it('is called when block has text block', function() {
        block.hasTextBlock = function() { return true; };

        block.render();

        expect(block._initTextBlocks).toHaveBeenCalled();
      });

      it('isn\'t called when block doesn\'t have text blocks', function() {
        block.hasTextBlock = function() { return false; };

        block.render();

        expect(block._initTextBlocks).not.toHaveBeenCalled();
      });
    });
  });

  describe("configuring Scribe", function() {
    describe("with a function (configureScribe)", function() {
      beforeEach(function(){
        block.configureScribe = function(scribe){
          scribe.allowBlockElements = false;
        };
        block.render();
      });

      it("configures scribe instance", function() {
        expect(block._scribe.allowBlockElements).toBe(false);
      });
    });

    describe("with an object (scribeOptions)", function() {
      beforeEach(function() {
        block.scribeOptions = {allowBlockElements: false};
        block.render();
      });

      it("instantiates scribe with options", function() {
        expect(block._scribe.options.allowBlockElements).toBe(false);
      });
    });
  });
});
