"use strict";

var scribeHeadingLevelPlugin = function(block) {
  return function(scribe) {
    
    const headingLevelCommand = new scribe.api.Command(`headingLevel`);
    headingLevelCommand.queryEnabled = () => {
      return block.inline_editable;
    };
    headingLevelCommand.queryState = () => {
      if (block.type === 'heading') {
        return block.getBlockData().level || 2;
      } else {
        return false;
      }
    };

    headingLevelCommand.execute = function headingLevelCommandExecute(value) {
      var level = block.getBlockData().level + 1;
      var blockType = 'Heading';

      if (!level || level < 2) {
        level = 2;
      } else if (level > 4) {
        level = null;
        blockType = 'Text';
      }


      var data = {
        format: 'html',
        level: level,
        text: block.getScribeInnerContent()
      };

      block.mediator.trigger("block:replace", block.el, blockType, data);
    };

    scribe.commands.headingLevel = headingLevelCommand;
  };
};

module.exports = scribeHeadingLevelPlugin;
