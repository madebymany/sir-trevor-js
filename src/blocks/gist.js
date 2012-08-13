/*
  Gist BlockType
*/

var template = '<p>Drop gist link here</p><div class="input text"><label>or paste URL:</label><input type="text" class="paste-block"></div>';
var gist_template = '<div class="gist"><%= div %></div>';

var Gist = SirTrevor.BlockType.extend({ 
  
  title: "Gist",
  className: "gist-block",
  dropEnabled: true,
  
  editorHTML: "<div></div>",
  
  dropzoneHTML: template,
  
  validate: function() {},
  
  loadData: function(data){
    this.loading();
    this._super("loadGist", data.id);
  },
  
  loadGist: function(gist_id) {
    // Get the gist data (too big to store in JSON)
    var callbackSuccess = function(data) {
      // Streamlined (we can't store the div item, we'll need to grab it each time)
      var obj = {
        id: gist_id
      };
      
      var dataStruct = this.$el.data('block');
      dataStruct.data = obj;
      
      $('head').append('<link rel="stylesheet" href="'+data.stylesheet+'" type="text/css">');
      
      this.$el.html(data.div);
      this.$dropzone.fadeOut(250);
      this.$el.show();
      this.ready();
    };

    var callbackFail = function(){
      this.ready();
    };
    
    // Make our AJAX call
    $.ajax({
      url: "https://gist.github.com/" + gist_id + ".json",
      dataType: "JSONP",
      success: _.bind(callbackSuccess, this),
      error: _.bind(callbackFail, this)
    });
  },
  
  onContentPasted: function(event){
    // Content pasted. Delegate to the drop parse method
    var input = $(event.target),
        val = input.val();
    this._super("handleDropPaste", val);
  },
  
  handleDropPaste: function(url) {
    if(_.isURI(url)) 
    {
      if (url.indexOf("gist") != -1) {
        // Twitter status
        var ID = url.match(/[^\/]+$/);
        
        if (!_.isEmpty(ID)) {
          this.loading();
          
          ID = ID[0];
          this._super("loadGist", ID);
        }
      }
    }
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this._super("handleDropPaste", url);
  }
});

SirTrevor.BlockTypes.Gist = new Gist();