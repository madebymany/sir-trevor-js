"use strict";

describe("Editor:Submission", function(){

  var element, editor;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = global.createBaseElement();
    editor = new SirTrevor.Editor({
      el: element, defaultType: false
    });
  });

  describe('process', function(){

    describe('on successful queued items resolved', function(){

      it("returns a promise", function(){
        expect(editor.process()).toBeAPromise();
      });

      it("calls getData", function(){
        var getDataResponse = 'data';
        spyOn(editor, "getData").and.returnValue(getDataResponse);
        expect(editor.getData).not.toHaveBeenCalled();

        editor.process().then( function(response) {
          expect(editor.getData).toHaveBeenCalled();
          expect(response).toBe(getDataResponse);
        });
      });
    });
  });

  describe('getData', function(){

    it("calls reset and save on the store", function(){
      spyOn(editor.store, "reset");
      editor.getData();
      expect(editor.store.reset).toHaveBeenCalled();
    });

    it("calls the validateBlocks method", function(){
      spyOn(editor, "validateBlocks");
      editor.getData();
      expect(editor.validateBlocks).toHaveBeenCalled();
    });

    it("calls the validateBlockTypesExist method", function(){
      spyOn(editor.block_manager, "validateBlockTypesExist");
      editor.getData();
      expect(editor.block_manager.validateBlockTypesExist).toHaveBeenCalled();
    });

    it("calls toString on the store", function(){
      spyOn(editor.store, "toString");
      editor.getData();
      // Store gets called twice
      expect(editor.store.toString).toHaveBeenCalled();
    });
  });

});
