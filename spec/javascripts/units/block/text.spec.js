"use strict";

describe("Blocks: Text block", function() {
  describe("with markdown support", function() {
    var data;

    var getSerializedData = function(data) {
      var element = $("<textarea>");
      var editor = new SirTrevor.Editor({ el: element });
      var block = new SirTrevor.Blocks.Text(data, editor.ID, editor.mediator);
      block.render();

      return block.getBlockData();
    };

    beforeEach(function() {
      data = {text: 'test'};
    });

    describe("on", function() {
      beforeEach(function() { 
        SirTrevor.setBlockOptions("Text", { markdownSupport: true });
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

    describe("off", function() {
      beforeEach(function() { 
        SirTrevor.setBlockOptions("Text", { markdownSupport: false });
      });

      it('doesn\'t call stToHtml', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual('test');
      });

      it('doesn\'t set isHtml', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.isHtml).toBeUndefined();
      });

      it('ignores isHtml value', function() {
        data.isHtml = false;
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual('test');
      });
    });
  });
});
