"use strict";

describe("Editor:Submission", function(){

  var element, editor;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
    editor = new SirTrevor.Editor({
      el: element, defaultType: false
    });
  });

  it("calls reset and save on the store", function(){
    spyOn(editor.store, "reset");
    editor.onFormSubmit();
    expect(editor.store.reset).toHaveBeenCalled();
  });

  it("calls the validateBlocks method", function(){
    spyOn(editor, "validateBlocks");
    editor.onFormSubmit();
    expect(editor.validateBlocks).toHaveBeenCalled();
  });

  it("calls the validateBlockTypesExist method", function(){
    spyOn(editor.block_manager, "validateBlockTypesExist");
    editor.onFormSubmit();
    expect(editor.block_manager.validateBlockTypesExist).toHaveBeenCalled();
  });

  it("calls toString on the store", function(){
    spyOn(editor.store, "toString");
    editor.onFormSubmit();
    // Store gets called twice
    expect(editor.store.toString).toHaveBeenCalled();
  });

});
