describe("a SirTrevor.Marker", function(){
  
  var element, editor, editorOpts, marker, markerOpts;
  
  beforeEach(function (){
    element = $("<textarea>"),
    editor = new SirTrevor.Editor({ el: element }),
    editorOpts = new SirTrevor.Editor({ el: element, blockTypes: ["Text"] }),
    marker = editor.marker,
    markerOpts = editorOpts.marker;
  });
    
  it("should belong to a SirTrevor.Editor instance", function() {
    expect(typeof marker.instance).toBe(typeof editor);
  });
  
  it("should contain all available blockTypes if no options are passed", function(){
    var totalTypes = _.toArray(editor.blockTypes).length;
    expect(marker.$btns.find('a').length).toBe(totalTypes);
  });
  
  it("should contain only the available blockTypes when options are passed", function(){
    var totalTypes = _.toArray(editorOpts.blockTypes).length;
    expect(markerOpts.$btns.find('a').length).toBe(totalTypes);
  });
});