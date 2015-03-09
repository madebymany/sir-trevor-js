"use strict";

describe('Blocks: Text block', function() {
  var data, block;

  var createBlock = function(data) {
    var element = $("<textarea>");
    var editor = new SirTrevor.Editor({ el: element });
    var options = editor.block_manager.blockOptions;
    block = new SirTrevor.Blocks.Text(data, editor.id, editor.mediator, options);

    block.render();
    return block;
  };

  var getSerializedData = function(data) {
    block = createBlock(data);
    return block.getBlockData();
  };

  beforeEach(function() {
    data = {text: 'test'};
  });

  describe('with convertToMarkdown', function() {
    beforeEach(function() {
      spyOn(SirTrevor.Blocks.Text.prototype, 'toMarkdown').and.callThrough();
    });

    describe('turned on', function() {
      beforeEach(function() { 
        SirTrevor.setDefaults({
          convertFromMarkdown: true,
          convertToMarkdown: true
        });
      });

      it('calls toMarkdown on a block', function() {
        block = createBlock(data);
        block.getBlockData();

        expect(block.toMarkdown).toHaveBeenCalled();
      });

      it('sets isHtml to false', function() {
        block = createBlock(data);
        var serializedData = block.getBlockData();

        expect(serializedData.isHtml).toEqual(false);
      });
    });

    describe('turned off', function() {
      beforeEach(function() { 
        SirTrevor.setDefaults({
          convertFromMarkdown: true,
          convertToMarkdown: false
        });
      });

      it('doesn\'t call toMarkdown on the block', function() {
        block = createBlock(data);
        block.getBlockData();

        expect(block.toMarkdown).not.toHaveBeenCalled();
      });

      it('sets isHtml to true', function() {
        block = createBlock(data);
        var serializedData = block.getBlockData();

        expect(serializedData.isHtml).toEqual(true);
      });
    });
  });

  describe('with convertFromMarkdown', function() {
    describe('turned on', function() {
      beforeEach(function() { 
        SirTrevor.setDefaults({
          convertFromMarkdown: true,
          convertToMarkdown: false
        });
      });

      // calling stToHtml on text block wraps everything in <p> tags,
      // so I use it as an easy way of testing if the method was called
      it('calls stToHtml on objects without isHtml set', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual('<p>test</p>');
      });

      it('sets isHtml true when saving', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.isHtml).toEqual(true);
      });

      it('doesn\'t call stToHtml on objects with isHtml set', function() {
        data.isHtml = true;
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual('test');
      });
    });

    describe('turned off', function() {
      beforeEach(function() { 
        SirTrevor.setDefaults({
          convertFromMarkdown: false,
          convertToMarkdown: false
        });
      });

      it('doesn\'t call stToHtml', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual('test');
      });

      it('ignores isHtml value', function() {
        data.isHtml = false;
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual('test');
      });
    });
  });
});
