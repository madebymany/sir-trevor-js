"use strict";

describe("Block:Pastable Block", function(){

  var element, editor, block;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });

    SirTrevor.Blocks.PastableBlock = SirTrevor.Block.extend({
      pastable: true
    });

    block = new SirTrevor.Blocks.PastableBlock({}, editor.ID, editor.mediator);
  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'withMixin').and.callThrough();
      block = block.render();
    });

    it("gets the pastable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.Pastable);
    });

    it("creates an $inputs element", function(){
      expect(block.$inputs)
        .not.toBe(undefined);
    });

    it("appends the html to the inputs element", function(){
      expect(block.$inputs.find('.st-paste-block').length)
        .toBe(1);
    });

  });

});
