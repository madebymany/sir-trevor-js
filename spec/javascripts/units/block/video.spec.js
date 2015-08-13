"use strict";

var utils = require('../../../../src/utils');

describe('Blocks: Video block', function() {

  var createBlock = function(type, data) {
    var element = global.createBaseElement();
    var editor = new SirTrevor.Editor({ el: element });
    var options = editor.blockManager.blockOptions;
    var Klass = SirTrevor.Blocks[utils.classify(type)];
    var block = new Klass(data, editor.id, editor.mediator, options);
    editor.blockManager.renderBlock(block);

    return block;
  };

  describe('initialize', function() {
    it('creates a video block', function() {
      var block = createBlock('video');
      expect(block).not.toBe(undefined);
    });

    it('test URL formats', function() {

      var urls = {
        youtube: [
          'http://www.youtube.com/watch?v=-wtIMTCHWuI',
          'http://www.youtube.com/v/-wtIMTCHWuI?version=3&autohide=1',
          'http://youtu.be/-wtIMTCHWuI',
          'https://www.youtube.com/watch?v=-wtIMTCHWuI&feature=youtu.be',
          'https://youtu.be/-wtIMTCHWuI?t=35',
          'http://www.youtube.com/v/PjDw3azfZWI&hl=en_US&start=1868'
        ],
        vimeo: [
          'https://vimeo.com/11111111',
          'http://vimeo.com/11111111',
          'https://www.vimeo.com/11111111',
          'http://www.vimeo.com/11111111',
          'https://vimeo.com/channels/11111111',
          'http://vimeo.com/channels/11111111',
          'https://vimeo.com/groups/name/videos/11111111',
          'http://vimeo.com/groups/name/videos/11111111',
          'https://vimeo.com/album/2222222/video/11111111',
          'http://vimeo.com/album/2222222/video/11111111',
          'https://vimeo.com/11111111?param=test',
          'http://vimeo.com/11111111?param=test'
        ]
      };

      var block = createBlock('video', urls[0]);

      for (var provider in block.providers) {
        if (typeof urls[provider] !== 'undefined') {
          var regex = block.providers[provider].regex;
          for (var i = 0; i < urls[provider].length; i++) {
            expect(urls[provider][i]).toMatch(regex);
          }
        }
      }

    });

  });

});
