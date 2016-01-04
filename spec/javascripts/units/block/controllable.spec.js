"use strict";

describe("Controllable Block", function(){

  var element, editor, block, testHandler;

  beforeEach(function(){
    element = global.createBaseElement();
    editor  = new SirTrevor.Editor({
      el: element,
      blockTypes: ["Text"]
    });

    testHandler = jasmine.createSpy();

    SirTrevor.Blocks.ControllableBlock = SirTrevor.Block.extend({
      controllable: true,
      controls: {
        'test': testHandler
      }
    });

    block = new SirTrevor.Blocks.ControllableBlock({}, editor.ID, editor.mediator);
  });

  afterEach(function(){
    delete SirTrevor.Blocks.ControllableBlock;
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

    it("adds an element to control_ui", function(){
      expect(block.control_ui.querySelectorAll('.st-block-control-ui-btn').length)
        .toBe(1);
    });

    xit("runs the handler on click", function(){
      var event = new MouseEvent("click");

      block.control_ui.querySelector('.st-block-control-ui-btn').dispatchEvent(event);
      expect(testHandler)
        .toHaveBeenCalled();
    });

  });

});
