"use strict";

describe("Blocks: List block", function() {
  var data;

  var getSerializedData = function(data) {
    var element = $("<textarea>");
    var editor = new SirTrevor.Editor({ el: element });
    var block = new SirTrevor.Blocks.List(data, editor.ID, editor.mediator);
    block.render();

    return block.getBlockData();
  };

  describe("with Markdown support", function() {
    beforeEach(function() {
      data = {text: ' - test'};
    });

    describe("on", function() {
      beforeEach(function() { 
        SirTrevor.setBlockOptions("List", { markdownSupport: true });
      });

      it('calls stToHtml on objects without isHtml set', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual('<ul><li>test</li></ul>');
      });

      it('sets isHtml true when saving', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.isHtml).toEqual(true);
      });

      it('doesn\'t call stToHtml on objects with isHtml set', function() {
        data.isHtml = true;
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual(' - test');
      });
    });

    describe("off", function() {
      beforeEach(function() { 
        SirTrevor.setBlockOptions("List", { markdownSupport: false });
      });

      it('doesn\'t call stToHtml', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual(' - test');
      });

      it('doesn\'t set isHtml', function() {
        var serializedData = getSerializedData(data);

        expect(serializedData.isHtml).toBeUndefined();
      });

      it('ignores isHtml value', function() {
        data.isHtml = false;
        var serializedData = getSerializedData(data);

        expect(serializedData.text).toEqual(' - test');
      });
    });
  });

  describe("with HTML support", function() {
    beforeEach(function() {
      data = {text: '<ul><li>test1</li><li>test2</li></ul>'};
    });

    it("serialization does not change HTML", function() {
      var serializedData = getSerializedData(data);
      expect(serializedData.text).toEqual('<ul><li>test1</li><li>test2</li></ul>');
    });
  });
});
