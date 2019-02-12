"use strict";

var {
  isAtStart,
  isAtEnd,
  selectToEnd
} = require('./shared.js');

var config = require('./../../config');

var ScribeTextBlockPlugin = function(block) {
  return function(scribe) {

    // Remove any empty elements at the start of the range.
    var stripFirstEmptyElement = function(div) {
      if (div.firstChild === null) { return; }

      var firstChild = div.firstChild.childNodes[0];
      if (firstChild && firstChild.nodeName !== '#text') {
        if (firstChild.innerText === '') {
          div.firstChild.removeChild(firstChild);
        }
      }
    };

    var createBlocksFromParagraphs = function() {
      var fakeContent = document.createElement('div');
      fakeContent.appendChild(selectToEnd(scribe).extractContents());

      stripFirstEmptyElement(fakeContent);

      // Add wrapper div which is missing in non blockElement scribe.
      if (!scribe.allowsBlockElements()) {
        var tempContent = document.createElement('div');
        tempContent.appendChild(fakeContent);
        fakeContent = tempContent;
      }

      if (fakeContent.childNodes.length >= 1) {
        var data;
        var nodes = [].slice.call(fakeContent.childNodes);
        nodes.reverse().forEach(function(node) {
          if (node.innerText !== '') {
            data = {
              format: 'html',
              text: node.innerHTML.trim()
            };
            block.mediator.trigger("block:create", 'Text', data, block.el, { autoFocus: true });
          }
        });
      }
    };

    var isAtStartBoolean = false;

    scribe.el.addEventListener('keydown', function(ev) {

      if (block.supressKeyListeners || !config.defaults.modifyBlocks) {
        return;
      }

      if (ev.keyCode === 13 && !ev.shiftKey) { // enter pressed
        ev.preventDefault();

        if (isAtEnd(scribe)) {

          // Remove any bad characters after current selection.
          selectToEnd(scribe).extractContents();
          block.mediator.trigger("block:create", 'Text', null, block.el, { autoFocus: true });
        } else {
          createBlocksFromParagraphs();
        }

        // If the block is left empty then we need to reset the placeholder content.
        if (scribe.allowsBlockElements() && scribe.getTextContent() === '') {
          scribe.setContent('<p><br></p>');
        }
      } else if ((ev.keyCode === 37 || ev.keyCode === 38) && isAtStart(scribe)) {
        ev.preventDefault();

        block.mediator.trigger("block:focusPrevious", block.blockID);
      } else if (ev.keyCode === 8 && isAtStart(scribe)) {
        ev.preventDefault();

        isAtStartBoolean = true;
      } else if ((ev.keyCode === 39 || ev.keyCode === 40) && isAtEnd(scribe)) {
        ev.preventDefault();

        block.mediator.trigger("block:focusNext", block.blockID);
      }
    });

    scribe.el.addEventListener('keyup', function(ev) {

      if (block.supressKeyListeners || !config.defaults.modifyBlocks) {
        return;
      }

      if (ev.keyCode === 8 && isAtStartBoolean) {
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
