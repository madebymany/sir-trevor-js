describe("a Text Block", function(){
  
  var element, editor;
    
  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    // Remove default
    editor.removeBlock(editor.blocks[0]);
  });
  
  it("should be able to be created", function(){
    var l = editor.blocks.length;
    editor.createBlock("Text");
    expect(editor.blocks.length).toBe(l + 1);
  });
  
  it("should set the editor field when some data is provided", function(){
    editor.createBlock("Text", { text: "Testing" });
    var block = editor.blocks[0];
    expect(block.$$('.text-block').text()).toBe("Testing");
  });
  
  it("should not validate if it's empty", function(){
    editor.createBlock("Text");
    var block = editor.blocks[0];
    expect(block.validate()).not.toBe(true);
  });
  
});