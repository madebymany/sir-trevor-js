"use strict";

var ScribeListBlockPlugin = function(block) {
  return function(scribe) {
    scribe.el.addEventListener('keydown', function(ev) {
      var rangeToHTML = function(range) {
        var div = document.createElement('div');
        div.appendChild(range.extractContents());

        return div.innerHTML;
      };

      var selectToEnd = function() {
        var selection = new scribe.api.Selection();
        var range = selection.range.cloneRange();
        range.setEndAfter(scribe.el.lastChild, 0);

        return range;
      };

      var currentPosition = function() {
        var selection = new scribe.api.Selection();
        return selection.range.startOffset;
      };

      var content;

      if (ev.keyCode === 13 && !ev.shiftKey) { // enter pressed
        ev.preventDefault();

        if (scribe.getTextContent().length === 0) {
          block.removeCurrentListItem();
          block.mediator.trigger("block:create", 'Text', null, block.el);
        } else {
          content = rangeToHTML(selectToEnd());
          block.addListItemAfterCurrent(content);
        }

      } else if (ev.keyCode === 8 && currentPosition() === 0) {
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
