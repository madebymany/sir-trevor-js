/*
* Ultra simple logging
*/

SirTrevor.log = function(message) {
  if (SirTrevor.DEBUG && !_.isUndefined(console)) {
    console.log(message);
  }
};
