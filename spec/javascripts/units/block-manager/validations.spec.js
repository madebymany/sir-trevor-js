"use strict";

describe("BlockManager::Validations", function(){

  var manager;

  describe("required block types", function(){

    beforeEach(function(){
      var element = global.createBaseElement();
      var editor  = new SirTrevor.Editor({
        el: element,
        blockTypes: ["Text"],
        defaultType: false,
        required: ['Text']
      });
      manager = editor.blockManager;
      spyOn(manager.mediator, 'trigger');
    });

    it("will emit an error if the block type is missing", function(){
      manager.validateBlockTypesExist(true);
      expect(manager.mediator.trigger).toHaveBeenCalledWith('errors:add',
        { text : i18n.t("errors:type_missing", { type: "Text" }) });
    });

    xit("will error if a required block is empty", function(){
      createBlock();
      manager.validateBlockTypesExist(true);
      expect(manager.mediator.trigger).toHaveBeenCalledWith('errors:add',
        { text : i18n.t("errors:required_type_empty", { type: "Text" }) });
    });

    it("won't error if a required block has text", function(){
      createBlock({ text: 'YOLO' });
      manager.validateBlockTypesExist(true);
      expect(manager.mediator.trigger).not.toHaveBeenCalledWith('errors:add',
        { text : i18n.t("errors:required_type_empty", { type: "Text" }) });
    });

  });

  function createBlock(data) {
    manager.createBlock('Text', data || {});
    return _.last(manager.blocks);
  }

});
