/*
  Given an array or object, flatten it and return only the key => true
*/

function flattern(obj){
  var x = {};
  _.each(obj, function(a,b) {
    x[(_.isArray(obj)) ? a : b] = true;
  });
  return x;
}