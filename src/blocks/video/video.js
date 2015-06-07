"use strict";

var utils = require('../../utils');
var Block = require('../../block');

var youtubeTemplate = require("./youtube.ejs");
var vimeoTemplate = require("./vimeo.ejs");

function matchVideoProvider(providers, url) {
  var data;

  Object.keys(providers).some(function(key){
    var match = url.match(providers[key].regex);

    if(!match || !match[1]) {
      return false;
    }

    data = {
      source: key,
      remote_id: match[1]
    };
    return true;
  });

  return data;
}

module.exports = Block.extend({

  // more providers at https://gist.github.com/jeffling/a9629ae28e076785a14f
  providers: {
    vimeo: {
      regex: /(?:http[s]?:\/\/)?(?:www.)?vimeo.com\/(.+)/,
      html: vimeoTemplate
    },
    youtube: {
      regex: /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
      html: youtubeTemplate
    }
  },

  type: 'video',
  title: function() { return i18n.t('blocks:video:title'); },

  droppable: true,
  pastable: true,

  icon_name: 'video',

  loadData: function(data){
    if (!this.providers.hasOwnProperty(data.source)) { return; }

    var source = this.providers[data.source];

    var protocol = window.location.protocol === "file:" ? 
      "http:" : window.location.protocol;

    var aspectRatioClass = source.square ?
      'with-square-media' : 'with-sixteen-by-nine-media';

    this.$editor
      .addClass('st-block__editor--' + aspectRatioClass)
      .html(source.html({
        protocol: protocol,
        remote_id: data.remote_id,
        width: this.$editor.width() // for videos like vine
      }));
  },

  onContentPasted: function(event){
    this.handleDropPaste(event.target.value);
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this.handleDropPaste(url);
  },

  handleDropPaste: function(url){

    if (!utils.isURI(url)) {
      return; 
    }

    var data = matchVideoProvider(this.providers, url);

    if (!data) {
      return;
    }

    this.setData(data);
  }

});

