"use strict";

var utils = require('../../../../src/utils');

describe('Blocks: List block', function () {
  var createBlock = function(type, data) {
    var element = global.createBaseElement();
    var editor = new SirTrevor.Editor({ el: element });
    var options = editor.blockManager.blockOptions;
    var Klass = SirTrevor.Blocks[utils.classify(type)];
    var block = new Klass(data, editor.id, editor.mediator, options);
    editor.blockManager.renderBlock(block);

    return block;
  };

  describe('loading markdown', function() {
    it('can parse data in old format', function() {
      var data = {text: ' - element one\n - element two\n - element three'};
      var block = createBlock('list', data);
      var serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(3);
      expect(serializedData.listItems[0].content).toEqual('element one');
      expect(serializedData.listItems[1].content).toEqual('element two');
      expect(serializedData.listItems[2].content).toEqual('element three');
    });

    it('doesn\'t create empty list element at the end', function() {
      var data = {text: ' - element one\n - element two\n - element three\n'};
      var block = createBlock('list', data);
      var serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(3);
    });

    it('parses markdown styles inside list items', function() {
      var data = {text: ' - hello **bold**\n - hello _italics_'};
      var block = createBlock('list', data);
      var serializedData = block.getBlockData();

      expect(serializedData.listItems[0].content).toEqual('hello <b>bold</b>');
      expect(serializedData.listItems[1].content).toEqual('hello <i>italics</i>');
    });

    it('inits list with single item when empty data', function() {
      var data = {text: ''};
      var block = createBlock('list', data);
      var serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(1);
    });
  });

  describe('loading data', function() {
    it('creates a single list item if data is empty', function() {
      var data = {listItems: [], format: 'html'};
      var block = createBlock('list', data);
      var serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(1);
    });

    it('creates an editor for each list item in data', function() {
      var data = {
        listItems: [
          {content: 'one'},
          {content: 'two'},
          {content: 'three'}
        ],
        format: 'html'
      };
      var block = createBlock('list', data);
      block.getBlockData();

      expect(block.editorIds.length).toEqual(3);
    });
  });

  describe('initialize', function() {
    it('creates a single list item', function() {
      var block = createBlock('list');
      var serializedData = block.getBlockData();

      expect(serializedData.listItems.length).toEqual(1);
    });
  });
});
