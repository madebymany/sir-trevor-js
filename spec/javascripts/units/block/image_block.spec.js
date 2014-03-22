describe('Image block', function() {

  var data_uri = 'data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7';
  var element, editor;
  SirTrevor.DEBUG = false;

  beforeEach(function(){
    element = $("<textarea>");
    editor = new SirTrevor.Editor({ el: element });
  });

  it("should be able to be created", function(){
    var l = editor.blocks.length;
    editor.createBlock("Image");
    expect(editor.blocks.length).toBe(l + 1);
    expect(editor.blocks[0].type).toBe("image");
  });

  it("upload success function should be overridable", function(){

    SirTrevor.Blocks.Image.prototype.onUploadSuccess = function(){
      return "I was totes overridden!";
    };

    SirTrevor.Blocks.Image.prototype.onUploadError = function(){
      return "I was also overridden!";
    };

    editor.createBlock("Image");
    var image = editor.blocks[0];

    spyOn(image, "uploader").andCallFake(function(file, onUploadSuccess, onUploadError) {
      expect(onUploadSuccess()).toBe("I was totes overridden!");
      expect(onUploadError()).toBe("I was also overridden!");
    });

    image.handleUpload(data_uri);
  });

});