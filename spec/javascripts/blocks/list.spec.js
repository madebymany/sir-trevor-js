describe("a List Block", function(){
  
  var element, editor;
    
  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    // Remove default
    editor.removeBlock(editor.blocks[0]);
  });
  
  it("should be able to be created", function(){
    var l = editor.blocks.length;
    editor.createBlock("Ul");
    expect(editor.blocks.length).toBe(l + 1);
  });
  
  it("should set the editor field when some data is provided", function(){
    editor.createBlock("Text", { text: "- Testing\n\n- Test\n\n" });
    var block = editor.blocks[0];
    console.log(block);
  });  
});