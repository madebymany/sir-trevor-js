describe("BlockManager", function() {

  var mediator, manager;

  beforeEach(function(){
    mediator = _.extend({}, SirTrevor.Events);
    manager = new SirTrevor.BlockManager(SirTrevor.DEFAULTS, '', mediator);
  });

  describe("findBlockById", function(){

    beforeEach(function(){
      manager.blocks = [
        { blockID: 1 },
        { blockID: 2 }
      ];
    });

    it("returns a block from the blocks array if it's present", function(){
      expect(manager.findBlockById(1)).toBeDefined();
    });

    it("returns nothing if the block isn't found", function(){
      expect(manager.findBlockById(3)).toBeUndefined();
    });

  });

  describe("getBlocksByType", function(){

    beforeEach(function(){
      manager.blocks = [
        { type: "Text" },
        { type: "Image" }
      ];
    });

    it("returns all the blocks of the type", function(){
      expect(manager.getBlocksByType("Text").length).toBe(1);
    });

  });

  describe("getBlocksByIDs", function(){

    beforeEach(function(){
      manager.blocks = [
        { blockID: 1 },
        { blockID: 2 }
      ];
    });

    it("returns all the blocks of the type", function(){
      expect(manager.getBlocksByIDs([1]).length).toBe(1);
    });
  });

});