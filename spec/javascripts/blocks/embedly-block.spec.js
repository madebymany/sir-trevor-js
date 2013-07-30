describe('Embedly block', function() {

  var element, editor;
  SirTrevor.DEBUG = true;

  var testUrl = "http://yfrog.com/ng41306327j";
  var testVideoUrl = "http://bit.ly/cXVifg";

  var originalUrl = SirTrevor.Blocks.Embedly.prototype.buildAPIUrl;

  SirTrevor.Blocks.Embedly.prototype.buildAPIUrl = function(url) {
    return "http:" + originalUrl.call(this, [url]);
  };

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor(
      { blockTypes: ["Embedly"],
        el: element
      });
    SirTrevor.setBlockOptions("Embedly", {
      key: "f8357aee49354b529381411d253e597d"
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
    expect(ebly.buildAPIUrl(testUrl)).toEqual("http://api.embed.ly/1/oembed?key=f8357aee49354b529381411d253e597d&url=http%3A//yfrog.com/ng41306327j");
  });

  it("should be able to set the data from embedly", function(){

    editor.createBlock("Embedly");
    var ebly = _.last(editor.blocks);

    ebly.handleDropPaste(testUrl);

    waitsFor(function() {
      return !$.isEmptyObject(ebly.getData());
    }, "Embedly request never completed", 10000);

    runs(function () {
      expect(ebly.getData().url).toEqual("http://a.yfrog.com/img844/1410/41306327.jpg");
    });

  });

  it("should set the editor html", function(){

    editor.createBlock("Embedly");
    var ebly = _.last(editor.blocks);

    spyOn(ebly.$editor, 'html');

    ebly.handleDropPaste(testUrl);

    waitsFor(function() {
      return !$.isEmptyObject(ebly.getData());
    }, "Embedly request never completed", 10000);

    runs(function () {
      expect(ebly.$editor.html).toHaveBeenCalledWith("<img src=\"http://a.yfrog.com/img844/1410/41306327.jpg\" />");
    });

  });

  it("should set the editor html for video", function(){

    editor.createBlock("Embedly");
    var ebly = _.last(editor.blocks);

    spyOn(ebly.$editor, 'html');

    ebly.handleDropPaste(testVideoUrl);

    waitsFor(function() {
      return !$.isEmptyObject(ebly.getData());
    }, "Embedly request never completed", 10000);

    runs(function () {
      expect(ebly.$editor.html).toHaveBeenCalledWith("<iframe width=\"854\" height=\"480\" src=\"http://www.youtube.com/embed/-oElH6M_5i4?feature=oembed\" frameborder=\"0\" allowfullscreen></iframe>");
    });

  });
});
