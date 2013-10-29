describe("Submission", function(){

  var element, editor, block;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
    editor = new SirTrevor.Editor({
      el: element, defaultType: false
    });
  });

  it("calls reset on the store", function(){
    spyOn(editor, "store");
    editor.onFormSubmit();
    // Store gets called twice
    expect(editor.store.calls[0].args[0]).toEqual("reset");
  });

  it("calls the validateBlocks method", function(){
    spyOn(editor, "validateBlocks");
    editor.onFormSubmit();
    expect(editor.validateBlocks).toHaveBeenCalled();
  });

  it("calls the validateBlockTypesExist method", function(){
    spyOn(editor, "validateBlockTypesExist");
    editor.onFormSubmit();
    expect(editor.validateBlockTypesExist).toHaveBeenCalled();
  });

  it("calls save on the store", function(){
    spyOn(editor, "store");
    editor.onFormSubmit();
    // Store gets called twice
    expect(editor.store.calls[1].args[0]).toEqual("save");
  });

});