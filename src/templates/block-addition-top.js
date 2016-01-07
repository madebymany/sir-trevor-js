"use strict";

var config = require('../config');

module.exports = () => {
  return `
    <button class="st-block-addition-top" type="button">
      <span class="st-block-addition-top__button"></span>
      <span class="st-block-addition-top__icon">
        <svg role="img" class="st-icon">
          <use xlink:href="${config.defaults.iconUrl}#add-block"/>
        </svg>
      </span>
    </button>
  `;
};
