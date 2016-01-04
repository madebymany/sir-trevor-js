"use strict";

var selectionRange = require('selection-range');

var ScribeTextBlockPlugin = function(block) {
  return function(scribe) {

    // Remove any empty elements at the start of the range.
    var stripFirstEmptyElement = function(div) {
      var firstChild = div.firstChild.childNodes[0];
      if (firstChild && firstChild.nodeName !== '#text') {
        if (firstChild.innerText === '') {
          div.firstChild.removeChild(firstChild);
        }
      }
    };

    var rangeToHTML = function(range, extract) {
      var div = document.createElement('div');
      if (extract) {
        div.appendChild(range.extractContents());
      } else {
        div.appendChild(range.cloneContents());
      }
      
      stripFirstEmptyElement(div);

      // Sometimes you'll get an empty tag at the start of the block.
      if (div.firstChild.nodeName !== '#text') {
        div = div.lastChild;
      }

      return div.innerHTML.trim();
    };

    var selectToEnd = function() {
      var selection = new scribe.api.Selection();
      var range = selection.range.cloneRange();
      range.setEndAfter(scribe.el.lastChild, 0);

      return range;
    };

    var isAtStartOfBlock = function() {
      if (scribe.getTextContent() === '') { return true; }

      var selection = new scribe.api.Selection();
      var range = selection.range.cloneRange();

      range.setStartBefore(scribe.el.firstChild, 0);

      return rangeToHTML(range, false) === '';
    };

    var getTotalLength = function() {
      var selection = new scribe.api.Selection();
      var range = selection.range.cloneRange();
      range.selectNodeContents(scribe.el);

      return range.toString().length;
    };

    var isAtEndOfBlock = function() {
      var currentRange = selectionRange(scribe.el);

      return (getTotalLength() === currentRange.end) && (currentRange.start === currentRange.end);
    };

    var createBlocksFromParagraphs = function() {
      var fakeContent = document.createElement('div');
      fakeContent.appendChild(selectToEnd().extractContents());

      stripFirstEmptyElement(fakeContent);

      // Add wrapper div which is missing in non blockElement scribe.
      if (!scribe.allowsBlockElements()) {
        var tempContent = document.createElement('div');
        tempContent.appendChild(fakeContent);
        fakeContent = tempContent;
      }

      if (fakeContent.childNodes.length >= 1) {
        var data;
        var nodes = Array.from(fakeContent.childNodes);
        nodes.reverse().forEach(function(node) {
          if (node.innerText !== '') {
            data = {
              format: 'html',
              text: node.innerHTML.trim()
            };
            block.mediator.trigger("block:create", 'Text', data, block.el);
          }
        });
      }
    };

    var isAtStart = false;

    scribe.el.addEventListener('keydown', function(ev) {

      if (ev.keyCode === 13 && !ev.shiftKey) { // enter pressed
        ev.preventDefault();

        if (isAtEndOfBlock()) {

          // Remove any bad characters after current selection.
          selectToEnd().extractContents();
          block.mediator.trigger("block:create", 'Text', null, block.el);
        } else {
          createBlocksFromParagraphs();
        }

        // If the block is left empty then we need to reset the placeholder content.
        if (scribe.allowsBlockElements() && scribe.getTextContent() === '') {
          scribe.setContent('<p><br></p>');
        }

      } else if ((ev.keyCode === 37 || ev.keyCode === 38) && isAtStartOfBlock()) {
        ev.preventDefault();

        block.mediator.trigger("block:focusPrevious", block.blockID);
      } else if (ev.keyCode === 8 && isAtStartOfBlock()) {
        ev.preventDefault();

        isAtStart = true;
      } else if ((ev.keyCode === 39 || ev.keyCode === 40) && isAtEndOfBlock()) {
        ev.preventDefault();

        block.mediator.trigger("block:focusNext", block.blockID);
      }
    });

    scribe.el.addEventListener('keyup', function(ev) {
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
