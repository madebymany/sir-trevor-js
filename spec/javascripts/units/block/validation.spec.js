"use strict";

describe("Block:Validation", function(){
  var element, editor, block;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    block = new SirTrevor.Blocks.Text({}, editor.ID, editor.mediator);
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

    var $field;

    beforeEach(function(){
      $field = $("<input>");
      block.setError = function(field, reason){};
      spyOn(block, "setError");
    });

    it("will call setError if the field has no content", function(){
      block.validateField($field);
      expect(block.setError).toHaveBeenCalled();
    });

    it("will won't call setError if the field has content", function(){
      $field.val("Test");
      block.validateField($field);
      expect(block.setError).not.toHaveBeenCalled();
    });

  });

});
