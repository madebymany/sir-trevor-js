
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
    $('head').append('<link rel="stylesheet" href="'+data.stylesheet+'" type="text/css">');
    
    // Get the gist data (too big to store in JSON)
    var callbackSuccess = function(data) {
      this.$el.html(_.template(gist_template, data));
      this.$dropzone.hide();
      this.$el.show();
      this.ready();
    };

    var callbackFail = function(){
      this.ready();
    };
    
    // Make our AJAX call
    $.ajax({
      url: "https://gist.github.com/" + data.id + ".json",
      dataType: "JSONP",
      success: _.bind(callbackSuccess, this),
      error: _.bind(callbackFail, this)
    });
  },
  
  onContentPasted: function(event){
    // Content pasted. Delegate to the drop parse method
    var input = $(event.target),
        val = input.val();
    
    // Validate the URL
    
    // Pass to the 'onDrop' function
    this._super("onDrop", val);
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    console.log(url);
    if(_.isURI(url)) 
    {
      if (url.indexOf("gist") != -1) {
        // Twitter status
        var ID = url.match(/[^\/]+$/);
        
        if (!_.isEmpty(ID)) {
          this.loading();
          
          ID = ID[0];
          
          var callbackSuccess = function(data) {
            // Streamlined (we can't store the div item, we'll need to grab it each time)
            var obj = {
              id: ID,
              gist_url: url,
              stylesheet: data.stylesheet
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
            url: "https://gist.github.com/" + ID + ".json",
            dataType: "JSONP",
            success: _.bind(callbackSuccess, this),
            error: _.bind(callbackFail, this)
          });
        }
      }
    }
  }
});

SirTrevor.BlockTypes.Gist = new Gist();