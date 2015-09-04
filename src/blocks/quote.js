"use strict";

/*
  Block Quote
*/

var _ = require('../lodash');

var Block = require('../block');

var template = _.template([
  '<blockquote class="st-required st-text-block" data-primitive="text" name="text" data-formattable="true"></blockquote>',
  '<label class="st-input-label"> <%= i18n.t("blocks:quote:credit_field") %></label>',
  '<input maxlength="140" name="cite" placeholder="<%= i18n.t("blocks:quote:credit_field") %>"',
  ' class="st-input-string" type="text" data-primitive="input" />'
].join("\n"));

module.exports = Block.extend({

  type: "quote",

  title: function() { return i18n.t('blocks:quote:title'); },

  icon_name: 'quote',

  editorHTML: function() {
    return template(this);
  },

});
