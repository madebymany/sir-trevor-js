SirTrevor.Blocks.Tweet = (function(){

  var tweet_template = _.template([
    "<blockquote class='twitter-tweet' align='center'>",
    "<p><%= text %></p>",
    "&mdash; <%= user.name %> (@<%= user.screen_name %>)",
    "<a href='<%= status_url %>' data-datetime='<%= created_at %>'><%= created_at %></a>",
    "</blockquote>",
    '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
  ].join("\n"));

  return SirTrevor.Block.extend({

    type: "Tweet",
    droppable: true,
    pastable: true,
    fetchable: true,

    drop_options: {
      re_render_on_reorder: true
    },

    icon_name: function() {
      return 'twitter';
    },

    loadData: function(data) {
      if (_.isUndefined(data.status_url)) { data.status_url = ''; }
      this.$inner.find('iframe').remove();
      this.$inner.prepend(tweet_template(data));
    },

    onContentPasted: function(event){
      // Content pasted. Delegate to the drop parse method
      var input = $(event.target),
          val = input.val();

      // Pass this to the same handler as onDrop
      this.handleTwitterDropPaste(val);
    },

    handleTwitterDropPaste: function(url){
      if (!this.validTweetUrl(url)) {
        SirTrevor.log("Invalid Tweet URL");
        return;
      }

      // Twitter status
      var tweetID = url.match(/[^\/]+$/);
      if (!_.isEmpty(tweetID)) {
        this.loading();
        tweetID = tweetID[0];

        var ajaxOptions = {
          url: SirTrevor.DEFAULTS.twitter.fetchURL + "?tweet_id=" + tweetID,
          dataType: "json"
        };

        this.fetch(ajaxOptions, this.onTweetSuccess, this.onTweetFail);
      }
    },

    validTweetUrl: function(url) {
      return (_.isURI(url) &&
              url.indexOf("twitter") !== -1 &&
              url.indexOf("status") !== -1);
    },

    onTweetSuccess: function(data) {
      // Parse the twitter object into something a bit slimmer..
      var obj = {
        user: {
          profile_image_url: data.user.profile_image_url,
          profile_image_url_https: data.user.profile_image_url_https,
          screen_name: data.user.screen_name,
          name: data.user.name
        },
        id: data.id_str,
        text: data.text,
        created_at: data.created_at,
        status_url: "https://twitter.com/" + data.user.screen_name + "/status/" + data.id_str
      };

      this.setAndLoadData(obj);
      this.ready();
    },

    onTweetFail: function() {
      this.addMessage("There was a problem fetching your tweet");
      this.ready();
    },

    onDrop: function(transferData){
      var url = transferData.getData('text/plain');
      this.handleTwitterDropPaste(url);
    }
  });

})();
