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

  describe("setting the formatBarContainer", function(){
    it('appends the formatBar to the container specified', function(){
      var formatBarContainer = $('<div/>');

      editor = new SirTrevor.Editor({
        el: element,
        formatBarContainer: formatBarContainer
      });

      expect(editor.formatBar.el.parentNode).toBe(formatBarContainer[0]);
    });

    it('appends formatBar to document.body if no container specified', function() {
      editor = new SirTrevor.Editor({ el: element });

      expect(editor.formatBar.el.parentNode).toBe(document.body);
    });
  });
});
