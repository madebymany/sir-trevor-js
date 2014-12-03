"use strict";

describe("BlockManager::Removing blocks", function(){

  var mediator, options, manager;

  beforeEach(function(){
    SirTrevor.instances = [];
    mediator = _.extend({}, SirTrevor.Events);
    options = { defaultType: false };
    manager = new SirTrevor.BlockManager(_.extend({}, SirTrevor.config.defaults, options), '', mediator);

    manager.createBlock('Text');
  });

  it("removes the block from the blocks array", function(){
    manager.removeBlock(manager.blocks[0].blockID);
    expect(manager.blocks.length).toBe(0);
  });

  it("decrements the block type count", function(){
    manager.removeBlock(manager.blocks[0].blockID);
    expect(manager.blockCounts.Text).toBe(0);
  });

});
