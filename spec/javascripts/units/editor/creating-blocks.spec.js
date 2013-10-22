describe("Creating blocks on the Editor", function(){

  var element, editor;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
  });

  describe("createBlock with no editor options", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({ el: element });

      block = new SirTrevor.Block();

      spyOn(SirTrevor.Blocks, 'Text').andReturn(block);
      spyOn(SirTrevor.EventBus, 'trigger');
      spyOn(editor, 'listenTo');

      editor.createBlock('text');
    });

    it("instantiates a block of the type specified", function(){
      expect(SirTrevor.Blocks.Text).toHaveBeenCalled();
    });

    it("adds a block to the local block store", function(){
      expect(editor.blocks.length).toBe(1);
    });

    it("increments the block type count", function(){
      expect(editor._getBlockTypeCount('Text')).toBe(1);
    });

    it("listens to the blocks removeBlock event", function(){
      expect(editor.listenTo).toHaveBeenCalled();
    });

    it("triggers a block:create:new event", function(){
      expect(SirTrevor.EventBus.trigger)
        .toHaveBeenCalled();
    });

  });

  describe("createBlock with overall block limit", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        blockLimit: 1
      });

      editor.createBlock('Text');
    });

    it("adheres to the limit", function(){
      expect(editor.blocks.length).toBe(1);
      expect(editor._blockLimitReached()).toBe(true);
    });

  });

  describe("createBlock with blockTypes set", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        blockTypes: ['Text']
      });
    });

    it("will only create a block where the type is available", function(){
      editor.createBlock('Image');
      expect(editor.blocks.length).toBe(0);

      editor.createBlock('Text');
      expect(editor.blocks.length).toBe(1);
    });

  });

  describe("createBlock with blockTypeLimits set", function(){

    beforeEach(function(){
      editor = new SirTrevor.Editor({
        el: element,
        blockTypeLimits: { 'Text': 1 }
      });
    });

    it("adheres to the blockType limit", function(){
      editor.createBlock('Text');
      expect(editor._canAddBlockType('Text')).toBe(false);
    });

  });

});