module.exports = function(parts, original) {
    return 'https://' + parts.host + '.googlecode.com/' + parts.pathname.replace(/^\//, '');
};