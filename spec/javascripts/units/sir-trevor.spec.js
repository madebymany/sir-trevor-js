"use strict";

describe("SirTrevor", function(){

  describe("setBlockOptions", function(){

    var block;

    beforeEach(function(){
      SirTrevor.Blocks.Test = SirTrevor.Block.extend({
        test: true
      });

      SirTrevor.setBlockOptions("Test", { test: false });
    });

    it("can set an option on a specific block", function(){
      SirTrevor.setBlockOptions("Test", { test: false });
      expect(SirTrevor.Blocks.Test.prototype.test).toBe(false);
    });

    it("has the property set when we instantiate a block", function(){
      block = new SirTrevor.Blocks.Test();
      expect(block.test).toBe(false);
    });

  });

  describe("getInstance", function(){

    beforeEach(function(){
      SirTrevor.config.instances = [
        { ID: '123' },
        { ID: '456' }
      ];
    });

    it("retrieves the first instance if no params are given", function(){
      var instance = SirTrevor.getInstance();
      expect(instance.ID).toBe('123');
    });

    it("retrieves the instance by ID if a string is provided", function(){
      var instance = SirTrevor.getInstance('456');
      expect(instance.ID).toBe('456');
    });

    it("retrieves the instance by position if an integer is provided", function(){
      var instance = SirTrevor.getInstance(0);
      expect(instance.ID).toBe('123');
    });

  });

});
