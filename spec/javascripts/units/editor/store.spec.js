describe("Store", function(){

  var element, editor, block;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });

    editor.createBlock('Text', { text: "Blah" });
    block = _.last(editor.blocks);
  });

  describe("creating the store", function(){

    it("creates an empty store on initialization", function(){
      expect(editor.dataStore).toBeDefined();
    });

    it("uses the value of the textarea if there is data in it", function(){
      editor.$el.val('{ "data": [{ "type": "Text", "data": { "text": "test" }}]}');
      editor.store("create");

      expect(editor.dataStore.data.length).toBe(1);
    });

  });

  describe("saveBlockStateToStore", function(){

    beforeEach(function(){
      editor.saveBlockStateToStore(block);
    });

    it("saves the blocks state to the store", function(){
      expect(editor.dataStore.data.length).not.toBe(0);
    });

    it("contains the data for the block saved", function(){
      var block_storage = block.blockStorage;
      expect(editor.dataStore.data[0]).toBe(block_storage);
    });

  });

  describe("reading from the store", function(){

    beforeEach(function(){
      editor.saveBlockStateToStore(block);
    });

    it("returns the correct data", function(){
      expect(editor.store("read").data.length).toBe(1);
    });

  });

  describe("saving the dataStore to the $el", function(){

    beforeEach(function(){
      editor.saveBlockStateToStore(block);
      editor.store("save");
    });

    it("has the state stored on the $el", function(){
      expect(editor.$el.val().length).not.toBe(0);
    });

    it("has the correct data on the $el", function(){
      var json = JSON.parse(editor.$el.val());

      expect(json.data[0].data.text).toBe("Blah\n");
    });

  });

});