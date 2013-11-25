"use strict";

describe("EditorStore", function(){

  var mediator, store;

  beforeEach(function(){
    mediator = _.extend({}, SirTrevor.Events);
  });

  describe("creating the store", function(){

    it("creates an empty store on initialization", function(){
      store = new SirTrevor.EditorStore('', mediator);
      expect(store.store).toBeDefined();
    });

    it("uses the value of the textarea if there is data in it", function(){
      var data = '{ "data": [{ "type": "Text", "data": { "text": "test" }}]}';

      store = new SirTrevor.EditorStore(data, mediator);

      expect(store.store).toBeDefined();
      expect(store.retrieve().data.length).toBe(1);
    });

  });

  describe("addData", function(){

    beforeEach(function(){
      store = new SirTrevor.EditorStore('', mediator);
      store.addData({ type: 'Text', data: 'OHHAI' });
    });

    it("appends the data", function(){
      expect(store.retrieve().data.length).not.toBe(0);
    });

    it("contains the data given", function(){
      var data = store.retrieve(),
          item = data.data[0];

      expect(item.data).toBe('OHHAI');
      expect(item.type).toBe('Text');
    });

  });

  describe("retrieve", function(){

    beforeEach(function(){
      store = new SirTrevor.EditorStore('', mediator);
      store.addData({ type: 'Text', data: 'OHHAI' });
    });

    it("returns the correct data", function(){
      expect(store.retrieve().data.length).toBe(1);
    });

  });

  describe("reset", function(){

    beforeEach(function(){
      store = new SirTrevor.EditorStore('', mediator);
      store.addData({ type: 'Text', data: 'OHHAI' });

      store.reset();
    });

    it("clears the data", function(){
      expect(store.retrieve().data.length).toBe(0);
    });

  });

  describe("toString", function(){

    beforeEach(function(){
      store = new SirTrevor.EditorStore('', mediator);
      store.addData({ type: 'Text', data: 'OHHAI' });
    });

    it("produces a string of the data", function(){
      var str = store.toString();
      expect(typeof str === "string").toBe(true);
    });

    it("has the correct data", function(){
      var json = JSON.parse(store.toString());
      expect(json.data[0].data).toBe("OHHAI");
    });

  });

});
