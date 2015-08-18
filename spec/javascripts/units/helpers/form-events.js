"use strict";

describe("Form Events", function(){

  var element, editor;

  beforeEach(function(){
    element = global.createBaseElement();
  });

  describe("onFormSubmit", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        formEvents: true
      });
    });

    describe('canSubmit=true', function(){
      it("returns true directly", function(){
        var response = editor.formEvents.onFormSubmit();
        expect(response).toBe(true);
      });
    });

    describe('canSubmit=false', function(){

      it("returns null", function(){
        spyOn(editor, 'getData').and.returnValue({canSubmit: false});
        var response = editor.formEvents.onFormSubmit({preventDefault: function(){}});
        expect(response).toBeUndefined();
      });

      it("should updates element.value and not trigger form submit", function(done){

        var promise = Promise.resolve({data: 'data', canSubmit: false});

        spyOn(editor, 'getData').and.returnValue({canSubmit: false});
        spyOn(editor, 'process').and.returnValue( promise );
        spyOn(editor.formEvents.form, 'dispatchEvent');

        editor.formEvents.onFormSubmit({preventDefault: function(){}});

        promise.then( function(response) {
          expect(editor.el.value).toBe(response.data);
          expect(editor.formEvents.form.dispatchEvent).not.toHaveBeenCalled();
          done();
        });
        
      });

      it("should trigger form submit if process() returns canSubmit=true", function(done){

        var promise = Promise.resolve({data: 'data', canSubmit: true});

        spyOn(editor, 'getData').and.returnValue({canSubmit: false});
        spyOn(editor, 'process').and.returnValue( promise );
        spyOn(editor.formEvents.form, 'dispatchEvent');

        editor.formEvents.onFormSubmit({preventDefault: function(){}});

        promise.then( function(response) {
          expect(editor.formEvents.form.dispatchEvent).toHaveBeenCalled();
          done();
        });
        
      });

    });

  });

});
