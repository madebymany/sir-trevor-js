describe("Validating a Block", function(){
  
  var form = $("<form></form>", {
    html: "<textarea></textarea><input type='submit'>"
  }), editor;
  
  beforeEach(function(){
    editor = new SirTrevor.Editor({ el: form.find('textarea') });
    editor.createBlock("text", {});
  });
  
  it("should run the default validator for each required block", function(){
    var required = editor.$form.find('.required').length,
        totalValidations = 0;
    
    _.each(editor.blocks, function(block){
      expect(block.validate()).not.toBe(true);
      totalValidations++;
    });
    
    expect(totalValidations).toBe(required);
  });
  
  it("should return true for blocks that are required and have content", function(){
    editor.blocks[0].$$('.text-block').html('This is some content within the block. Magic.');
    expect(editor.blocks[0].validate()).toBe(true);
  });
  
});