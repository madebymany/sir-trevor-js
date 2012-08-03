var url = require('url');

module.exports = function(parts, original) {
    var pathParts = parts.pathname.replace(/^\//, '').split('/');
    
    return 'https://raw.github.com/' + parts.host + '/' + 
        pathParts[0] + '/master/' + pathParts.slice(1).join('/');
};