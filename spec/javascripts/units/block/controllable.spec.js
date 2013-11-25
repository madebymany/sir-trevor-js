"use strict";

describe("Controllable Block", function(){

  var element, editor, block, testHandler;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });

    testHandler = jasmine.createSpy();

    SirTrevor.Blocks.ControllableBlock = SirTrevor.Block.extend({
      controllable: true,
      controls: {
        'test': testHandler
      }
    });

    block = new SirTrevor.Blocks.ControllableBlock({}, editor.ID, editor.mediator);
  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'withMixin').and.callThrough();
      block.render();
    });

    it("gets the controllable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.Controllable);
    });

    it("adds an element to $control_ui", function(){
      expect($(block.$control_ui).find('.st-block-control-ui-btn').length)
        .toBe(1);
    });

    it("runs the handler on click", function(){
      $(block.$control_ui.find('.st-block-control-ui-btn')).trigger('click');
      expect(testHandler)
        .toHaveBeenCalled();
    });

  });

});
