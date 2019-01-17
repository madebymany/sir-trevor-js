"use strict";

var selectionRange = require('selection-range');

var {
  getTotalLength,
  isAtStart,
  isAtEnd,
  selectToEnd
} = require('./shared.js');

var ScribeListBlockPlugin = function(block) {
  return function(scribe) {
    scribe.el.addEventListener('keydown', function(ev) {

      if (block.supressKeyListeners) {
        return;
      }

      var rangeToHTML = function(range) {
        var div = document.createElement('div');
        div.appendChild(range.extractContents());

        return div.innerHTML;
      };

      var content;

      if (ev.keyCode === 13 && !ev.shiftKey) { // enter pressed
        ev.preventDefault();

        if (scribe.getTextContent().length === 0) {
          block.removeCurrentListItem();
          block.mediator.trigger("block:create", 'Text', null, block.el, { autoFocus: true });
        } else {
          content = rangeToHTML(selectToEnd(scribe));
          block.addListItemAfterCurrent(content);
        }
      } else if ((ev.keyCode === 37 || ev.keyCode === 38) && isAtStart(scribe)) {
        ev.preventDefault();

        var previousEditor = block.previousListItem();
        if (previousEditor) {
          block.focusOn(previousEditor);
          selectionRange(
            previousEditor.scribe.el,
            {start: getTotalLength(previousEditor.scribe)}
          );
        }

      } else if ((ev.keyCode === 39 || ev.keyCode === 40) && isAtEnd(scribe)) {
        ev.preventDefault();

        block.focusOn(block.nextListItem());
      } else if (ev.keyCode === 8 && isAtStart(scribe)) {
        ev.preventDefault();

        if (block.isLastListItem()) {
          block.mediator.trigger('block:remove', block.blockID);
        } else {
          content = scribe.getContent();
          block.removeCurrentListItem();
          block.appendToCurrentItem(content);
        }
      } else if (ev.keyCode === 46) {
        // TODO: Pressing del from end of list item
      }
    });
  };
};

module.exports = ScribeListBlockPlugin;
