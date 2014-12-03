"use strict";

describe("BlockManager::Options", function(){

  var manager, mediator;

  beforeEach(function(){
    mediator = _.extend({}, SirTrevor.Events);
  });

  describe("setting required blocks", function(){

    beforeEach(function(){
      managerWithOptions({ required: ['Text'] });
    });

    it("has an array of required blocks", function(){
      expect(manager.required).not.toBe(false);
    });

    it("has the options passed in the array", function(){
      expect(manager.required).toContain('Text');
    });

  });

  describe("setting available block types", function(){

    beforeEach(function(){
      managerWithOptions({ blockTypes: ['Text'] });
    });

    it("sets the object to the specified option", function(){
      expect(manager.blockTypes.Text).toBeTruthy();
    });

    it("won't be the default set of blocks", function(){
      expect(manager.blockTypes).not.toBe(SirTrevor.Blocks);
    });

  });

  describe("setting the block type limits", function(){

    beforeEach(function(){
      managerWithOptions({ blockTypeLimits: { 'Text': 1 } });
    });

    it("sets the options to the specified value", function(){
      expect(manager.options.blockTypeLimits.Text).toBe(1);
    });

  });

  describe("setting the block limit", function(){

    beforeEach(function(){
      managerWithOptions({
        blockLimit: 1
      });
    });

    it("sets the limit to the specified option", function(){
      expect(manager.options.blockLimit).toBe(1);
    });

  });

  function managerWithOptions(options) {
    manager = new SirTrevor.BlockManager(_.extend({}, SirTrevor.config.defaults, options), '', mediator);
  }

});
