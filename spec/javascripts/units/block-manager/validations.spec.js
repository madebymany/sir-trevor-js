"use strict";

describe("BlockManager::Validations", function(){

  var mediator, manager, options;

  beforeEach(function(){
    mediator = _.extend({}, SirTrevor.Events);
  });

  describe("required block types", function(){

    beforeEach(function(){
      options = { defaultType: false, required: ['Text'] };
      manager = new SirTrevor.BlockManager(_.extend({}, SirTrevor.config.defaults, options), '', mediator);
      spyOn(manager.mediator, 'trigger');
    });

    it("will emit an error if the block type is missing", function(){
      manager.validateBlockTypesExist(true);
      expect(manager.mediator.trigger).toHaveBeenCalledWith('errors:add',
        { text : i18n.t("errors:type_missing", { type: "Text" }) });
    });

    it("will error if a required block is empty", function(){
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
