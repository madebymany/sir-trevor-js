"use strict";

describe("Block Mixin: MultiEditable", function() {
  var element, editor, block;
  var tpl = '<div class="st-block__editor"></div>';

  beforeEach(function() {
    element = global.createBaseElement();
    editor = new SirTrevor.Editor({ 
      el: element,
      blockTypes: ["Text"]
    });

    var options = editor.blockManager.blockOptions;

    SirTrevor.Blocks.MultiBlock = SirTrevor.Block.extend({
      multi_editable: true
    });

    block = new SirTrevor.Blocks.MultiBlock({},
                                                editor.id,
                                                editor.mediator,
                                                options);

    spyOn(block, 'withMixin').and.callThrough();
    editor.blockManager.renderBlock(block);
  });

  afterEach(function() {
    delete SirTrevor.Blocks.MultiBlock;
  });

  describe('setup', function() {

    it("gets the multieditable mixin", function(){
      expect(block.withMixin)
        .toHaveBeenCalledWith(SirTrevor.BlockMixins.MultiEditable);
    });
  });

  describe('managing multiple editors', function() {
    describe('adding', function() {
      it('returns deattached rendered template', function() {
        var editorObj = block.newTextEditor(tpl, '');
        var node = editorObj.node;

        expect(node.nodeType).toEqual(Node.ELEMENT_NODE);
      });

      it('returns variable with editor div', function() {
        var editorObj = block.newTextEditor(tpl, '');
        var editor = editorObj.el;

        expect(editor.nodeType).toEqual(Node.ELEMENT_NODE);
      });

      it('instantiates scribe within template', function() {
        var editorObj = block.newTextEditor(tpl, '');
        var editor = editorObj.el;

        expect(editor.contentEditable).toEqual('true');
      });

      it('returns scribe instance', function() {
        var editorObj = block.newTextEditor(tpl, '');
        var scribe = editorObj.scribe;

        expect(scribe).toBeDefined();
        expect(scribe.getContent).toBeDefined();
      });

      it('adds editor to the list', function() {
        var editorObj = block.newTextEditor(tpl, '');

        expect(Object.keys(block.editors).length).toEqual(1);
        expect(block.editors[editorObj.id]).toEqual(editorObj);
      });

      it('sets editor content if provided', function() {
        var editorObj = block.newTextEditor(tpl, 'Hello world!');

        expect(editorObj.scribe.getContent()).toEqual('Hello world!');
      });
    });

    describe('removing', function() {
      it('removes editor from the list using the id', function() {
        var editorObj = block.newTextEditor(tpl);
        block.removeTextEditor(editorObj.id);

        expect(Object.keys(block.editors).length).toEqual(0);
        expect(block.editors[editorObj.id]).toBeUndefined();
      });
    });

    describe('getting', function() {
      it('returns currently focused editor', function() {
        // umm :/
      });
      it('returns currently focused scribe instance');
      it('returns editor object using the id', function() {
        var editorObj1 = block.newTextEditor(tpl);
        var editorObj2 = block.newTextEditor(tpl);

        expect(block.getTextEditor(editorObj1.id)).toEqual(editorObj1);
        expect(block.getTextEditor(editorObj2.id)).toEqual(editorObj2);
      });
    });
  });
});

