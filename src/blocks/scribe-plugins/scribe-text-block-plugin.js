"use strict";

import {
  stripFirstEmptyElement,
  selectToEnd,
  isAtStartOfContent,
  isAtEndOfContent
} from '../../helpers/text-functions';

var ScribeTextBlockPlugin = function(block) {
  return function(scribe) {

    var createBlocksFromParagraphs = function(scribe) {
      var contents = selectToEnd(scribe);
      var fakeContent = document.createElement('div');
      fakeContent.appendChild(contents.cloneContents());

      stripFirstEmptyElement(fakeContent);

      // Add wrapper div which is missing in non blockElement scribe.
      if (!scribe.allowsBlockElements()) {
        var tempContent = document.createElement('div');
        tempContent.appendChild(fakeContent);
        fakeContent = tempContent;
      }

      var onBlockCreated = function(newBlock) {
        contents.extractContents();
      };

      if (fakeContent.childNodes.length >= 1) {
        var data;
        var nodes = Array.from(fakeContent.childNodes);
        nodes.reverse().forEach(function(node) {
          if (node.innerText !== '') {
            data = {
              format: 'html',
              text: node.innerHTML.trim()
            };

            block.mediator.on("block:created", onBlockCreated);
            block.mediator.trigger("block:create", 'Text', data, block.el);
            block.mediator.off("block:created", onBlockCreated);
          }
        });
      }
    };

    var isAtStart = false;

    scribe.el.addEventListener('keydown', function(ev) {

      if (block.supressKeyListeners) {
        return;
      }

      if (ev.keyCode === 13 && !ev.shiftKey) { // enter pressed
        ev.preventDefault();

        if (isAtEndOfContent(scribe)) {

          // Remove any bad characters after current selection.
          selectToEnd(scribe).extractContents();
          block.mediator.trigger("block:create", 'Text', null, block.el);
        } else {
          createBlocksFromParagraphs(scribe);
        }

        // If the block is left empty then we need to reset the placeholder content.
        if (scribe.allowsBlockElements() && scribe.getTextContent() === '') {
          scribe.setContent('<p><br></p>');
        }

      } else if ((ev.keyCode === 37 || ev.keyCode === 38) && isAtStartOfContent(scribe)) {
        ev.preventDefault();

        block.mediator.trigger("block:focusPrevious", block.blockID);
      } else if (ev.keyCode === 8 && isAtStartOfContent(scribe)) {
        ev.preventDefault();

        isAtStart = true;
      } else if ((ev.keyCode === 39 || ev.keyCode === 40) && isAtEndOfContent(scribe)) {
        ev.preventDefault();
        
        block.mediator.trigger("block:focusNext", block.blockID);
      }
    });

    scribe.el.addEventListener('keyup', function(ev) {

      if (block.supressKeyListeners) {
        return;
      }

      if (ev.keyCode === 8 && isAtStart) {
        ev.preventDefault();

        block.mediator.trigger('block:remove', block.blockID, {
          transposeContent: true
        });

        isAtStart = false;
      }
    });
  };
};

module.exports = ScribeTextBlockPlugin;
