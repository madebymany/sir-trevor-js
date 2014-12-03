"use strict";

describe("SirTrevor.Submittable", function() {

  var submittable;
  var formTemplate = "<form><input type='submit' value='Go!'></form>";

  beforeEach(function() {
    submittable = new SirTrevor.Submittable($(formTemplate));
  });

  describe("submitBtn", function() {

    it("should be a jQuery element", function() {
      expect(submittable.submitBtn instanceof $).toBe(true);
    });

    it("should be an input btn", function() {
      expect(submittable.submitBtn[0].nodeName).toBe("INPUT");
    });

  });

  describe("submitBtnTitles", function() {

    it("has the initial title for the submitBtn", function() {
      expect(submittable.submitBtnTitles).toContain("Go!");
    });

  });

  describe("_disableSubmitButton", function() {

    beforeEach(function(){
      submittable._disableSubmitButton();
    });

    it("should set a disabled attribute", function() {
      expect(submittable.submitBtn.attr('disabled')).toBe('disabled');
    });

    it("should set a disabled class", function() {
      expect(submittable.submitBtn.hasClass('disabled')).toBe(true);
    });

  });

  describe("_enableSubmitButton", function() {

    beforeEach(function(){
      submittable._disableSubmitButton();
      submittable._enableSubmitButton();
    });

    it("shouldn't set a disabled attribute", function() {
      expect(submittable.submitBtn.attr('disabled')).toBe(undefined);
    });

    it("shouldn't have a disabled class", function() {
      expect(submittable.submitBtn.hasClass('disabled')).toBe(false);
    });

  });

  describe("setSubmitButton", function() {

    it("Adds the title provided", function() {
      submittable.setSubmitButton(null, "YOLO");
      expect(submittable.submitBtn.attr('value')).toBe('YOLO');
    });

  });


  describe("resetSubmitButton", function() {

    beforeEach(function() {
      submittable.setSubmitButton(null, "YOLO");
      submittable.resetSubmitButton();
    });

    it("should reset the title back to its previous state", function() {
      expect(submittable.submitBtn.attr('value')).toContain("Go!");
    });

  });

});
