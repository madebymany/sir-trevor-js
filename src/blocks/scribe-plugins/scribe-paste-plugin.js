"use strict";

/*
When content is pasted into a block take the sanitized html and create a block for each
paragraph that has been added.
*/

var scribePastePlugin = function(block) {
  return function(scribe) {
    var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');

    insertHTMLCommandPatch.execute = function (value) {
      scribe.transactionManager.run(() => {
        scribe.api.CommandPatch.prototype.execute.call(this, value);

        var fakeContent = document.createElement('div');
        fakeContent.innerHTML = scribe.getContent();

        if (fakeContent.childNodes.length > 1) {
          scribe.setContent( nodes.shift().innerHTML );
          var nodes = Array.from(fakeContent.childNodes);
          nodes.forEach(function(node) {
            var data = {
              format: 'html',
              text: node.innerHTML
            };
            block.mediator.trigger("block:createBefore", 'Text', data, block, { autoFocus: true });
          });

          block.mediator.trigger('block:remove', block.blockID, {
            transposeContent: true
          });
        }
      });
    };

    scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
  };
};

module.exports = scribePastePlugin;
