describe("a Block", function(){
  
  var element = $("<textarea>"),
      editor = new SirTrevor.Editor({ el: element }),
      parent = SirTrevor.BlockTypes.TextBlock,
      block = new SirTrevor.Block(editor, parent, {}),
      block_two = new SirTrevor.Block(editor, parent, { });
      
  it("should be able to be created", function(){
    expect(block).not.toBe(undefined);
  });
  
  it("should have a parent blockType", function(){
    expect(block.blockType).toBe(parent);
    expect(typeof block.blockType).toBe(typeof parent);
  });
  
  it("should have a type set", function(){
    expect(block.type).toBe("TextBlock");
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
  
  it("should have an empty data state given no data was passed to it", function(){
    expect(block.$el.data('block').data.text).toBe(undefined);
  });
  
  it("given some data in the block and the save method has been called, the data state should reflect this", function(){
    block.$el.find('.text-block').html('Test');
    block.save();
    expect(block.$el.data('block').data.text).toBe("Test");
  });
  
  it("should have the block type serialized in the data of the element", function(){
    expect(block.$el.data('block').type).toBe("TextBlock");
  });
});