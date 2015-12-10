"use strict";

module.exports = function({name, text, cmd, iconName}) {
  return `
    <button class="st-format-btn st-format-btn--${name}" data-cmd="${cmd}">
      <svg role="img" class="st-icon">
        <use xlink:href="../src/icons/sir-trevor-icons.svg#${iconName}"/>
      </svg>
    </button>
  `;
};
