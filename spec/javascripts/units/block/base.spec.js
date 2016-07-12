"use strict";

require('../../../../locales/fr');

describe("Block", function(){

  var element, editor, block, block_two, block_three;

  beforeEach(function(){

    SirTrevor.Blocks.ComplexType = SirTrevor.Block.extend({
      type: "complex_type"
    });

    element = global.createBaseElement();
    editor  = new SirTrevor.Editor({
      el: element,
      blockTypes: ["Text"]
    });
    block = new SirTrevor.Blocks.Text({}, editor.ID, editor.mediator);
    block_two = new SirTrevor.Blocks.Text({}, editor.ID, editor.mediator);
    block_three = new SirTrevor.Blocks.ComplexType({}, editor.ID, editor.mediator);
  });

  afterEach(function(){
    delete SirTrevor.Blocks.ComplexType;
  });

  it("block is instance of ST.Block", function(){
    expect(block instanceof SirTrevor.Block).toBeTruthy();
  });

  it("can be able to be created", function(){
    expect(block).not.toBe(undefined);
  });

  it("has a type set", function(){
    expect(block.type.toLowerCase()).toBe("text");
  });

  it("has a unique identifier", function(){
    expect(block.blockID).not.toBe(block_two.blockID);
  });

  it("has a title", function(){
    expect(block.title()).toBe("Text");
  });

  it("correctly localizes a title", function(){
    SirTrevor.config.language = 'fr';
    expect(block.title()).toBe(SirTrevor.Locales.fr.blocks.text.title);
    SirTrevor.config.language = 'en';
  });

  it("correctly titleizes underscored types", function(){
    expect(block_three.title()).toBe("Complex Type");
  });

  describe("dom functions", function(){

    it("has an el associated with it", function(){
      expect(block.el).not.toBe(undefined);
    });

    it("has a shorthand method for selecting elements under the el", function(){
      expect(typeof block.$).toBe('function');
    });

  });

  describe("render", function(){

    beforeEach(function(){
      spyOn(block, 'beforeBlockRender');
      spyOn(block, 'checkAndLoadData');

      block.render();
    });

    it("is renderable", function(){
      expect(typeof block.render).toBe('function');
    });

    it("has an inner element", function(){
      expect(block.inner).not.toBe(undefined);
    });

    it("has an editor element", function(){
      expect(block.editor).not.toBe(undefined);
    });

    it("has a ready class", function(){
      expect(block.el.classList.contains('st-item-ready')).toBe(true);
    });

    it("calls beforeBlockRender", function(){
      expect(block.beforeBlockRender).toHaveBeenCalled();
    });

    it("calls checkAndLoadData", function(){
      expect(block.checkAndLoadData).toHaveBeenCalled();
    });

    describe('initTextBlocks', function() {
      beforeEach(function() {
        spyOn(block, '_initTextBlocks');
      });

      it('is called when block has text block', function() {
        block.hasTextBlock = function() { return true; };

        block.render();

        expect(block._initTextBlocks).toHaveBeenCalled();
      });

      it('isn\'t called when block doesn\'t have text blocks', function() {
        block.hasTextBlock = function() { return false; };

        block.render();

        expect(block._initTextBlocks).not.toHaveBeenCalled();
      });
    });
  });

  describe("configuring Scribe", function() {
    describe("with a function (configureScribe)", function() {
      beforeEach(function(){
        block.configureScribe = function(scribe){
          scribe.allowBlockElements = false;
        };
        block.render();
      });

      it("configures scribe instance", function() {
        expect(block._scribe.allowBlockElements).toBe(false);
      });
    });

    describe("with an object (scribeOptions)", function() {
      beforeEach(function() {
        block.scribeOptions = {allowBlockElements: false};
        block.render();
      });

      it("instantiates scribe with options", function() {
        expect(block._scribe.options.allowBlockElements).toBe(false);
      });
    });
  });

  describe("_serializeData", function() {
    it("should serialize elements", function() {
      block_three.editorHTML = `
        <div class="st-text-block" contenteditable="true"></div>
        <input type="text" name="inputtext1" value="inputtext1" />
        <textarea name="textarea1">textarea1</textarea>
        <input type="checkbox" name="checkbox1" value="1" checked="checked" />
        <input type="checkbox" name="checkbox2" value="2" />
        <input type="checkbox" name="checkbox3" value="3" data-toggle="true" />
        <input type="checkbox" name="checkbox4" value="4" checked="checked" data-toggle="true" />
        <input type="radio" name="radio1" value="radio11" data-name="radio1" />
        <input type="radio" name="radio1" value="radio12" data-name="radio1" checked="checked" />
        <input type="radio" name="radio2" value="radio21" data-name="radio2" />
        <input type="radio" name="radio2" value="radio22" data-name="radio2" />
        <select name="select1">
          <option>select11</option>
          <option selected="selected">select12</option>
        </select>
        <select name="select2">
          <option></option>
          <option>select21</option>
          <option>select22</option>
        </select>
      `;
      block_three.render();

      var data = {
        text: '<p><br></p>',
        format: 'html',
        inputtext1: 'inputtext1', 
        textarea1: 'textarea1', 
        checkbox1: '1', 
        checkbox2: '',
        checkbox3: 'off',
        checkbox4: 'on',
        radio1: 'radio12', 
        select1: 'select12',
        'select2': ''
      };

      expect(block_three._serializeData()).toEqual(data);
    });
  });
});
