SirTrevor.EditorStore = (function(){

  var EditorStore = function(data, mediator) {
    this.mediator = mediator;
    this.initialize(_.trim(data) || '');
  };

  _.extend(EditorStore.prototype, {

    initialize: function(data) {
      this.store = this._parseData(data) || { data: [] };
    },

    retrieve: function() {
      return this.store;
    },

    toString: function() {
      return JSON.stringify(this.store);
    },

    reset: function() {
      SirTrevor.log("Resetting the EditorStore");
      this.store = { data: [] };
    },

    addData: function(data) {
      this.store.data.push(data);
      return this.store;
    },

    _parseData: function(data) {
      var result;

      if (data.length === 0) { return result; }

      try {
        // Ensure the JSON string has a data element that's an array
        var jsonStr = JSON.parse(data);
        if (!_.isUndefined(jsonStr.data)) {
          result = jsonStr;
        }
      } catch(e) {
        this.mediator.trigger('errors:add',
          { text: i18n.t("errors:load_fail") });
        this.mediator.trigger('errors:render');

        SirTrevor.log('Sorry there has been a problem with parsing the JSON');
        SirTrevor.log(e);
      }

      return result;
    }

  });

  return EditorStore;

})();
