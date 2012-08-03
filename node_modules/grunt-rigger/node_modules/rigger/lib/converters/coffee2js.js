module.exports = function(input, callback) {
    try {
        callback(null, require('coffee-script').compile(input));
    }
    catch (e) {
        callback(new Error('coffee-script module not found, cannot convert coffee2js'));
    }
};