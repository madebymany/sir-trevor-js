"use strict";

var utils = require('../../utils');
var Block = require('../../block');
var template = require("./tweet.ejs");

function validTweetUrl(url) {
  return (
    utils.isURI(url) &&
    /^http(s)?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/.test(url)
  );
}

module.exports = Block.extend({

  type: "tweet",
  droppable: true,
  pastable: true,
  fetchable: true,

  drop_options: {
    re_render_on_reorder: true
  },

  title: function(){ return i18n.t('blocks:tweet:title'); },

  fetchUrl: function(tweetID) {
    return "/tweets/?tweet_id=" + tweetID;
  },

  icon_name: 'twitter',

  loadData: function(data) {
    data.status_url = data.status_url || '';
    this.$inner.find('iframe').remove();
    this.$inner.prepend(template(data));
  },

  onContentPasted: function(event){
    // Pass this to the same handler as onDrop
    this.handleTwitterDropPaste(event.target.value);
  },

  handleTwitterDropPaste: function(url){
    if (!validTweetUrl(url)) {
      utils.log("Invalid Tweet URL");
      return;
    }

    // Twitter status
    var tweetID = url.match(/[^\/]+$/)[0];

    if (!tweetID) {
      utils.log("Cannot find Tweet ID");
      return;
    }

    this.loading();
    this.fetch({
      url: this.fetchUrl(tweetID),
      dataType: "json"
    }, this.onTweetSuccess, this.onTweetFail);
  },

  onTweetSuccess: function(data) {
    // Parse the twitter object into something a bit slimmer..
    this.setData({
      user: {
        profile_image_url: data.user.profile_image_url,
        profile_image_url_https: data.user.profile_image_url_https,
        screen_name: data.user.screen_name,
        name: data.user.name
      },
      id: data.id_str,
      text: data.text,
      created_at: data.created_at,
      entities: data.entities,
      status_url: "https://twitter.com/" + data.user.screen_name + "/status/" + data.id_str
    });
    this.ready();
  },

  onTweetFail: function() {
    this.addMessage(i18n.t("blocks:tweet:fetch_error"));
    this.ready();
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this.handleTwitterDropPaste(url);
  }
});
