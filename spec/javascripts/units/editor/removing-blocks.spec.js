describe("Removing blocks on the Editor", function(){

  var element, editor;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element, defaultType: false });

    editor.createBlock('Text');
  });

  it("removes the block from the blocks array", function(){
    editor.removeBlock(editor.blocks[0].blockID);
    expect(editor.blocks.length).toBe(0);
  });

  it("decrements the block type count", function(){
    editor.removeBlock(editor.blocks[0].blockID);
    expect(editor.blockCounts.Text).toBe(0);
  });

});