"use strict";

var scribeHeadingLevelPlugin = function(level) {
  return function(block) {
    return function(scribe) {
      
      const headingCommand = new scribe.api.Command(`heading-level-${level}`);
      headingCommand.queryEnabled = () => {
        return block.inline_editable;
      };
      headingCommand.queryState = () => {
        return block.type === 'heading' && block.level === level;
      };
      headingCommand.queryLevel = () => {
        return block.level;
      };

      const getBlockType = function() {
        return headingCommand.queryState() ? 'Text' : 'Heading';
      };

      headingCommand.execute = function headingCommandExecute(value) {
        const blockType = getBlockType()
        var data = {
          format: 'html',
          level: blockType == 'Heading' ? level : null,
          text: block.getScribeInnerContent()
        };

        block.mediator.trigger("block:replace", block.el, blockType, data);
      };

      scribe.commands.heading = headingCommand;
    };
  };
};

module.exports = scribeHeadingPlugin;
