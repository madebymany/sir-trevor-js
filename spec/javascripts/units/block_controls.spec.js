"use strict";

describe("BlockControls", function(){

  describe("creating a new instance", function(){

    var blockControls, editor;

    beforeEach(function(){
      var element = global.createBaseElement();
      editor  = new SirTrevor.Editor({
        el: element
      });
      blockControls = editor.blockControls;
    });

    it("can be created", function(){
      expect(blockControls).toBeDefined();
    });

    it("creates an el", function(){
      expect(blockControls.el).toBeDefined();
    });

    it("sets the available types", function(){
      editor.blockManager.blockTypes.forEach(function(blockType){
        expect(
          blockControls.el.querySelector("[data-type=" + blockType.toLowerCase() + "]")
        ).not.toBe(null);
      });
    });

  });

});
