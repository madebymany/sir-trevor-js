describe("when creating a BlockType", function(){
  
  var NewBlockType;
  
  beforeEach(function (){
    var template = "<div></div>"; 
    NewBlockType = SirTrevor.BlockType.extend({

      editorHTML: function(){
        return _.template(template, this);
      },

      loadData: function(data){
        return "Test";
      },

      validate: function(){
        return "Test";
      },

      toData: function(){
        return "Test";
      },
      
      anUnsualFunction: function(){
        return "I like this function";
      },

      aNiceVariable: true
    });
    
    SirTrevor.BlockTypes.NewBlockType = new NewBlockType();
    
  });
  
  afterEach(function(){
    SirTrevor.BlockTypes.NewBlockType = null;
    delete SirTrevor.BlockTypes.NewBlockType;
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
  
  it("should be possible to add any function to the blockType", function(){
    expect(SirTrevor.BlockTypes.NewBlockType.anUnsualFunction).not.toBe(undefined);
  });
  
  it("should be possible to add any variable to the blockType", function(){
    expect(SirTrevor.BlockTypes.NewBlockType.aNiceVariable).not.toBe(undefined);
  });
  
});