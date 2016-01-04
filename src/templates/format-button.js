"use strict";

var config = require('../config');

module.exports = function({name, text, cmd, iconName}) {
  return `
    <button class="st-format-btn st-format-btn--${name}" data-cmd="${cmd}">
      <svg role="img" class="st-icon">
        <use xlink:href="${config.defaults.iconUrl}#${iconName}"/>
      </svg>
    </button>
  `;
};
