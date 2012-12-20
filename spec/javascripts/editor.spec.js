describe("a SirTrevor.Editor instance", function(){
  
  var editor, editor_with_options, element = $("<textarea>");
  
  beforeEach(function (){
    
    editor = new SirTrevor.Editor();
    
    editor_with_options = new SirTrevor.Editor(
      { 
        el: element, 
        defaultCSSClass: "test-class", 
        blockTypeLimits: { 
          "Text": 1 
        },
        onEditorRender: function(){ return "Test"; } 
      }
    );
    
  });
  
  afterEach(function (){
    delete editor;
    editor_with_options = null;
  });
  
  it("should fail if no element is passed", function() {
    expect(editor.$el).toBe(undefined);
    expect(editor.el).toBe(undefined);
  });
  
  it("should have a unique identifier", function(){
    expect(editor_with_options.ID).not.toBe(editor.ID);
  });
  
  it("should set el and $el to the element passed in", function() {
    expect(editor_with_options.$el).toBe(element);
    expect(editor_with_options.el).toBe(element[0]);
  });
  
  it("should overwrite the options for the values passed in", function(){
    expect(editor_with_options.options.defaultCSSClass).toBe("test-class");
  });
  
  it("should have all default block types available if none are explicity passed", function() {
    var blockTypes = ["Text", "Quote", "Ul"],
        avail;

    for (var i = blockTypes.length - 1; i >= 0; i--){
      avail = editor_with_options._blockTypeAvailable(blockTypes[i]);
      expect(avail).toBe(true);
    }
  });
  
  it("should have all default formatters available if none are explicity passed", function() {
    var formats = ["Bold", "Italic", "Link", "Unlink"],
        avail;

    for (var i = formats.length - 1; i >= 0; i--){
      avail = editor_with_options._formatterAvailable(formats[i]);
      expect(avail).toBe(true);
    }
  });
  
  it("should not be able to access a blockType that doesn't exist", function(){
    expect(editor_with_options._blockTypeAvailable("FakeBlockType")).toBe(false);
  });
  
  it("should not be able to access a formatter that doesn't exist", function(){
    expect(editor_with_options._formatterAvailable("FakeFormatter")).toBe(false);
  });
  
  it("should create a default block when there is no JSON provided in the element", function(){
    // The blocks object on the editor should contain the default block
    expect(editor_with_options.blockCounts[editor_with_options.options.defaultType]).toBe(1); 
  });
  
  it("should be able to create a block of an available type", function(){
    var type = "Text";
    editor_with_options.createBlock(type, {});
    expect(editor_with_options.blockCounts[type]).toBe(2); // Default block and this block
  });
  
  it("should not be possible to create a block if the editor specific block limits have been exceeded", function(){
    
    var type = "Text";
    editor_with_options.createBlock(type, {});
    expect(editor_with_options.blockCounts[type]).toBe(2); // Default block and this block
    
    editor_with_options.createBlock(type, {});
    expect(editor_with_options.blockCounts[type]).toBe(2); // And another block
    
  });
  
  it("should have an onEditorRender if the function was provided", function(){
    expect(editor.onEditorRender).toBe(undefined);
    expect(editor_with_options.onEditorRender).not.toBe(undefined);
    expect(editor_with_options.onEditorRender()).toBe("Test");
  });
  
  it("should add a block to the blocks array when createBlocks is called", function(){
    var currentBlockCount = editor_with_options.blocks.length;
    editor_with_options.createBlock("Image", {});
    expect(editor_with_options.blocks.length).toBe(currentBlockCount + 1);
  });
  
  it("should remove a block from the blocks array when removeBlock is called", function(){
    editor_with_options.createBlock("Text", {});
    var block = editor_with_options.blocks[1];
    expect(block).not.toBe(undefined);
    editor_with_options.removeBlock(block);
    expect(editor_with_options.blocks[1]).toBe(undefined);
  });
  
  it("should run on all instances with arguments passed as extra parameters", function() {
    SirTrevor.runOnAllInstances("createBlock", "image");
    SirTrevor.instances.forEach(function(instance){
      expect(instance.blockTypes.Image).toBe(true);
    })
  });
});