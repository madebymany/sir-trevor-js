describe("when creating a BlockType", function(){
  
  var template = "<div></div>"; 
  var NewBlockType = SirTrevor.BlockTypes.NewBlockType = new SirTrevor.BlockType({
    
    editorHTML: function(){
      return _.template(template, this);
    },
    
    loadData: function(block, data){
      return "Test";
    },
    
    validate: function(block){
      return "Test";
    },
    
    toData: function(block){
      return "Test";
    }
    
  });
  
  it("should be possible to create a new BlockType", function(){
    expect(SirTrevor.BlockTypes.NewBlockType).not.toBe(undefined);
  });
  
  it("should be able to specify a function for the editorHTML", function(){
    expect(SirTrevor.BlockTypes.NewBlockType.editorHTML()).toBe("<div></div>");
  });
  
  it("should be possible to override the loadData function", function(){
    expect(SirTrevor.BlockTypes.NewBlockType.loadData()).toBe("Test");
  });
  
  it("should be possible to override the validate function", function(){
    expect(SirTrevor.BlockTypes.NewBlockType.validate()).toBe("Test");
  });
  
  it("should be possible to override the toData function", function(){
    expect(SirTrevor.BlockTypes.NewBlockType.toData()).toBe("Test");
  });
  
});