"use strict";

var {
  createBlocksFromParagraphs,
  isAtStart,
  isAtEnd,
  isSelectedFromStart,
  isSelectedToEnd,
  selectToEnd
} = require('./shared.js');

var config = require('./../../config');

var ScribeTextBlockPlugin = function(block) {
  return function(scribe) {
    var isAtStartBoolean = false;

    scribe.el.addEventListener('keydown', function(ev) {

      if (block.supressKeyListeners || !config.defaults.modifyBlocks) {
        return;
      }

      if (ev.key === "Enter" && !ev.shiftKey) { // enter pressed
        ev.preventDefault();

        if (isAtEnd(scribe)) {

          // Remove any bad characters after current selection.
          selectToEnd(scribe).extractContents();
          block.mediator.trigger("block:create", 'Text', null, block.el, { autoFocus: true });
        } else {
          createBlocksFromParagraphs(block, scribe);
        }

        // If the block is left empty then we need to reset the placeholder content.
        if (scribe.allowsBlockElements() && scribe.getTextContent() === '') {
          scribe.setContent('<p><br></p>');
        }
      } else if (["Left", "ArrowLeft", "Up", "ArrowUp"].indexOf(ev.key) > -1) {
        if (ev.shiftKey && isSelectedFromStart(scribe)) {
          ev.preventDefault();
          ev.stopPropagation();

          document.activeElement && document.activeElement.blur();
          block.mediator.trigger("selection:block", block);
        } else if (isAtStart(scribe)) {
          ev.preventDefault();
          ev.stopPropagation();

          block.mediator.trigger("block:focusPrevious", block.blockID);
        }
      } else if (ev.keyCode === 8 && isAtStart(scribe)) {
        ev.preventDefault();

        isAtStartBoolean = true;
      } else if (["Right", "ArrowRight", "Down", "ArrowDown"].indexOf(ev.key) > -1) {
        if (ev.shiftKey && isSelectedToEnd(scribe)) {
          ev.preventDefault();
          ev.stopPropagation();

          document.activeElement && document.activeElement.blur();
          block.mediator.trigger("selection:block", block);
        } else if (isAtEnd(scribe)) {
          ev.preventDefault();

          block.mediator.trigger("block:focusNext", block.blockID);
        }
      }
    });

    scribe.el.addEventListener('keyup', function(ev) {

      if (block.supressKeyListeners || !config.defaults.modifyBlocks) {
        return;
      }

      if (ev.key === "Backspace" && isAtStartBoolean) {
        ev.preventDefault();

        block.mediator.trigger('block:remove', block.blockID, {
          transposeContent: true
        });

        isAtStartBoolean = false;
      }
    });
  };
};

module.exports = ScribeTextBlockPlugin;
