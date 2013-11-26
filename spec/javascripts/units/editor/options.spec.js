describe("Editor::Editor with options", function(){

  var element, editor;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
  });

  describe("setting the defaultType", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        defaultType: 'Text'
      });

      spyOn(editor.mediator, 'trigger');
    });

    it("is not false", function() {
      expect(editor.options.defaultType).not.toBe(false);
    });

    it("creates a default block of a type specified", function() {
      editor.createBlocks();
      expect(editor.mediator.trigger).toHaveBeenCalledWith('block:create', 'Text', {});
    });

  });

});