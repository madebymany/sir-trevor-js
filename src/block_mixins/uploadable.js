SirTrevor.BlockMixins.Uploadable = {

  mixinName: "Uploadable",

  uploadsCount: 0,

  initializeUploadable: function() {
    SirTrevor.log("Adding uploadable to block " + this.blockID);
    this.withMixin(SirTrevor.BlockMixins.Ajaxable);

    this.upload_options = _.extend({}, SirTrevor.DEFAULTS.Block.upload_options, this.upload_options);
    this.$inputs.append(_.template(this.upload_options.html, this));
  },

  uploader: function(file, success, failure){
    return SirTrevor.fileUploader(this, file, success, failure);
  }

};