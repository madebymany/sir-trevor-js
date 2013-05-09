describe("JSON parsing in a SirTrevor.Editor instance", function(){
  
  element = $("<textarea>");
  
  it("should be able to render valid available blocks from JSON given", function(){
    
    var JSON_Str = {"data":[{"type":"text","data":{"text":"This is some test content"}}]};
    element.val(JSON.stringify(JSON_Str));
    
    var editor = new SirTrevor.Editor({ el: element });
    
    expect(editor.blocks.length).toBe(1);
    expect(editor.blocks[0].getData().text).toBe("This is some test content");
  
  });
  
  it("should not create a block from a type it doesn't know about", function(){
    var JSON_Str = {"data":[{"type":"FakeBlockType","data":{}}]};
    element.val(JSON.stringify(JSON_Str));
    
    var editor = new SirTrevor.Editor({ el: element });
    
    // We can't create this block
    expect(editor.blocks.length).toBe(0);
    expect(editor.blockCounts.FakeBlockType).toBe(undefined);
  });
  
  it("should create a default block when an invalid JSON string is provided", function(){
    
    var JSON_Str = "{\"adsadassaas\": asddasdasada}";
    element.val(JSON.stringify(JSON_Str));
    
    var editor = new SirTrevor.Editor({ el: element });
    expect(editor.blocks.length).toBe(1);
    expect(editor.blockCounts[editor.options.defaultType]).toBe(1);
  });
  
  
  
});