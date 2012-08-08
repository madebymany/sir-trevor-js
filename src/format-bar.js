/*
  Format Bar
  --
  Displayed on focus on a text area.
  Renders with all available options for the editor instance
*/

var FormatBar = SirTrevor.FormatBar = function(options, editorInstance) {
  this.instance = editorInstance;
  this.options = _.extend({}, SirTrevor.DEFAULTS.formatBar, options || {});
};

_.extend(FormatBar.prototype, {
  render: function(){
    console.log('Render formatBar');
  },
  show: function(){},
  hide: function(){}
});