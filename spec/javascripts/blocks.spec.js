describe("a Block", function(){
  
  var element = $("<textarea>"),
      editor = new SirTrevor.Editor({ el: element }),
      block = new SirTrevor.Blocks.Text(editor,{}),
      block_drop = new SirTrevor.Blocks.Tweet(editor,{}),
      block_two = new SirTrevor.Blocks.Text(editor,{});
      
  it("should be able to be created", function(){
    expect(block).not.toBe(undefined);
  });
  
  it("should have a type set", function(){
    expect(block.type).toBe("Text");
  });
  
  it("should belong to a SirTrevor.Editor instance", function(){
    expect(block.instance).toBe(editor);
    expect(typeof block.instance).toBe(typeof editor); // triple check types
  });
  
  it("should have a unique identifier", function(){
    expect(block.blockID).not.toBe(block_two.blockID);
  });
  
  it("should have an $el associated with it", function(){
    expect(block.$el).not.toBe(undefined);
  });
  
  it("should have an $editor element associated with it, that contains the editorHTML", function(){
    expect(block.$editor).not.toBe(undefined);
    expect(block.$editor.hasClass('sir-trevor-editor-block')).toBe(true);
  });
  
  it("should have an empty data state given no data was passed to it", function(){
    expect(block.getData().text).toBe(undefined);
  });
  
  it("given some data in the block and the save method has been called, the data state should reflect this", function(){
    block.$editor.find('.text-block').html('Test');
    block.save();
    expect(block.getData().text).toBe("Test");
  });
  
  it("should have the block type serialized in the data of the element", function(){
    expect(block.store("read", block).type).toBe("text");
  });
  
  it("should have a $dropzone element set if the dropzone is enabled", function(){
    expect(block_drop.$dropzone).not.toBe(undefined);
  });
  
  it("should have a shorthand method for selecting elements under the $el", function(){
    expect(typeof block.$).toBe('function');
  });
  
  it("should have a shorthand method for selecting elements under the $editor", function(){
    expect(typeof block.$$).toBe('function');
  });
  
  it("should have a handle to drag it", function(){
    expect(block.$('.handle')).not.toBe(undefined);
  });
  
  it("should have delete button to remove it", function(){
    expect(block.$('.delete')).not.toBe(undefined);
  });
  
  
});