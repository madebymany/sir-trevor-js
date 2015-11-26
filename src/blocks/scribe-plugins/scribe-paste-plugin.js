"use strict";

var scribePastePlugin = function(block) {
  return function(scribe) {
    var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');
    
    insertHTMLCommandPatch.execute = function (value) {
      scribe.transactionManager.run(() => {
        scribe.api.CommandPatch.prototype.execute.call(this, value);

        var fakeContent = document.createElement('div');
        fakeContent.innerHTML = scribe.getContent();

        if (fakeContent.childNodes.length > 1) {

          var nodes = Array.from(fakeContent.childNodes);
          scribe.setContent( nodes.shift().innerHTML );
          nodes.reverse().forEach(function(node) {
            var data = {
              format: 'html',
              text: node.innerHTML
            };
            block.mediator.trigger("block:create", 'Text', data, block.el);
          });
          scribe.el.focus();
        }
      });
    };

    scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
  };
};

module.exports = scribePastePlugin;
