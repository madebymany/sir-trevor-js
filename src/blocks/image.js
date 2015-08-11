"use strict";

var Dom = require('../packages/dom');
var Block = require('../block');

module.exports = Block.extend({

  type: "image",
  title: function() { return i18n.t('blocks:image:title'); },

  droppable: true,
  uploadable: true,

  icon_name: 'image',

  loadData: function(data){
    // Create our image tag
    this.editor.innerHTML = '';
    this.editor.appendChild(Dom.createElement('img', { src: data.file.url }));
  },

  onBlockRender: function(){
    /* Setup the upload button */
    Array.prototype.forEach.call(this.inputs.querySelectorAll('button'), function(button) {
      button.addEventListener('click', function(ev){ ev.preventDefault(); });
    });
    Array.prototype.forEach.call(this.inputs.querySelectorAll('input'), function(input) {
      input.addEventListener('change', (function(ev) {
        this.onDrop(ev.currentTarget);
      }).bind(this));
    }.bind(this));
  },

  onDrop: function(transferData){
    var file = transferData.files[0],
        urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

    // Handle one upload at a time
    if (/image/.test(file.type)) {
      this.loading();
      // Show this image on here
      Dom.hide(this.inputs);
      this.editor.innerHTML = '';
      this.editor.appendChild(Dom.createElement('img', { src: urlAPI.createObjectURL(file) }));
      Dom.show(this.editor);
      
      this.uploader(
        file,
        function(data) {
          this.setData(data);
          this.ready();
        },
        function(error) {
          this.addMessage(i18n.t('blocks:image:upload_error'));
          this.ready();
        }
      );
    }
  }
});
