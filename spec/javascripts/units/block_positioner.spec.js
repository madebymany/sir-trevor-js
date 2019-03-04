"use strict";

describe("BlockPositioner", function(){

  var positioner, positionerSelect, el, mediator;

  beforeEach(function() {
    el = document.createElement("div");
    mediator = Object.assign({}, SirTrevor.Events);
    positioner = new SirTrevor.BlockPositioner(el, mediator);
    positionerSelect = new SirTrevor.BlockPositionerSelect(mediator);
    positionerSelect.positioner = positioner;
  });

  describe("onSelectChange", function() {
    beforeEach(function() {
      spyOn(positioner.mediator, "trigger");
    });

    it("triggers a block:changePosition when the select value isn't 0", function() {
      positionerSelect.select = {value: 2};
      positionerSelect.onSelectChange();

      expect(positionerSelect.mediator.trigger)
        .toHaveBeenCalledWith("block:changePosition", el, 2, 'after');
    });

    it("triggers a block:changePosition with the type set as before when the value is 1", function() {
      positionerSelect.select = {value: 1};
      positionerSelect.onSelectChange();

      expect(positionerSelect.mediator.trigger)
        .toHaveBeenCalledWith("block:changePosition", el, 1, 'before');
    });
  });

});
