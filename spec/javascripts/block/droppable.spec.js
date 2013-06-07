describe("Droppable Block", function(){

  var element, editor, block;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    block = new SirTrevor.Blocks.Tweet({}, editor.ID);
  });

  describe("drop_options", function(){

    it("has defaults", function(){
      expect(block.drop_options).not.toBe(undefined);
    });

  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'withMixin');
      block = block.render();
    });

    it("gets the droppable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.Droppable);
    });

    it("adds a droppable class to $inner", function(){
      expect(block.$inner.hasClass('st-block__inner--droppable'));
    });

  });

});