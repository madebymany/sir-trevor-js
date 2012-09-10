describe("Validating a Block", function(){
  
  var form = $("<form></form>", {
    html: "<textarea></textarea><input type='submit'>"
  }), editor;
  
  beforeEach(function(){
    editor = new SirTrevor.Editor({ el: form.find('textarea'), required: ["Text", "Image"] });
    editor.createBlock("text", {});
  });
  
  afterEach(function (){
    delete editor;
    editor_with_options = null;
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
  
  it("should validate for the required blockTypes if required are given", function(){
    expect(editor.required).not.toBe(undefined);
    var validate = editor.onFormSubmit();
    expect(validate.length).not.toBe(0);
  });
  
  it("should display a message when the required blockTypes are not given", function(){
    // Delete the text block and default block
    editor.removeBlock(editor.blocks[0]);
    editor.removeBlock(editor.blocks[0]);
        
    expect(editor.blocks.length).toBe(0);
    
    editor.onFormSubmit();
    var errorsCont = editor.$outer.find('.' + editor.options.baseCSSClass + "-errors"),
        errors = errorsCont.find('li');
        
    expect(errors.length).not.toBe(0);
  });
  
  it("should display a message when the required blockTypes are empty", function(){
    editor.createBlock("image");
    
    editor.onFormSubmit();
    var errorsCont = editor.$outer.find('.' + editor.options.baseCSSClass + "-errors"),
        errors = errorsCont.find('li');
        
    expect(errors.length).not.toBe(0);
  });
  
  it("should skip validation when passing false to onBeforeSubmit", function(){
    editor.createBlock("image");
    editor.onFormSubmit(false);
    
    var errorsCont = editor.$outer.find('.' + editor.options.baseCSSClass + "-errors"),
        errors = errorsCont.find('li');
        
    expect(errors.length).toBe(0);
  });

});