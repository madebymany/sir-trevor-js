describe("Store", function(){

  var element, editor, block;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
  });

  describe("create", function(){

    beforeEach(function(){
      block = new SirTrevor.Blocks.Text({ text: 'Test' }, editor.ID);
    });

    it("creates the data in the block store", function(){
      expect(block.blockStorage).toBeDefined();
    });

    it("should have the data provided on intialization", function(){
      expect(block.blockStorage.data.text).toBe('Test');
    });

  });

  describe("getData", function(){

    beforeEach(function(){
      block = new SirTrevor.Blocks.Text({ text: 'Test' }, editor.ID);
    });

    it("should retrieve the data", function(){
      expect(block.getData().text).toBe("Test");
    });

  });

  describe("setData", function(){

    beforeEach(function(){
      block = new SirTrevor.Blocks.Text({ text: 'Test' }, editor.ID);
    });

    it("should set the data on the block", function(){
      block.setData({ text: "Boom" });
      expect(block.getData().text).toBe("Boom");
    });

    it("should save the data, even if none is given", function(){
      block.setData({ text: '' });
      expect(block.getData().text).toBe('');
    });

  });

  describe("save", function(){

    beforeEach(function() {
      block = new SirTrevor.Blocks.Text({ text: 'Test' }, editor.ID);
      spyOn(block, 'toData');
    });

    it("calls toData on save", function(){
      block.save();
      expect(block.toData).toHaveBeenCalled();
    });

  });

});