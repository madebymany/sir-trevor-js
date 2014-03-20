SirTrevor.Blocks.Columns = (function() {
  return SirTrevor.Block.extend({
    type: "Columns",
    title: function() { return i18n.t('blocks:columns:title'); },
    icon_name: 'columns',

    columns_presets: {
      'columns-6-6': [6,6],
      'columns-3-9': [3,9],
      'columns-9-3': [9,3],
      'columns-4-8': [4,8],
      'columns-8-4': [8,4],
      'columns-4-4-4': [4,4,4],
      'columns-3-6-3': [3,6,3],
      'columns-3-3-3-3': [3,3,3,3]
    },

    controllable: true,

    constructor: function(data, instance_id, sirTrevor) {
      SirTrevor.Block.apply(this, arguments);
    },

    beforeBlockRender: function() {
      this.controls = {
        'twocolumns': this.changeColumnsHandler('columns-6-6'),
        'threecolumns': this.changeColumnsHandler('columns-4-4-4'),
        'onetwocolumns': this.changeColumnsHandler('columns-4-8'),
        'twoonecolumns': this.changeColumnsHandler('columns-8-4'),
        'fourcolumns': this.changeColumnsHandler('columns-3-3-3-3'),
        'onethreecolumns': this.changeColumnsHandler('columns-3-9'),
        'threeonecolumns': this.changeColumnsHandler('columns-9-3'),
        'onetwoonecolumns': this.changeColumnsHandler('columns-3-6-3')
      };
    },

    changeColumnsHandler: function(preset) {
      var self = this;
      return function() { self.changeColumns(preset, false) };
    },

    changeColumns: function(preset) {
      if (this.columns_preset != preset)
      {
        this.applyColumns(preset);
      }
    },

    editorHTML: function() {
      return _.template(
          '<div class="columns-row" id="<%= blockID %>-columns-row" style="overflow: auto"/>'
          , {blockID: this.blockID})
    },

    _setBlockInner: function() {
      SirTrevor.Block.prototype._setBlockInner.apply(this, arguments);
      this.applyColumns('columns-6-6', true); /* default */
    },

    applyColumns: function(preset, initial)
    {
      var self = this;
      var columns_config = this.columns_presets[preset];

      var $to_delete = this.getColumns(':gt('+(columns_config.length-1)+')');
      // if there are unneeded columns
      if ($to_delete.length > 0) {
        // ask confirmation only if there are nested blocks
        if ($to_delete.children('.st-block').length > 0)
        {
          var txt = $to_delete.length == 1 ? 'column' : ($to_delete.length + ' columns');
          if (!confirm('This action will delete last ' + txt + '. Do you really want to proceed?')) {
            return; // interrupt if "Cancel" is pressed
          }
        }
        $to_delete.each(function() {
          var $this = $(this);
          // destroy nested blocks properly
          $this.children('.st-block').each(function() {
            self.sirTrevor.removeBlock(self.sirTrevor.findBlockById(this.getAttribute('id')));
          });
          // destroy column itself
          $this.trigger('destroy').remove();
        });
      }

      // apply new configuration
      var total_width = _.reduce(columns_config, function(total, width){ return total+width; }, 0);
      var $row = this.$('.columns-row');

      _.each(columns_config, function(ratio, i) {
        var width = Math.round(ratio*1000*100/total_width)/1000;

        var $column = self.getColumn(i);
        if ($column.length == 0) {
          $column = $('<div class="column" style="float: left; "></div>');
          var plus = new SirTrevor.FloatingBlockControls($column, self.instanceID);
          self.listenTo(plus, 'showBlockControls', self.sirTrevor.showBlockControls);
          $column.prepend(plus.render().$el);
          $row.append($column);
        }

        $column.css('width', width+'%');
      });

      this.$('.st-block-control-ui-btn').removeClass('active')
          .filter('[data-icon='+preset+']').addClass('active');

      this.columns_preset = preset;

      if (!initial) this.trigger('block:columns:change');
    },

    onBlockRender: function() {
      this.$('.st-block-control-ui-btn').filter('[data-icon='+this.columns_preset+']').addClass('active');
    },

    getRow: function() {
      if (this.$row) return this.$row;
      return this.$row = this.$('#'+this.blockID+'-columns-row');
    },

    getColumns: function(filter) {
      return this.getRow().children(filter);
    },

    getColumn: function(index) {
      return this.getRow().children(':eq('+index+')');
    },

    toData: function() {
      var self = this;
      var column_config = this.columns_presets[this.columns_preset];
      var dataObj = { columns: [], preset: this.columns_preset };

      this.getColumns().each(function(i) {
        var blocksData = [];
        $(this).children('.st-block').each(function(){
          var block = self.sirTrevor.findBlockById(this.getAttribute('id'));
          blocksData.push(block.saveAndReturnData());
        });

        dataObj.columns.push({
          width: column_config[i],
          blocks: blocksData
        });
      });

      this.setData(dataObj);
    },

    loadData: function(data)
    {
      if (data.preset) {
        this.applyColumns(data.preset, true);
      }

      var columns_data = (data.columns || []);
      for (var i=0; i<columns_data.length; i++)
      {
        var $block = null;
        var $column = this.getColumn(i);
        for (var j=0; j<columns_data[i].blocks.length; j++) {
          var block = columns_data[i].blocks[j];
          $block = this.sirTrevor.createBlock(block.type, block.data, $block ? $block.$el : $column.children('.st-block-controls__top'));
        }
      }
    },

    _initUIComponents: function() {
      SirTrevor.Block.prototype._initUIComponents.apply(this, arguments);
    },

    performValidations: function() {
      // nothing
    }
  });
})();
