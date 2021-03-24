"use strict";

var selectionRange = require('selection-range');
var Modal = require('../../packages/modal');
var Dom = require('../../packages/dom');

var MODAL_FORM_TEMPLATE = ({ modal, title, canRemove }) => {
  return `
    <p>
      <input id="${modal.id}-sup-title" type="text" value="${title}" />
    </p>
  `;
}

const scribeSuperscriptPromptPlugin = function(block) {
  // ===== INIT ===== //
  var block = block || {};
  var modal = new Modal();

  if (!block.transforms) {
    block.transforms = {};
  }

  ['pre', 'post'].forEach(function(key) {
    if (!block.transforms[key]) {
      block.transforms[key] = [];
    }
  });

  // ===== TRANSFORMS ===== //
  function runTransforms(transforms, initialLink) {
    return transforms.reduce(function(currentLinkValue, transform) {
      return transform(currentLinkValue);
    }, initialLink);
  }

  return function(scribe) {
    const superscriptPromptCommand = new scribe.api.Command('superscriptPrompt');
    superscriptPromptCommand.nodeName = 'SUP';

    superscriptPromptCommand.queryEnabled = () => {
      return block.inline_editable;
    };

    superscriptPromptCommand.queryState = () => {
      /**
       * We override the native `document.queryCommandState` for links because
       * the `createLink` and `unlink` commands are not supported.
       * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
       */
      var selection = new scribe.api.Selection();
      return !! selection.getContaining(function(node) {
        return node.nodeName === superscriptPromptCommand.nodeName;
      });
    };

    superscriptPromptCommand.execute = function superscriptPromptCommandExecute(passedTitle) {
      var selection = new scribe.api.Selection();
      var range = selection.range;
      var anchorNode = selection.getContaining(function(node) {
        return node.nodeName === superscriptPromptCommand.nodeName;
      });

      if (anchorNode) {
        range.selectNode(anchorNode);
        selection.selection.removeAllRanges();
        selection.selection.addRange(range);
      }

      var initialTitle = anchorNode ? anchorNode.title : '';

      var form = MODAL_FORM_TEMPLATE({
        modal: modal,
        title: passedTitle || initialTitle
      });

      var removeButton = "";

      if (anchorNode) {
        var removeButton = Dom.createElementFromString('<button type="button" style="background: grey;">Remove</button>');

        removeButton.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();

          var selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);

          document.execCommand('superscript', false, false);

          modal.hide();

          return true;
        });
      }

      modal.show({
        title: i18n.t("formatters:superscript:prompt"),
        content: form,
        buttons: removeButton
      }, function(modal) {
        var title = modal.el.querySelector(`#${modal.id}-sup-title`).value;

        title = runTransforms(block.transforms.pre, title);

        var attr = '';

        if (title) {
          title = runTransforms(block.transforms.post, title);
          attr = ` title="${title}"`;
        }

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        var html = `<sup${attr}>${selection}</sup>`;
        document.execCommand('insertHTML', false, html);

        return true;
      });
    };

    scribe.commands.superscriptPrompt = superscriptPromptCommand;
  };
};

module.exports = scribeSuperscriptPromptPlugin;
