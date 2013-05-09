describe("when creating a Formatter", function(){
  
  var Formatter;
  
  beforeEach(function (){
    var template = "<div></div>"; 
    
    Formatter = SirTrevor.Formatter.extend({
    
      anUnsualFunction: function(){
        return "I like this function";
      },
      
      onClick: function(){
        return 'Yes!';
      },

      aNiceVariable: true
    });
    
    SirTrevor.Formatters.Formatter = new Formatter();
  });
  
  afterEach(function(){
    SirTrevor.Formatters.Formatter = null;
    delete SirTrevor.Formatters.Formatter;
  });
  
  it("should be possible to create a new Formatter", function(){
    expect(SirTrevor.Formatters.Formatter).not.toBe(undefined);
  });
  
  
  it("should be possible to override the onClick function of the Formatter", function(){
    expect(SirTrevor.Formatters.Formatter.onClick()).toBe("Yes!");
  });
  
  it("should be possible to add any function to the formatter", function(){
    expect(SirTrevor.Formatters.Formatter.anUnsualFunction).not.toBe(undefined);
  });
  
  it("should be possible to add any variable to the blockType", function(){
    expect(SirTrevor.Formatters.Formatter.aNiceVariable).not.toBe(undefined);
  });
  
});