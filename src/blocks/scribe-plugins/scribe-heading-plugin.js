"use strict";

var scribeHeadingPlugin = function(block) {
  return function(scribe) {

    const { defaultHeadingLevel, headingLevels } = block.editorOptions;
    const minHeadingLevel = headingLevels[0];
    const maxHeadingLevel = headingLevels[headingLevels.length - 1];

    const headingCommand = new scribe.api.Command(`heading`);
    headingCommand.queryEnabled = () => {
      return block.inline_editable;
    };
    headingCommand.queryState = () => {
      if (block.type === 'heading') {
        return block.getBlockData().level || defaultHeadingLevel || minHeadingLevel;
      } else {
        return false;
      }
    };

    headingCommand.execute = function headingCommandExecute(value) {
      var level = block.getBlockData().level + 1;
      var blockType = 'Heading';

      if (!level || level < minHeadingLevel) {
        level = minHeadingLevel;
      } else if (level > maxHeadingLevel) {
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

    scribe.commands.heading = headingCommand;
  };
};

module.exports = scribeHeadingPlugin;
