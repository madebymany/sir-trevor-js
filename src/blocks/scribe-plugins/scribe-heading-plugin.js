"use strict";

var scribeHeadingPlugin = function(block) {
  return function(scribe) {
    let { defaultHeadingLevel, headingLevels } = block.editorOptions;
    headingLevels = headingLevels.sort();
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
      const nextIndex = headingLevels.indexOf(block.getBlockData().level) + 1;
      const level = headingLevels[nextIndex];
      const blockType = level ? 'Heading' : 'Text';

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
