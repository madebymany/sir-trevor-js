/*
  Underscore helpers
*/

var url_regex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

_.mixin({
  isURI : function(string) {
    return (url_regex.test(string));
  }
});