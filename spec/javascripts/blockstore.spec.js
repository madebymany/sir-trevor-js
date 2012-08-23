describe("Block Store", function(){
  
  var element = $("<textarea>"),
       editor = new SirTrevor.Editor({ el: element }),
       block = new SirTrevor.Blocks.Text(editor,{});
       // Create
       editor.createBlock("Text", { text: "blah" });
       
  
  it("should setup the dataStore object on the Block", function(){
    expect(block.dataStore).not.toBe(undefined);
  });
  
  it("should have data in it when provided with some existing data", function(){
    expect(editor.blocks[1].dataStore.data.text).toBe("blah");
  });
  
  it("should retrieve the stored data", function(){
    expect(editor.blocks[1].store("read", editor.blocks[1]).data.text).toBe("blah");
    expect(editor.blocks[1].getData().text).toBe("blah");
  });
  
  it("should set the data on a block when data is given", function(){
    block.store("save", block, { data: { text: "Test" }});
    expect(block.getData().text).toBe("Test");
  });
  
  it("should not save data if no data is given", function(){
    block.store("save", block, {});
    // Existing value
    expect(block.getData().text).toBe("Test");
  });
  
  it("should save the data on the block when save data is called", function(){
    block.setData({ text: "Boom" });
    expect(block.getData().text).toBe("Boom");
  });
  
  it("should return the data object (minus the type) when the getData function is called", function(){
    block.setData({ text: "Boom" });
    expect(block.getData().type).toBe(undefined);
  });
  
  it("should return the whole data object when the object is read from the store", function(){
    block.setData({ text: "Boom" });
    expect(block.store("read", block).type).not.toBe(undefined);
    expect(block.store("read", block).type).toBe("text");
  });
  
  it("should store the blocks state when the save method is invoked on the block", function(){
    block.$$('.text-block').html("Hello, this is a test");
    var data = block.save();
    expect(data.data.text).toBe("Hello, this is a test");
    expect(block.store("read", block).data.text).toBe("Hello, this is a test");
  });
});