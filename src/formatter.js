var Format = SirTrevor.Formatter = function(options){
  this.formatId = _.uniqueId('format-');
  this._configure(options || {});
  this.initialize.apply(this, arguments);
};

var formatOptions = ["title", "className", "cmd", "keyCode", "param", "onClick", "toMarkdown", "toHTML"];

_.extend(Format.prototype, {
  
  title: '',
  className: '',
  cmd: null,
  keyCode: null,
  param: null,
  toMarkdown: function(markdown){ return markdown; },
  toHTML: function(html){ return html; },
  
  initialize: function(){},
  
  _configure: function(options) {
    if (this.options) options = _.extend({}, this.options, options);
    for (var i = 0, l = formatOptions.length; i < l; i++) {
      var attr = formatOptions[i];
      if (options[attr]) this[attr] = options[attr];
    }
    this.options = options;
  },
  
  _bindToBlock: function(block) {
    
    var formatter = this,
        ctrlDown = false;
        
    block
      .on('keyup','.text-block', function(ev) {
        if(ev.which == 17 || ev.which == 224) { 
          ctrlDown = false;
        }
      })
      .on('keydown','.text-block', { formatter: formatter }, function(ev) {
        if(ev.which == 17 || ev.which == 224) { 
          ctrlDown = true;
        }  
        if(ev.which == ev.data.formatter.keyCode && ctrlDown === true) {
          document.execCommand(ev.data.formatter.cmd, false, true);
          ev.preventDefault();
        }
      });
  }
});

Format.extend = extend; // Allow our Formatters to be extended.