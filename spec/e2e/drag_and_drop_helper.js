'use strict';

(function() {
  
  var SimulateDragDrop = function(elem, options) {
    this.options = options;
    this.simulateEvent(elem, options);
  };

  SimulateDragDrop.prototype.simulateEvent = function(elem, options) {
    /*Simulating drag start*/
    var type = 'dragstart';
    var event = this.createEvent(type);
    this.dispatchEvent(elem, type, event);

    /*Simulating drop*/
    type = 'drop';
    var dropEvent = this.createEvent(type, {});
    dropEvent.dataTransfer = event.dataTransfer;
    this.dispatchEvent(options.dropTarget, type, dropEvent);

    /*Simulating drag end*/
    type = 'dragend';
    var dragEndEvent = this.createEvent(type, {});
    dragEndEvent.dataTransfer = event.dataTransfer;
    this.dispatchEvent(elem, type, dragEndEvent);
  };

  SimulateDragDrop.prototype.createEvent = function(type) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(type, true, true, null);
    event.dataTransfer = {
      data: {},
      setData: function(type, val) {
        this.data[type] = val;
      },
      getData: function(type) {
        return this.data[type];
      },
      setDragImage: function(el, x, y) {

      }
    };
    return event;
  };

  SimulateDragDrop.prototype.dispatchEvent = function(elem, type, event) {
    if (elem.dispatchEvent) {
      elem.dispatchEvent(event);
    } else if(elem.fireEvent) {
      elem.fireEvent("on"+type, event);
    }
  };

  window.simulateDragDrop = function(element, options) {
    new SimulateDragDrop(element, options); // jshint ignore:line
  };

})();