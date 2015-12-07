"use strict";

// jshint ignore: start
module.exports = function uuid(a,b){
  for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');
  return b;
};
// jshint ignore: end
