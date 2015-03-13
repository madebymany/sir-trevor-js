"use strict";

describe('Blocks: Heading block', function() {
  var block;

  var getSerializedData = function(data) {
    var element = $("<textarea>");
    var editor = new SirTrevor.Editor({ el: element });
    var options = editor.block_manager.blockOptions;
    block = new SirTrevor.Blocks.Heading(data,
                                     editor, editor.mediator, options);
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
});
