describe("Validations", function(){

  var element, editor, block;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
    editor = new SirTrevor.Editor({
      el: element, defaultType: false,
      required: ["Text"]
    });
  });

  describe("required block types", function(){

    it("will error if a required block is missing", function(){
      var result = editor.onFormSubmit();
      expect(result).toBe(1);
    });

    it("will error if a required block is empty", function(){
      block = createBlock();
      var result = editor.onFormSubmit();
      expect(result).toBe(1);
    });

    it("won't error if a required block has text", function(){
      block = createBlock({ text: "Test" });
      var result = editor.onFormSubmit();
      expect(result).toBe(0);
    });

  });

  function createBlock(data) {
    editor.createBlock('Text', data || {});
    return _.last(editor.blocks);
  }

});