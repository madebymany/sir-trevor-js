/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
var o = $(SirTrevor);
SirTrevor.subscribe = SirTrevor.on = function() {
  o.on.apply(o, arguments);
};
SirTrevor.unsubscribe = SirTrevor.off = function() {
  o.off.apply(o, arguments);
};
SirTrevor.publish = SirTrevor.trigger = function() {
  o.trigger.apply(o, arguments);
};
SirTrevor.subscribeAll = function(subscriptions) {
  _.each(subscriptions, function(subscription) {
    o.on.apply(o, arguments);
  });
};