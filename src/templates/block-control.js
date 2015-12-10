"use strict";

var config = require('../config');

module.exports = ({title, type, icon_name}) => {
  return `
    <button class="st-block-controls__button" data-type="${type}" type="button">
      <svg role="img" class="st-icon">
        <use xlink:href="${config.defaults.iconUrl}#${icon_name}"/>
      </svg>
      ${title()}
    </button>
  `;
}
