"use strict";

/*
When content is pasted into a block take the sanitized html and create a block for each
paragraph that has been added.
*/

function createListBlock(block, listItems) {
  var listItemContent = listItems.map(function(listItemNode) {
    var content = listItemNode.innerHTML.substr(2);
    return {content: content};
  });
  var listData = {
    format: 'html',
    listItems: listItemContent.reverse()
  };
  block.mediator.trigger("block:create", 'List', listData, block.el, { autoFocus: true });
}

function handleListItems(block, listItemsToCreate) {
  if (listItemsToCreate.length > 0) {
    createListBlock(block, listItemsToCreate);
  }
  return [];
}

var scribePastePlugin = function(block) {

  function isMsWordListParagraph(node) {
    if (block.editorOptions.blockTypes.indexOf("List") === -1) return false;
    var matchingClassnames = node.className.split(" ").filter(function(className) {
      return className.startsWith("MsoListParagraph");
    });
    return matchingClassnames.length > 0;
  }

  return function(scribe) {
    var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');

    insertHTMLCommandPatch.execute = function (value) {
      scribe.transactionManager.run(() => {
        scribe.api.CommandPatch.prototype.execute.call(this, value);

        var fakeContent = document.createElement('div');
        fakeContent.innerHTML = scribe.getContent();

        if (fakeContent.childNodes.length > 1) {
          var nodes = [].slice.call(fakeContent.childNodes);
          var listItemsToCreate = [];
          var listIsFirstItem = false;

          var blockToFocus;

          function assignBlockToFocus(focusBlock) {
            blockToFocus = focusBlock;
            block.mediator.off("block:created", assignBlockToFocus);
          }

          var firstNode = nodes[0];
          if (isMsWordListParagraph(firstNode)) {
            listIsFirstItem = true;
            scribe.setContent("");
          } else {
            scribe.setContent( nodes.shift().innerHTML );
          }

          block.mediator.on("block:created", assignBlockToFocus);

          nodes.reverse().forEach(function(node) {
            if (isMsWordListParagraph(node)) {
              // Start building list
              listItemsToCreate.push(node);
            } else {
              // Previous blocks were list items, so create the list block first
              listItemsToCreate = handleListItems(block, listItemsToCreate);

              // Now create the text block
              var data = {
                format: 'html',
                text: node.innerHTML
              };
              block.mediator.trigger("block:create", 'Text', data, block.el, { autoFocus: true });
            }
          });

          // If the last element was a list item, the list won't have been
          // created yet, so create it now
          listItemsToCreate = handleListItems(block, listItemsToCreate);

          if (listIsFirstItem) {
            block.mediator.trigger("block:remove", block.blockID);
          }

          blockToFocus.focusAtEnd();

        } else {
          var node = fakeContent.firstChild;

          if (isMsWordListParagraph(node)) {
            scribe.setContent("");
            createListBlock(block, [node]);
            block.mediator.trigger("block:remove", block.blockID);
          }
        }
      });
    };

    scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
  };
};

module.exports = scribePastePlugin;
