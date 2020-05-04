"use strict";

const scribeLinkPromptPlugin = function(block) {
  // ===== INIT ===== //
  var block = block || {};

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
      message: 'The URL you entered appears to be an email address. ' +
      'Do you want to add the required “mailto:” prefix?',
      action: function(link) {
        return 'mailto:' + link;
      }
    },
    {
      // For tel numbers check for + and numerical values
      regexp: /\+?\d+/,
      message: 'The URL you entered appears to be a telephone number. ' +
                'Do you want to add the required “tel:” prefix?',
      action: function(link) {
        return 'tel:' + link;
      }
    },
    {
      regexp: /.+/,
      message: 'The URL you entered appears to be a link. ' +
                'Do you want to add the required “http://” prefix?',
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
      return !! selection.getContaining(function (node) {
        return node.nodeName === this.nodeName;
      }.bind(this));
    };

    linkPromptCommand.execute = function linkPromptCommandExecute(passedLink) {
      var link;
      var selection = new scribe.api.Selection();
      var range = selection.range;
      var anchorNode = selection.getContaining(function(node) {
        return node.nodeName === this.nodeName;
      }.bind(this));

      var initialLink = anchorNode ? anchorNode.href : '';

      if (!passedLink)  {
        link = window.prompt('Enter a link.', initialLink);
      } else {
        link = passedLink;
      }

      link = runTransforms(block.transforms.pre, link);

      if (!emptyLink(link)) {
        window.alert('This link appears empty');
        return;
      }

      if (options && options.validation) {
        var validationResult = block.validation(link);

        if (!validationResult.valid) {
          window.alert(validationResult.message || 'The link is not valid');
          return;
        }
      }

      if (anchorNode) {
        range.selectNode(anchorNode);
        selection.selection.removeAllRanges();
        selection.selection.addRange(range);
      }

      link = window.prompt('Enter a link target (Enter "_blank" to make the link open in a new tab, leave black to open in the same page).');

      if (link) {
        if (!hasKnownProtocol(link) ) {
          link = processPrompt(window, link);
        }

        link = runTransforms(options.transforms.post, link);
        scribe.api.SimpleCommand.prototype.execute.call(this, link);
      }
    };

    scribe.commands.link = linkPromptCommand;
  };
};

module.exports = scribeLinkPromptPlugin;
