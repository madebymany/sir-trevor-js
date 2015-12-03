"use strict";

describe('Blocks: Heading block', function() {
  var block;

  var getSerializedData = function(data) {
    var element = global.createBaseElement();
    var editor = new SirTrevor.Editor({ el: element });
    var options = editor.blockManager.blockOptions;
    block = new SirTrevor.Blocks.Heading(data,
                                     editor.id, editor.mediator, options);
    block.render();
    return block.getBlockData();
  };

  it('doesn\'t allow block level elements', function() {
    getSerializedData({text: 'Test Heading'});
    expect(block._scribe.options.allowBlockElements).toBe(false);
  });

  it('doesn\'t wrap content in <p> tags', function() {
    var data = getSerializedData({text: 'Test Heading'});
    expect(data.text).not.toContain('<p>');
  });

  it('doesn\'t save <br> at the end of the text', function() {
    var data = getSerializedData({text: 'Test Heading'});
    expect(data.text).toEqual('Test Heading');
  });

  it('converts markdown inline styling to html', function() {
    var data = getSerializedData({text: '**Test** _Heading_'});
    expect(data.text).toEqual('<b>Test</b> <i>Heading</i>');
  });

  it('doesn\'t strip HTML style tags', function() {
    var blockData = {text: '<b>Test</b> <i>Heading</i>', format: 'html'};
    var data = getSerializedData(blockData);
    expect(data.text).toEqual('<b>Test</b> <i>Heading</i>');
  });
});
