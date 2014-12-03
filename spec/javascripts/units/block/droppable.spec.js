"use strict";

describe("Block:Droppable Block", function(){

  var element, editor, block;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });

    SirTrevor.Blocks.DroppableBlock = SirTrevor.Block.extend({
      droppable: true
    });

    block = new SirTrevor.Blocks.DroppableBlock({}, editor.ID, editor.mediator);
  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'withMixin').and.callThrough();
      block = block.render();
    });

    it("gets the droppable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.Droppable);
    });

    it("adds a droppable class to $inner", function(){
      expect(block.$inner.hasClass('st-block__inner--droppable'));
    });

    it("creates an $inputs element", function(){
      expect(block.$inputs)
        .not.toBe(undefined);
    });

    it("appends the html to the inputs element", function(){
      expect(block.$inputs.find('.st-block__dropzone').length)
        .toBe(1);
    });

  });

});
