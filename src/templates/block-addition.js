"use strict";

var config = require('../config');

module.exports = `
  <button class="st-block-addition" type="button">
    <span class="st-block-addition__button">
      <svg role="img" class="st-icon">
        <use xlink:href="${config.defaults.iconUrl}#add"/>
      </svg>
    </span>
  </button>
`;
