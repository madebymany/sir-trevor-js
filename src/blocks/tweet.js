var t_template = '<p>Drop tweet link here</p><div class="input text"><label>or paste URL:</label><input type="text" class="paste-block"></div>';
var tweet_template = '<div class="tweet media"><div class="img"><img src="<%= user.profile_image_url %>" class="tweet-avatar"></div><div class="bd tweet-body"><p><a href="http://twitter.com/#!/<%= user.screen_name %>">@<%= user.screen_name %></a>: <%= text %></p><time><%= created_at %></time></div></div>';

var Tweet = SirTrevor.BlockType.extend({ 
  
  title: "Tweet",
  className: "tweet",
  dropEnabled: true,
  
  dropzoneHTML: t_template,
  
  loadData: function(data){
    this.$block.find(".dropzone").hide();
    this.$el.show();
    this.$el.html(_.template(tweet_template, data));
  },
  
  onContentPasted: function(event){
    // Content pasted. Delegate to the drop parse method
    var input = $(event.target),
        val = input.val();
    
    // Pass this to the same handler as onDrop
    this._super("handleTwitterDropPaste", val);
  },
  
  handleTwitterDropPaste: function(url){
    
    if(_.isURI(url)) 
    {
      if (url.indexOf("twitter") != -1 && url.indexOf("status") != -1) {
        // Twitter status
        var tweetID = url.match(/[^\/]+$/);
        if (!_.isEmpty(tweetID)) {
          
          this.loading();
          
          tweetID = tweetID[0];
          
          var tweetCallbackSuccess = function(data) {
            // Parse the twitter object into something a bit slimmer..
            var obj = {
              user: {
                profile_image_url: data.user.profile_image_url,
                profile_image_url_https: data.user.profile_image_url_https,
                screen_name: data.user.screen_name,
                name: data.user.name
              },
              text: data.text,
              created_at: data.created_at,
              status_url: url
            };
            
            // Save this data on the block
            var dataStruct = this.$el.data('block');
            dataStruct.data = obj;
            this.$el.html(_.template(tweet_template, obj)); // Render
            this.$dropzone.hide();
            this.$el.show();
            
            this.ready();
          };

          var tweetCallbackFail = function(){
            this.ready();
          };
          
          // Make our AJAX call
          $.ajax({
            url: "http://api.twitter.com/1/statuses/show/" + tweetID + ".json",
            dataType: "JSONP",
            success: _.bind(tweetCallbackSuccess, this),
            error: _.bind(tweetCallbackFail, this)
          });
        }
      }
    }
    
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this._super("handleTwitterDropPaste", url);
  }
});

SirTrevor.BlockTypes.Tweet = new Tweet();