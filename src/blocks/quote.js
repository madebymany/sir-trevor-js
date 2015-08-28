"use strict";

/*
  Block Quote
*/

var _ = require('../lodash');

var Block = require('../block');

var template = _.template([
  '<blockquote class="st-required st-text-block" data-primitive="text" data-formattable="true"></blockquote>',
  '<label class="st-input-label"> <%= i18n.t("blocks:quote:credit_field") %></label>',
  '<input maxlength="140" name="cite" placeholder="<%= i18n.t("blocks:quote:credit_field") %>"',
  ' class="st-input-string st-required js-cite-input" type="text" />'
].join("\n"));

module.exports = Block.extend({

  type: "quote",

  title: function() { return i18n.t('blocks:quote:title'); },

  icon_name: 'quote',

  editorHTML: function() {
    return template(this);
  },

  loadData: function(data) {
    this.loadPrimitives(data);
    this.el.querySelector('.js-cite-input').value = data.cite;
  },

});
