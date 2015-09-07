"use strict";

describe("Block:Validation", function(){
  var element, editor, block;

  beforeEach(function(){
    element = global.createBaseElement();
    editor = new SirTrevor.Editor({ el: element });
    block = new SirTrevor.Blocks.Text({}, editor.ID, editor.mediator);
    block.render();
  });

  describe("valid", function(){

    beforeEach(function(){
      block.performValidations = function(){};

      spyOn(block, "performValidations");
    });

    it("will return true if there are no errors", function(){
      expect(block.valid()).toBe(true);
    });

    it("will return false if there are errors", function(){
      block.errors.push(1);
      expect(block.valid()).toBe(false);
    });

    it("will call the performValidations method on calling valid", function(){
      block.valid();
      expect(block.performValidations).toHaveBeenCalled();
    });

  });

  describe("performValidations", function(){

    beforeEach(function(){
      block.validations = ['testValidator'];
      block.testValidator = function(){};
      block.resetErrors = function(){};
      spyOn(block, "testValidator");
      spyOn(block, "resetErrors");

      block.performValidations();
    });

    it("will call any custom validators in the validations array", function(){
      expect(block.testValidator).toHaveBeenCalled();
    });

    it("will call resetErrors", function(){
      expect(block.resetErrors).toHaveBeenCalled();
    });

  });

  describe("validateField", function(){

    var block2, field;

    beforeEach(function(){
      block2 = new SirTrevor.Blocks.Text({}, editor.ID, editor.mediator);
      block2.editorHTML = '<input name="text" data-primitive="input" data-required="true" />';
      block2.render();

      block2.setError = function(field, reason){};
      spyOn(block2, "setError");

      field = block2.getPrimitivesArray()[0];
    });

    it("will call setError if the field has no content", function(){
      block2.validateField(field);
      expect(block2.setError).toHaveBeenCalled();
    });

    it("will won't call setError if the field has content", function(){
      field.setContent("Test");
      block2.validateField(field);
      expect(block2.setError).not.toHaveBeenCalled();
    });

  });

});
