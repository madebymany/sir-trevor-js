"use strict";

describe("BlockManager::Removing blocks", function(){

  var manager;

  beforeEach(function(){
    var element = global.createBaseElement();
    var editor  = new SirTrevor.Editor({
      el: element,
      blockTypes: ["Text"]
    });
    manager = editor.blockManager;
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
