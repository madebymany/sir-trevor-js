describe("BlockControls", function(){

  describe("creating a new instance", function(){

    var block_control;

    beforeEach(function(){
      block_control = new SirTrevor.BlockControls([],'');
    });

    it("can be created", function(){
      expect(block_control).toBeDefined();
    });

    it("sets the available_types", function(){
      expect(block_control.available_types).toBeDefined();
    });

    it("creates an $el", function(){
      expect(block_control.$el).toBeDefined();
    });

    it("creates an el", function(){
      expect(block_control.el).toBeDefined();
    });

  });

  describe("setting available_types", function(){

    var block_control;

    beforeEach(function(){
      block_control = new SirTrevor.BlockControls({
        'Text' : true,
        'Image' : true
      }, '');
    });

    it("creates a control element for every type given", function(){
      expect(block_control.$el.children().length).toBe(2);
    });

  });

});