"use strict";

var _ = require('../lodash');
var utils = require('../utils');
var Block = require('../block');

module.exports = Block.extend({

  // more providers at https://gist.github.com/jeffling/a9629ae28e076785a14f
  providers: {
    vimeo: {
      regex: /(?:http[s]?:\/\/)?(?:www.)?vimeo.com\/(.+)/,
      html: "<iframe src=\"<%= protocol %>//player.vimeo.com/video/<%= remote_id %>?title=0&byline=0\" width=\"580\" height=\"320\" frameborder=\"0\"></iframe>"
    },
    youtube: {
      regex: /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
      html: "<iframe src=\"<%= protocol %>//www.youtube.com/embed/<%= remote_id %>\" width=\"580\" height=\"320\" frameborder=\"0\" allowfullscreen></iframe>"
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
      .html(_.template(source.html, {
        protocol: protocol,
        remote_id: data.remote_id,
        width: this.$editor.width() // for videos like vine
      }));
  },

  onContentPasted: function(event){
    this.handleDropPaste(event.target.value);
  },

  matchVideoProvider: function(provider, index, url) {
    var match = provider.regex.exec(url);
    if(match == null || _.isUndefined(match[1])) { return {}; }

    return {
      source: index,
      remote_id: match[1]
    };
  },

  handleDropPaste: function(url){
    if (!utils.isURI(url)) { return; }

    for(var key in this.providers) { 
      if (!this.providers.hasOwnProperty(key)) { continue; }
      this.setAndLoadData(
        this.matchVideoProvider(this.providers[key], key, url)
      );
    }
  },

  onDrop: function(transferData){
    var url = transferData.getData('text/plain');
    this.handleDropPaste(url);
  }
});

