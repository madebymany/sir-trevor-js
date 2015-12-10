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

    headingCommand.execute = function headingCommandExecute(value) {
      var data = {
        format: 'html',
        text: block.getScribeInnerContent()
      };

      block.mediator.trigger("block:replace", block.el, this.queryState() ? 'Text' : 'Heading', data);
    };

    scribe.commands.heading = headingCommand;
  };
};

module.exports = scribeHeadingPlugin;
