describe("a Video Block", function(){
  
  var element, editor;
    
  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    // Remove default
    editor.removeBlock(editor.blocks[0]);
  });
  
  it("should be able to be created", function(){
    var l = editor.blocks.length;
    editor.createBlock("Video");
    expect(editor.blocks.length).toBe(l + 1);
  }); 
});