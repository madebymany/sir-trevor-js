describe("a SirTrevor.FormatBar", function(){
  
  var element = $("<textarea>"),
      editor = new SirTrevor.Editor({ el: element }),
      editorOpts = new SirTrevor.Editor({ el: element, formatters: ["Bold", "Italic"] }),
      formatBar = editor.formatBar,
      formatBarOpts = editorOpts.formatBar;
  
  it("should belong to a SirTrevor.Editor instance", function() {
    expect(typeof formatBar.instance).toBe(typeof editor);
  });
  
  it("should contain all available formatting options if no options are passed", function(){
    var totalFormats = _.toArray(editor.formatters).length;
    expect(formatBar.$el.find('button').length).toBe(totalFormats);
  });
  
  it("should contain only the available formatting options when options are passed", function(){
    var totalFormats = _.toArray(editorOpts.formatters).length;
    expect(formatBarOpts.$el.find('button').length).toBe(totalFormats);
  });
});