"use strict";

describe("Editor:Editor with options", function(){

  var element, editor;

  beforeEach(function(){
    SirTrevor.config.instances = [];
    element = $("<textarea>");
  });

  describe("setting the block limit", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        blockLimit: 1
      });
    });

    it("sets the limit to the specified option", function(){
      expect(editor.options.blockLimit).toBe(1);
    });

  });

  describe("setting the defaultType", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        defaultType: 'Text'
      });
      spyOn(editor.mediator, 'trigger');
    });

    it("is not false", function(){
      expect(editor.options.defaultType).not.toBe(false);
    });

    it("creates a default block of a type specified", function(){
      editor.createBlocks();
      expect(editor.mediator.trigger).toHaveBeenCalledWith(
        'block:create', 'Text', {});
    });

  });

});
