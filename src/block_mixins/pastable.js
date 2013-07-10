SirTrevor.BlockMixins.Pastable = {

  mixinName: "Pastable",

  initializePastable: function() {
    SirTrevor.log("Adding pastable to block " + this.blockID);

    this.paste_options = _.extend({}, SirTrevor.DEFAULTS.Block.paste_options, this.paste_options);
    this.$inputs.append(_.template(this.paste_options.html, this));

    this.$('.st-paste-block')
      .bind('click', function(){ $(this).select(); })
      .bind('paste', this._handleContentPaste)
      .bind('submit', this._handleContentPaste);
  }

};