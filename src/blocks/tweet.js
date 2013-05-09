var t_template = '<p>Drop tweet link here</p><div class="input text"><label>or paste URL:</label><input type="text" class="paste-block"></div>';
var tweet_template = '<div class="tweet"><img src="<%= user.profile_image_url %>" class="tweet-avatar"><div class="tweet-body"><p class="tweet-user"><a href="http://twitter.com/#!/<%= user.screen_name %>" class="tweet-user">@<%= user.screen_name %></a> on Twitter</p><p class="tweet-text"><%= text %></p><time><%= created_at %></time></div></div>';

SirTrevor.Blocks.Tweet = SirTrevor.Block.extend({ 
  
  title: "Tweet",
  className: "tweet",
  dropEnabled: true,
  
  dropzoneHTML: t_template,
  
  loadData: function(data){
    this.$editor.html(_.template(tweet_template, data));
  },
  
  onContentPasted: function(event){
    // Content pasted. Delegate to the drop parse method
    var input = $(event.target),
        val = input.val();
    
    // Pass this to the same handler as onDrop
    this.handleTwitterDropPaste(val);
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
            this.setData(obj);
            this._loadData();
            
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
    this.handleTwitterDropPaste(url);
  }
});
