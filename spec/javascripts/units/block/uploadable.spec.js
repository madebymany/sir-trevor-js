"use strict";

describe("Block:Uploadable Block", function(){

  var element, editor, block;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });

    SirTrevor.Blocks.UploadableBlock = SirTrevor.Block.extend({
      uploadable: true
    });

    block = new SirTrevor.Blocks.UploadableBlock({}, editor.ID, editor.mediator);
  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'withMixin').and.callThrough();

      block = block.render();
    });

    it("gets the uploadable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.Uploadable);
    });

    it("creates an $inputs element", function(){
      expect(block.$inputs)
        .not.toBe(undefined);
    });

    it("appends the html to the inputs element", function(){
      expect(block.$inputs.find('.st-block__upload-container').length)
        .toBe(1);
    });

  });

});
