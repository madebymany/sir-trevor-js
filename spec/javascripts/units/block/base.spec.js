describe("Block", function(){

  var element, editor, block, block_two;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    block = new SirTrevor.Blocks.Text({}, editor.ID);
    block_two = new SirTrevor.Blocks.Text({}, editor.ID);
  });

  it("block is instance of ST.Block", function(){
    expect(block instanceof SirTrevor.Block).toBeTruthy();
  });

  it("can be able to be created", function(){
    expect(block).not.toBe(undefined);
  });

  it("has a type set", function(){
    expect(block.type).toBe("Text");
  });

  it("has a unique identifier", function(){
    expect(block.blockID).not.toBe(block_two.blockID);
  });

  it("has a title", function(){
    expect(block.title()).toBe("Text");
  });

  describe("dom functions", function(){

    it("has an $el associated with it", function(){
      expect(block.$el).not.toBe(undefined);
    });

    it("has have a shorthand method for selecting elements under the $el", function(){
      expect(typeof block.$).toBe('function');
    });

    it("has a shorthand method for selecting elements under the $editor", function(){
      expect(typeof block.$$).toBe('function');
    });

  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'beforeBlockRender');
      spyOn(block, 'onBlockRender');
      spyOn(block, 'checkAndLoadData');

      block.render();
    });

    it("is renderable", function(){
      expect(typeof block.render).toBe('function');
    });

    it("has an $inner element", function(){
      expect(block.$inner).not.toBe(undefined);
    });

    it("has an $editor element", function(){
      expect(block.$editor).not.toBe(undefined);
    });

    it("has a ready class", function(){
      expect(block.$el.hasClass('st-item-ready')).toBe(true);
    });

    it("calls beforeBlockRender", function(){
      expect(block.beforeBlockRender).toHaveBeenCalled();
    });

    it("calls onBlockRender", function(){
      expect(block.onBlockRender).toHaveBeenCalled();
    });

    it("calls checkAndLoadData", function(){
      expect(block.checkAndLoadData).toHaveBeenCalled();
    });

  });

});