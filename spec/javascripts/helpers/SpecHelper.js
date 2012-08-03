beforeEach(function() {
  this.addMatchers({
    toHaveOwnProperty: function(expectedProperty) {
      var obj = this.actual;
      return obj.hasOwnProperty(expectedProperty);
    }
  });
});