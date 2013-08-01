describe("Validations", function(){

  var element, editor, block;

  beforeEach(function(){
    SirTrevor.instances = [];
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });

    editor.createBlock('Text', { text: "Blah" });
    block = _.last(editor.blocks);
  });

});