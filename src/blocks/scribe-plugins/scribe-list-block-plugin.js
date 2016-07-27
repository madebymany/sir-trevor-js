"use strict";

import {
  rangeToHTML,
  selectToEnd,
  currentPosition
} from '../../helpers/text-functions';

var ScribeListBlockPlugin = function(block) {
  return function(scribe) {
    scribe.el.addEventListener('keydown', function(ev) {

      if (block.supressKeyListeners) {
        return;
      }

      var content;

      if (ev.keyCode === 13 && !ev.shiftKey) { // enter pressed
        ev.preventDefault();

        if (scribe.getTextContent().length === 0) {
          block.removeCurrentListItem();
          block.mediator.trigger("block:create", 'Text', null, block.el);
        } else {
          content = rangeToHTML(selectToEnd(scribe), true);
          block.addListItemAfterCurrent(content);
        }

      } else if (ev.keyCode === 8 && currentPosition(scribe) === 0) {
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
