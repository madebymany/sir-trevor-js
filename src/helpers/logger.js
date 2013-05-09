/*
* Ultra simple logging
*/

SirTrevor.log = function(message) {
  if (!_.isUndefined(console) && SirTrevor.DEBUG) {
    console.log(message);
  }
};