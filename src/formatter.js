var Format = SirTrevor.Formatter = function(options){
  this.formatId = _.uniqueId('format-');
  this._configure(options || {});
  this.className = SirTrevor.DEFAULTS.baseCSSClass + "-format-" + this.options.className;
  this.initialize.apply(this, arguments);
};

var formatOptions = ["title", "className", "cmd", "keyCode", "param", "toMarkdown", "toHTML"];

_.extend(Format.prototype, {
  
  initialize: function(){},
  
  _configure: function(options) {
    if (this.options) options = _.extend({}, this.options, options);
    for (var i = 0, l = formatOptions.length; i < l; i++) {
      var attr = formatOptions[i];
      if (options[attr]) this[attr] = options[attr];
    }
    this.options = options;
  }
});