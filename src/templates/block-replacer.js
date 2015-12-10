var config = require('../config');

module.exports = `
  <button class="st-block-replacer" type="button">
    <span class="st-block-replacer__button">
      <svg role="img" class="st-icon">
        <use xlink:href="${config.defaults.iconUrl}#add-block"/>
      </svg>
    </span>
  </button>
`;
