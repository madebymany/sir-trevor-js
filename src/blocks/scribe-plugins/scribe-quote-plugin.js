"use strict";

var scribeQuotePlugin = function(block) {
  return function(scribe) {
    
    const quoteCommand = new scribe.api.Command('quote');
    quoteCommand.queryEnabled = () => {
      return block.inline_editable;
    };
    quoteCommand.queryState = () => {
      return block.type === 'quote';
    };

    quoteCommand.execute = function headingCommandExecute(value) {
      var data = {
        format: 'html',
        text: block.getScribeInnerContent()
      };

      block.mediator.trigger("block:replace", block.el, this.queryState() ? 'Text' : 'Quote', data);
    };

    scribe.commands.quote = quoteCommand;
  };
};

module.exports = scribeQuotePlugin;
