"use strict";

describe("BlockPositioner", function(){

  var positioner, $el, mediator;

  beforeEach(function() {
    $el = $("<div>");
    mediator = Object.assign({}, SirTrevor.Events);
    positioner = new SirTrevor.BlockPositioner($el, mediator);
  });

  describe("onSelectChange", function() {
    beforeEach(function() {
      spyOn(positioner.mediator, "trigger");
    });

    it("triggers a block:changePosition when the select value isn't 0", function() {
      positioner.$select.val = function() { return 2; };
      positioner.onSelectChange();

      expect(positioner.mediator.trigger)
        .toHaveBeenCalledWith("block:changePosition", $el, 2, 'after');
    });

    it("triggers a block:changePosition with the type set as before when the value is 1", function() {
      positioner.$select.val = function() { return 1; };
      positioner.onSelectChange();

      expect(positioner.mediator.trigger)
        .toHaveBeenCalledWith("block:changePosition", $el, 1, 'before');
    });
  });

});
