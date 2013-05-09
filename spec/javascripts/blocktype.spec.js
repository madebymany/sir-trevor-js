describe("when creating a BlockType", function(){
  
  var NewBlockType;
  
  beforeEach(function (){
    var template = "<div></div>"; 
    SirTrevor.Blocks.NewBlockType = SirTrevor.Block.extend({

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
  });
  
  afterEach(function(){
    SirTrevor.Blocks.NewBlockType = null;
    delete SirTrevor.Blocks.NewBlockType;
  });
  
  it("should be possible to create a new BlockType", function(){
    expect(SirTrevor.Blocks.NewBlockType).not.toBe(undefined);
  });
  
  it("should be able to specify a function for the editorHTML", function(){
    expect(SirTrevor.Blocks.NewBlockType.prototype.editorHTML()).toBe("<div></div>");
  });
  
  it("should be possible to override the loadData function", function(){
    expect(SirTrevor.Blocks.NewBlockType.prototype.loadData()).toBe("Test");
  });
  
  it("should be possible to override the validate function", function(){
    expect(SirTrevor.Blocks.NewBlockType.prototype.validate()).toBe("Test");
  });
  
  it("should be possible to override the toData function", function(){
    expect(SirTrevor.Blocks.NewBlockType.prototype.toData()).toBe("Test");
  });
  
  it("should be possible to add any function to the blockType", function(){
    expect(SirTrevor.Blocks.NewBlockType.prototype.anUnsualFunction).not.toBe(undefined);
  });
  
  it("should be possible to add any variable to the blockType", function(){
    expect(SirTrevor.Blocks.NewBlockType.prototype.aNiceVariable).not.toBe(undefined);
  });
  
});