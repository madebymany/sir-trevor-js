"use strict";

const _ = require('../../lodash');
const Dom = require('../../packages/dom');
const config = require('../../config');
const fileUploader = require('../../extensions/file-uploader');
const DropArea = require('../helpers/drop-area');

const TYPE = 'image';

var ImageField = function(block, options) {
  
  this.type = TYPE;

  this.data = {};

  this.block = block;

  this.options = Object.assign({}, options, this.block.primitiveOptions.default, this.block.primitiveOptions[this.ref]);

  this.setElement(this.options.el);
  this.setupInputs();
  this.setupEvents();
};

Object.assign(ImageField.prototype, {

  setElement: function(template_or_node) {
    if (template_or_node) {
      if (template_or_node.nodeType) {
        this.el = template_or_node;
      } else {
        var wrapper = Dom.createElement('div', {html: template_or_node});
        this.el = wrapper.querySelector('[data-primitive]');
      }
      this.ref = this.el.getAttribute('name');
      this.required = this.el.hasAttribute('data-required');
      this.draggable = this.el.hasAttribute('data-draggable');
    } else {
      this.el = Dom.createElement('div');
      this.ref = this.options.name;
      this.required = this.options.required;
      this.draggable = this.options.draggable;
    }
  },

  setupInputs: function() {
    this.inputs = Dom.createElement('div');

    if (this.draggable) {
      this.dropArea = new DropArea(this, {drop_options: this.block.drop_options});
      this.inputs.appendChild(this.dropArea.el);
    }
    
    var upload_options = Object.assign({}, config.defaults.Block.upload_options, this.block.upload_options);
    this.inputs.insertAdjacentHTML("beforeend", _.template(upload_options.html, this));
    
    this.el.appendChild(this.inputs);
  },

  setContent: function(data) {
    this.setData(data);
    Dom.remove(this.image);
    this.image = Dom.createElement('img', { src: this.data.file.url });
    this.el.appendChild(this.image);
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

    if (/image/.test(file.type)) {
      Dom.hide(this.inputs);
      this.image = Dom.createElement('img', { src: urlAPI.createObjectURL(file) });
      this.el.appendChild(this.image);
      
      this.uploader(file);
    } else {
      this.block.addMessage(i18n.t('blocks:image:incorrect_file_type'));
    }
  },

  onUploadSuccess: function(data) {
    this.setData(data);
  },
  onUploadError: function(error) {
    this.block.addMessage(i18n.t('blocks:image:upload_error'));
    this.showInputs();    
  },

  showInputs: function() {
    Dom.remove(this.image);
    Dom.show(this.inputs);
  },

  uploader: function(file){
    return fileUploader(this, this.options.uploadUrl, file, 
              this.onUploadSuccess.bind(this), 
              this.onUploadError.bind(this));
  },

  getData: function() {
    return this.data;
  },

  setData: function(data) {
    this.data = data;
  },

  focus: function() {},

  blur: function() {},

  validate: function() {
    return !(this.required && !_.isEmpty(this.getData));
  },

  addError: function() {
    this.el.classList.add('st-error');
  },

  removeError: function() {
    this.el.classList.remove('st-error');
  },

});

module.exports = ImageField;
