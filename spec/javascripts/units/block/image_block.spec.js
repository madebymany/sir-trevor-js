describe('Image block', function() {

  var element, editor, blockManager;
  SirTrevor.DEBUG = false;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
    blockManager = editor.block_manager;
  });

  it("should be able to be created", function(){
    var l = blockManager.blocks.length;
    editor.mediator.trigger('block:create', "Image", {});
    expect(blockManager.blocks.length).toBe(l + 1);
    expect(blockManager.blocks[0].type).toBe("image");
  });

  it("upload success function should be overridable", function(){

    SirTrevor.Blocks.Image.prototype.onUploadSuccess = function(){
      return "I was totes overridden!";
    };

    SirTrevor.Blocks.Image.prototype.onUploadError = function(jqXHR){
      return "I was also overridden!";
    };

    editor.mediator.trigger('block:create', "Image", {});
    var image = blockManager.blocks[0];

    spyOn(image, "uploader").andCallFake(function(file, onUploadSuccess, onUploadError) {
      expect(onUploadSuccess()).toBe("I was totes overridden!");
      expect(onUploadError()).toBe("I was also overridden!");
    });

    image.onDrop({files:[{type: "image/gif"}]});

    expect(image.uploader).toHaveBeenCalled();
  });

});
