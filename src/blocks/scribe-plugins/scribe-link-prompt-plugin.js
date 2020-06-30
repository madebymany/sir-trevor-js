"use strict";

var selectionRange = require('selection-range');
var Modal = require('../../packages/modal');
var _ = require('../../lodash');

var MODAL_FORM_TEMPLATE = [
  '<p>',
    '<input id="<%= modal.id %>-url" type="text" value="<%= url %>" />',
  '</p>',
  '<p>',
    '<label>',
      '<input id="<%= modal.id %>-target" type="checkbox" <%= new_tab ? \'checked="checked"\' : "" %>>',
      i18n.t("formatters:link:new_tab"),
    '</label>',
  '</p>'
].join("\n");

const scribeLinkPromptPlugin = function(block) {
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

  // ===== PROMPTS ===== //
  var userPrompts = [
    {
      // For emails we just look for a `@` symbol as it is easier.
      regexp: /@/,
      message: i18n.t("formatters:link:message", { type: i18n.t("formatters:link:types:email"), prefix: 'mailto:' }),
      action: function(link) {
        return 'mailto:' + link;
      }
    },
    {
      // For tel numbers check for + and numerical values
      regexp: /\+?\d+/,
      message: i18n.t("formatters:link:message", { type: i18n.t("formatters:link:types:telephone"), prefix: 'tel:' }),
      action: function(link) {
        return 'tel:' + link;
      }
    },
    {
      regexp: /.+/,
      message: i18n.t("formatters:link:message", { type: i18n.t("formatters:link:types:url"), prefix: 'http://' }),
      action: function(link) {
        return 'http://' + link;
      }
    }
  ];

  function processPrompt(window, link) {
    for (var i = 0; i < userPrompts.length; i++) {
      var prompt = userPrompts[i];

      if (prompt.regexp.test(link)) {
        var userResponse = window.confirm(prompt.message);

        if (userResponse) {
          // Only process the first prompt
          return prompt.action(link);
        }
      }

    };

    return link;
  }

  // ===== CHECKS ===== //
  var urlProtocolRegExp = /^https?\:\/\//;
  var mailtoProtocolRegExp = /^mailto\:/;
  var telProtocolRegExp = /^tel\:/;
  var knownProtocols = [urlProtocolRegExp, mailtoProtocolRegExp, telProtocolRegExp];

  function emptyLink(string) {
    return /\w/.test(string);
  }

  function hasKnownProtocol(urlValue) {
    // If a http/s or mailto link is provided, then we will trust that an link is valid
    return knownProtocols.some(function(protocol) { return protocol.test(urlValue)});
  }

  // ===== TRANSFORMS ===== //
  function runTransforms(transforms, initialLink) {
    return transforms.reduce(function(currentLinkValue, transform) {
      return transform(currentLinkValue);
    }, initialLink);
  }

  return function(scribe) {
    const linkPromptCommand = new scribe.api.Command('linkPrompt');
    linkPromptCommand.nodeName = 'A';

    linkPromptCommand.queryEnabled = () => {
      return block.inline_editable;
    };

    linkPromptCommand.queryState = () => {
      /**
       * We override the native `document.queryCommandState` for links because
       * the `createLink` and `unlink` commands are not supported.
       * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
       */
      var selection = new scribe.api.Selection();
      return !! selection.getContaining(function(node) {
        return node.nodeName === linkPromptCommand.nodeName;
      });
    };

    linkPromptCommand.execute = function linkPromptCommandExecute(passedLink) {
      var selection = new scribe.api.Selection();
      var range = selection.range;
      var anchorNode = selection.getContaining(function(node) {
        return node.nodeName === linkPromptCommand.nodeName;
      });

      if (anchorNode) {
        range.selectNode(anchorNode);
        selection.selection.removeAllRanges();
        selection.selection.addRange(range);
      }

      var initialLink = anchorNode ? anchorNode.href : '';
      var initialTabState = anchorNode && anchorNode.target == '_blank';

      var form = _.template(MODAL_FORM_TEMPLATE, {
        modal: modal,
        url: passedLink || initialLink,
        new_tab: initialTabState
      })

      modal.show({
        title: i18n.t("formatters:link:prompt"),
        content: form
      }, function(modal) {
        var link = modal.el.querySelector(`#${modal.id}-url`).value
        var target = modal.el.querySelector(`#${modal.id}-target`).checked ? '_blank' : null
        link = runTransforms(block.transforms.pre, link);

        if (!emptyLink(link)) {
          window.alert( i18n.t("errors:link_empty"));
          return false;
        }

        if (block && block.validation) {
          var validationResult = block.validation(link);
  
          if (!validationResult.valid) {
            window.alert(validationResult.message ||  i18n.t("errors:link_invalid"));
            return false;
          }
        }

        if (link) {
          if (!hasKnownProtocol(link) ) {
            link = processPrompt(window, link);
          }
  
          link = runTransforms(block.transforms.post, link);

          var selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);

          var html = `<a href="${link}" target="${target}">${selection}</a>`;
          document.execCommand('insertHTML', false, html);
        }

        return true;
      })
    };

    scribe.commands.linkPrompt = linkPromptCommand;
  };
};

module.exports = scribeLinkPromptPlugin;
