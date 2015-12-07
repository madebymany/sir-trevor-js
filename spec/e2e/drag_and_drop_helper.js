'use strict';

(function() {
  
  var SimulateDragDrop = function(elem, options) {
    this.options = options || {};
    this.options.dataTransfer = Object.assign({
      data: {},
      setData: function(type, val) {
        this.data[type] = val;
      },
      getData: function(type) {
        return this.data[type];
      },
      setDragImage: function(el, x, y) {}
    }, this.options.dataTransfer || {});

    this.simulateEvent(elem);
  };

  SimulateDragDrop.prototype.simulateEvent = function(elem) {
    var type, event;

    if (elem) {
      /*Simulating drag start*/
      type = 'dragstart';
      event = this.createEvent(type, this.options.dataTransfer);
      this.dispatchEvent(elem, type, event);
    } else {
      event = this.createEvent('custom', this.options.dataTransfer);
    }

    /*Simulating drop*/
    type = 'drop';
    var dropEvent = this.createEvent(type);
    this.dispatchEvent(this.options.dropTarget, type, dropEvent);

    if (elem) {
      /*Simulating drag end*/
      type = 'dragend';
      var dragEndEvent = this.createEvent(type);
      this.dispatchEvent(elem, type, dragEndEvent);
    }
  };

  SimulateDragDrop.prototype.createEvent = function(type) {
    var event = document.createEvent("CustomEvent");
    event.initCustomEvent(type, true, true, null);
    event.dataTransfer = this.options.dataTransfer;
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