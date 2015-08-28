"use strict";

const _ = require('../../lodash');
const Dom = require('../../packages/dom');
const config = require('../../config');
const fileUploader = require('../../extensions/file-uploader');
const DropArea = require('../helpers/drop-area');

const TYPE = 'image';

var ImageField = function(template_or_node, content, block) {
  
  this.type = TYPE;

  this.data = {};

  this.block = block;
  this.options = this.block.options;

  this.uploadUrl = this.options.uploadUrl;

  this.setElement(template_or_node);
  this.setupEvents();
};

Object.assign(ImageField.prototype, {

  setElement: function(template_or_node) {

    this.el = template_or_node;

    this.inputs = Dom.createElement('div');

    if (this.el.getAttribute('data-draggable')) {
      this.dropArea = new DropArea(this, {drop_options: this.block.drop_options});
      this.inputs.appendChild(this.dropArea.el);
    }
    
    var upload_options = Object.assign({}, config.defaults.Block.upload_options, this.block.upload_options);
    this.inputs.insertAdjacentHTML("beforeend", _.template(upload_options.html, this));
    
    this.el.appendChild(this.inputs);

    this.ref = this.el.getAttribute('data-ref');
  },

  setupEvents: function() {
    Array.prototype.forEach.call(this.el.querySelectorAll('button'), function(button) {
      button.addEventListener('click', function(ev){ ev.preventDefault(); });
    });

    Array.prototype.forEach.call(this.el.querySelectorAll('input'), (input) => {
      input.addEventListener('change', (ev) => {
        this.onDrop(ev.currentTarget);
      });
    });
  },

  onDrop: function(transferData){
    var file = transferData.files[0],
        urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

    // Handle one upload at a time
    if (/image/.test(file.type)) {
      
      Dom.hide(this.inputs);
      this.image = Dom.createElement('img', { src: urlAPI.createObjectURL(file) });
      this.el.appendChild(this.image);
      
      this.uploader(
        file,
        function(data) {
          this.setData(data);
        },
        function(error) {
          Dom.remove(this.image);
          Dom.show(this.inputs);
        }
      );
    }
  },

  uploader: function(file, success, failure){
    return fileUploader(this, file, success, failure);
  },

  getData: function() {
    return this.data;
  },

  setData: function(data) {
    this.data = data;
  },

  focus: function() {},

  blur: function() {},

});

module.exports = ImageField;
