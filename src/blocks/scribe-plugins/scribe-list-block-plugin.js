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

      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();

        if (scribe.getTextContent().length === 0) {
          let nextListItem = block.nextListItem();
          if (nextListItem) {
            const data = {format: 'html', listItems: []};
            block.removeCurrentListItem();
            block.focusOn(nextListItem);
            while (!!nextListItem) {
              data.listItems.push({content: nextListItem.scribe.getContent()});
              block.focusOn(nextListItem);
              block.removeCurrentListItem();
              nextListItem = block.nextListItem();
            }
            block.mediator.trigger("block:create", 'List', data, block.el, { autoFocus: true });
            block.mediator.trigger("block:create", 'Text', null, block.el, { autoFocus: true });
          } else {
            block.removeCurrentListItem();
            block.mediator.trigger("block:create", 'Text', null, block.el, { autoFocus: true });
          }
        } else {
          content = rangeToHTML(selectToEnd(scribe));
          block.addListItemAfterCurrent(content);
        }
      } else if (["Left", "ArrowLeft", "Up", "ArrowUp"].indexOf(ev.key) > -1  && isAtStart(scribe)) {
        ev.preventDefault();

        var previousListItem = block.previousListItem();
        if (previousListItem) {
          block.focusOn(previousListItem, { focusAtEnd: true });
        } else {
          block.mediator.trigger("block:focusPrevious", block.blockID);
        }

      } else if (["Right", "ArrowRight", "Down", "ArrowDown"].indexOf(ev.key) > -1 && isAtEnd(scribe)) {
        ev.preventDefault();

        var nextListItem = block.nextListItem();
        if (nextListItem) {
          block.focusOn(nextListItem);
        } else {
          block.mediator.trigger("block:focusNext", block.blockID);
        }

      } else if (ev.key === "Backspace" && isAtStart(scribe)) {
        ev.preventDefault();

        if (block.previousListItem()) {
          content = scribe.getContent();
          block.removeCurrentListItem();
          block.appendToCurrentItem(content);
        } else {
          var data = {
            format: 'html',
            text: scribe.getContent()
          };
          block.removeCurrentListItem();
          block.mediator.trigger("block:createBefore", 'Text', data, block, { autoFocus: true });
          if (block.isLastListItem()) {
            block.mediator.trigger('block:remove', block.blockID);
          }
        }
      }
    });
  };
};

module.exports = ScribeListBlockPlugin;
