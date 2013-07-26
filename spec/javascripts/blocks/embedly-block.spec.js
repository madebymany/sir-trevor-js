describe('Embedly block', function() {
  
  var element, editor;
  SirTrevor.DEBUG = true;

  var testUrl = "http://yfrog.com/ng41306327j";

    beforeEach(function(){
      element = $("<textarea>");
      editor = new SirTrevor.Editor(
        { blockTypes: ["Embedly"], 
          el: element 
        });
    });

    it("should be able to be created", function(){
      var l = editor.blocks.length;
      editor.createBlock("Embedly");
      expect(editor.blocks.length).toBe(l + 1);
    });

    it("should be able to call the correct API string", function(){

      editor.createBlock("Embedly");
      var ebly = _.last(editor.blocks);

      spyOn($, "ajax");

      ebly.handleDropPaste(testUrl);
      expect($.ajax.mostRecentCall.args[0]["url"]).toEqual("http://api.embed.ly/1/oembed?key=f8357aee49354b529381411d253e597d&url=http%3A//yfrog.com/ng41306327j");

      //console.log(ebly.getData().text);

    });
});
