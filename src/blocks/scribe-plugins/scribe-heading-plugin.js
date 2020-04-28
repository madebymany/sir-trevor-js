"use strict";

var scribeHeadingPlugin = function(block) {
  return function(scribe) {
    
    const headingCommand = new scribe.api.Command('heading');
    headingCommand.queryEnabled = () => {
      return block.inline_editable;
    };
    headingCommand.queryState = () => {
      return block.type === 'heading';
    };

    const getBlockType = function() {
      return headingCommand.queryState() ? 'Text' : 'Heading';
    };

    headingCommand.execute = function headingCommandExecute(value) {
      var blockType = getBlockType()
      var data = {
        format: 'html',
        level: blockType == 'Heading' ? 2 : null,
        text: block.getScribeInnerContent()
      };

      block.mediator.trigger("block:replace", block.el, blockType, data);
    };

    scribe.commands.heading = headingCommand;
  };
};

module.exports = scribeHeadingPlugin;
