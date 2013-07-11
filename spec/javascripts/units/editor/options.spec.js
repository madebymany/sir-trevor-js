describe("Editor with options", function(){

  var element, editor;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
  });

  describe("setting required blocks", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({ el: element, required: ['Text'] });
    });

    it("has an array of required blocks", function(){
      expect(editor.required).not.toBe(false);
    });

    it("has the options passed in the array", function(){
      expect(editor.required).toContain('Text');
    });

  });

  describe("setting available block types", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        blockTypes: ['Text']
      });
    });

    it("sets the object to the specified option", function(){
      expect(editor.blockTypes.Text).toBeTruthy();
    });

    it("won't be the default set of blocks", function(){
      expect(editor.blockTypes).not.toBe(SirTrevor.Blocks);
    });

  });

  describe("setting the block type limits", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        blockTypeLimits: { 'Text': 1 }
      });
    });

    it("sets the options to the specified value", function(){
      expect(editor.options.blockTypeLimits.Text).toBe(1);
    });

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
    });

    it("creates a default block of a type specified", function(){
      expect(editor.blocks.length).toBe(1);
      expect(editor._getBlockTypeCount('Text')).toBe(1);
    });

  });

});