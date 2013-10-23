/*
  Underscore helpers
*/

var url_regex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

_.mixin({
  isURI : function(string) {
    return (url_regex.test(string));
  },

  titleize: function(str){
    if (str === null) return '';
    str  = String(str).toLowerCase();
    return str.replace(/(?:^|\s|-)\S/g, function(c){ return c.toUpperCase(); });
  },

  classify: function(str){
    return _.titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
  },

  classifyList: function(a){
    return _.map(a, function(i){ return _.classify(i); });
  },

  capitalize : function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  },

  underscored: function(str){
    return _.trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
                      .replace(/[-\s]+/g, '_').toLowerCase();
  },

  trim : function(string) {
    return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  },

  reverse: function(str) {
    return str.split("").reverse().join("");
  },

  flattern: function(obj) {
    var x = {};
    _.each(obj, function(a,b) {
      x[(_.isArray(obj)) ? a : b] = true;
    });
    return x;
  },

  to_slug: function(str) {
    return str
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
  }

});

