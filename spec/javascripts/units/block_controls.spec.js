"use strict";

describe("BlockControls", function(){

  describe("creating a new instance", function(){

    var block_control, mediator;

    beforeEach(function(){
      mediator = Object.assign({}, SirTrevor.Events);
      block_control = new SirTrevor.BlockControls([], mediator);
    });

    it("can be created", function(){
      expect(block_control).toBeDefined();
    });

    it("sets the available_types", function(){
      expect(block_control.available_types).toBeDefined();
    });

    it("creates an $el", function(){
      expect(block_control.$el).toBeDefined();
    });

    it("creates an el", function(){
      expect(block_control.el).toBeDefined();
    });

  });

  describe("setting available_types", function(){

    var mediator, block_control;

    beforeEach(function(){
      mediator = Object.assign({}, SirTrevor.Events);
      block_control = new SirTrevor.BlockControls({
        'Text' : true,
        'Image' : true
      }, mediator);
    });

    it("creates a control element for every type given", function(){
      expect(block_control.$el.children().length).toBe(2);
    });

  });

});
