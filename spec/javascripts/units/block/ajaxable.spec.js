describe("Ajaxable Block", function() {

  var QueuedObject;

  beforeEach(function(){
    QueuedObject = _.extend({}, SirTrevor.BlockMixins.Ajaxable);
    spyOn(SirTrevor.EventBus, 'trigger');
  });

  describe("addQueuedItem", function() {

    beforeEach(function() {
      QueuedObject._queued = [];
      QueuedObject.addQueuedItem("12345", {});
    });

    it("should have the item in the queue", function() {
      var item = _.find(QueuedObject._queued, function(q) {
        return q.name == "12345";
      });

      expect(item).toBeDefined();
    });

    it("should trigger the event bus with onUploadStart", function() {
      expect(SirTrevor.EventBus.trigger).toHaveBeenCalledWith("onUploadStart");
    });

  });

  describe("removeQueuedItem", function() {

    beforeEach(function() {
      QueuedObject._queued = [];
      QueuedObject.addQueuedItem("12345", {});
      QueuedObject.removeQueuedItem("12345");
    });

    it("should no longer have the item in the queue", function() {
      var item = _.find(QueuedObject._queued, function(q) {
        return q.name == "12345";
      });

      expect(item).not.toBeDefined();
    });

    it("should trigger the event bus with onUploadStop", function() {
      expect(SirTrevor.EventBus.trigger).toHaveBeenCalledWith("onUploadStop");
    });

  });

});