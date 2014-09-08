describe("Removing blocks", function() {
  var element, editor;

  describe("Removing blocks on the Editor", function(){
    beforeEach(function(){
      SirTrevor.instances = [];
      element = $("<textarea>");
      editor = new SirTrevor.Editor({ el: element, defaultType: false });
      editor.createBlock('Text');
    });

    it("removes the block from the blocks array", function(){
      editor.removeBlock(editor.blocks[0].blockID);
      expect(editor.blocks.length).toBe(0);
    });

    it("decrements the block type count", function(){
      editor.removeBlock(editor.blocks[0].blockID);
      expect(editor.blockCounts.Text).toBe(0);
    });

  });

  describe("Removing uploadable blocks on the Editor", function(){
    beforeEach(function() {
      SirTrevor.Blocks.CustomBlock = SirTrevor.Block.extend({
        uploadable: true
      });

      SirTrevor.instances = [];
      element = $("<textarea>");
      editor = new SirTrevor.Editor({ el: element, defaultType: false });
    })

    it("makes an ajax request to delete the file", function() {
      debugger
      editor.createBlock('custom_block');

      spyOn($, "ajax");

      editor.removeBlock(editor.blocks[0].blockID);
      expect($.ajax).toHaveBeenCalled();

    });

  });

});