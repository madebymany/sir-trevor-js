describe("a SirTrevor.Editor instance", function(){
  
  var editor = new SirTrevor.Editor(),
      element = $("<textarea>");
  
  it("should fail if no element is passed", function() {
    expect(editor.$el).toBe(undefined);
    expect(editor.el).toBe(undefined);
  });
  
  var editor_with_options = new SirTrevor.Editor({ el: element, defaultCSSClass: "test-class" });
  
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
    var blockTypes = ["TextBlock", "BlockQuote", "OrderedList", "UnorderedList"],
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
    expect(editor_with_options.blocks[editor_with_options.options.defaultType].length).toBe(1); 
  });
  
  it("should be able to create a block of an available type", function(){
    var type = "TextBlock";
    editor_with_options.createBlock(type, {});
    expect(editor_with_options.blocks[type].length).toBe(2); // Default block and this block
  });
  
});