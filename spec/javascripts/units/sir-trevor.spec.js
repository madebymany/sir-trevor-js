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

});