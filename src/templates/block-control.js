"use strict";

var config = require('../config');

module.exports = (block) => {
  return `
    <button class="st-block-controls__button" data-type="${block.type}" type="button">
      <svg role="img" class="st-icon">
        <use xlink:href="${config.defaults.iconUrl}#${block.icon_name}"/>
      </svg>
      ${block.title()}
    </button>
  `;
};
