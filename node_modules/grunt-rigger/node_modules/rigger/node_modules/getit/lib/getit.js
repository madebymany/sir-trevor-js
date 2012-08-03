var debug = require('debug')('getit'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    mkdirp = require('mkdirp'),
    url = require('url'),
    reRemote = /^\w[\w\.\+\-]+\:\/\//,
    reStatusCached = /^304$/,
    reStatusOK = /^(2|3)\d+/,
    reAlias = /^([\w\-]+)\!(.*)$/,
    reInvalidCacheChars = /(\:\/+|\/+|\.(?!\w+$))/g,
    reCharset = /^.*charset\=(.*)$/,
    reTrailingSlash = /\/$/,
    reLeadingSlash = /^\//;
    
// cache helpers

function _getCacheData(target, opts, callback) {
    var cacheData = {};
    
    // if we have no cache folder, then trigger the callback with no data
    if (! opts.cachePath) {
        callback(cacheData);
    }
    // otherwise, look for an etag file
    else {
        var cacheFile = path.resolve(opts.cachePath, getCacheTarget(target)),
            metaFile = cacheFile + '.meta';
            
        // read the etag file
        fs.readFile(metaFile, 'utf8', function(err, data) {
            var match, encoding;
            
            if (! err) {
                cacheData = JSON.parse(data);
                
                // look for an encoding specification in the metadata
                match = reCharset.exec(cacheData['content-type']);
                encoding = match ? match[1] : 'utf8';
                
                fs.readFile(cacheFile, encoding, function(err, data) {
                    if (! err) {
                        cacheData.data = data;
                    }
                    
                    callback(cacheData);
                });
            }
            else {
                callback(cacheData);
            }
        });
    }
}

function _updateCache(target, opts, resErr, res, body, callback) {
    if (opts.cachePath && (! resErr) && res.headers && (opts.cacheAny || res.headers.etag)) {
        var cacheFile = path.resolve(opts.cachePath, getCacheTarget(target)),
            metaFile = cacheFile + '.meta';
        
        mkdirp(opts.cachePath, function(err) {
            if (! err) {
                // create the metadata file
                fs.writeFile(metaFile, JSON.stringify(res.headers), 'utf8', function(err) {
                    var match = reCharset.exec(res.headers['content-type']),
                        encoding = match ? match[1] : 'utf8';
                    
                    fs.writeFile(cacheFile, body, encoding, function(err) {
                        callback();
                    });
                });
            }
        });
    }
    else {
        callback();
    }
}
    
function getit(target, opts, callback) {
    // check for options being omitted
    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }
    
    // initialise opts
    opts = opts || {};
    opts.cwd = opts.cwd || process.cwd();
    opts.aliases = opts.aliases || {};

    // expand aliases
    target = expandAliases(target, opts.aliases);

    // check if the target looks like a remote target
    if (isRemote(target)) {
        // get the target url
        var targetUrl = getUrl(target),
            requestOpts = {
                method: 'GET',
                uri: targetUrl
            };
            
        // make the request
        if (callback) {
            _getCacheData(target, opts, function(cacheData) {
                // if we have cache data then add the if-none-match header
                if (cacheData.etag) {
                    requestOpts.headers = {
                        'If-None-Match': cacheData.etag
                    };
                }
                
                if (opts.preferLocal && cacheData.data) {
                    callback(null, cacheData.data);
                }
                else {
                    debug('requesting remote resource (' + targetUrl + '), for target: ' + target);
                    request(requestOpts, function(err, res, body) {
                        debug('received response for target: ' + target);

                        // ensure we have a response to work with
                        res = res || {};

                        if (reStatusCached.test(res.statusCode)) {
                            callback(err, cacheData.data);
                        }
                        else if (! reStatusOK.test(res.statusCode)) {
                            callback(new Error(((res.headers || {}).status || 'Not found')) + ': ' + targetUrl);
                        }
                        else {
                            _updateCache(target, opts, err, res, body, function() {
                                callback(err, err ? null : body);
                            });
                        }
                    });
                }
            });

            return null;
        }
        else {
            debug('creating stream for retrieving: ' + targetUrl);
            return request(targetUrl);
        }
    }
    else {
        var targetFile = path.resolve(opts.cwd, target);

        // if a callback is defined, then read the file using the fs.readFile function
        if (callback) {
            debug('reading file: ' + targetFile);
            fs.readFile(targetFile, 'utf8', function(err, data) {
                debug('read file: ' + targetFile + ', err: ' + err);

                callback(err, data);
            });
            
            return null;
        }
        // otherwise, return a read file stream
        else {
            return fs.createReadStream(targetFile);
        }
    }
}

function getCacheTarget(target) {
    return target.replace(reInvalidCacheChars, '-');
}

function getUrl(target) {
    var parts = url.parse(target),
        scheme = parts.protocol.slice(0, parts.protocol.length - 1),
        translator;
        
    // try and include the scheme translator
    try {
        translator = require('./schemes/' + scheme);
    }
    catch (e) {
        // no translator found, leave the handler blank
    }
    
    // if we have a translator, then use it
    if (translator) {
        target = translator(parts, target);
    }
    
    // return the target
    return target;
}

function expandAliases(target, aliases) {
    var match = reAlias.exec(target);
    
    aliases = aliases || {};
    
    // if the target is an aliases, then construct into an actual target
    if (match) {
        var base = (aliases[match[1]] || '').replace(reTrailingSlash, '');
        
        // update the target
        target = base + '/' + match[2].replace(reLeadingSlash, '');
        debug('found alias, ' + match[1] + ' expanding target to: ' + target);
    }
    
    return target;
}

function isRemote(target, opts) {
    return reRemote.test(target) || reAlias.test(target);
}

exports = module.exports = getit;
exports.getUrl = getUrl;
exports.expandAliases = expandAliases;
exports.isRemote = isRemote;
exports.getCacheTarget = getCacheTarget;