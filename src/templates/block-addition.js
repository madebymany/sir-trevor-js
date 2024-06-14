"use strict";

var config = require('../config');

module.exports = () => {
  if (!config.defaults.modifyBlocks) {
    return '';
  }

  return `
    <button class="st-block-addition" type="button">
      <span class="st-block-addition__button">
        <svg role="img" class="st-icon">
          <use xlink:href="${config.defaults.iconUrl}#plus"/>
        </svg>
      </span>
    </button>
  `;
};
