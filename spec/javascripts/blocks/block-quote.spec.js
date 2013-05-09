describe("a Quote block", function(){
  
  var element, editor;
    
  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    // Remove default
    editor.removeBlock(editor.blocks[0]);
  });
  
  it("should be able to be created", function(){
    var l = editor.blocks.length;
    editor.createBlock("Quote");
    expect(editor.blocks.length).toBe(l + 1);
  });
  
  it("should be able to be reconstructed from JSON data", function(){
    editor.createBlock("Quote", { text: "> Quote", cite: "Author" });
    var block = editor.blocks[0];
    
    expect(block.$$('.text-block').text()).toBe('Quote');
    expect(block.$$('input').val()).toBe('Author');
  });
  
  it("should have a maxlength attribute on the input for the cite", function(){
    editor.createBlock("Quote");
    var block = editor.blocks[0];
    expect(block.$$('input').attr('data-maxlength')).not.toBe(false);
  });
  
  it("should have the quote field correctly parsed to markdown", function(){
    editor.createBlock("Quote");
    var block = editor.blocks[0];
    
    block.$$('.text-block').html('This is a sample quote');
    block.$$('input').val('Author');
    
    var data = block.save();
    
    // We expect the quote to have a '>'
    expect(data.data.text.substr(0,1)).toBe('>');
  });
  
});