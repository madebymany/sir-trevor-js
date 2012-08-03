var async = require('async'),
    debug = require('debug')('rigger'),
    getit = require('getit'),
    Stream = require('stream').Stream,
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    
    // define some reusable regexes,
    reLineBreak = /\n/,
    reLeadingDot = /^\./,
    reTrailingDot = /\.$/,
    reMultiTarget = /^(.*?)\[(.*)\]$/,
    
    reIncludeDoubleSlash = /^(\s*)\/\/\=(\w*)\s*(.*)$/,
    reIncludeSlashStar = /^(\s*)\/\*\=(\w*)\s*(.*?)\s*\*\/$/,
    reIncludeHash = /^(\s*)\#\=(\w*)\s*(.*)$/,
    reQuotesLeadAndTrail = /(^[\"\']|[\"\']$)/g,
    
    // include patterns as used in interleave
    includeRegexes = {
        // core supported file types
        js:     [ reIncludeDoubleSlash, reIncludeSlashStar ],
        css:    [ reIncludeSlashStar ],

        // other cool languages that I use every now and again
        coffee: [ reIncludeHash ],
        roy:    [ reIncludeDoubleSlash ],
        styl:   [ reIncludeDoubleSlash ]
    },

    // define converters that can convert from one file type to another
    converters = {},

    // get a reference to the platform correct exists function
    _exists = fs.exists || path.exists,
    _existsSync = fs.existsSync || path.existsSync;

/**
# Class: Rigger > Stream

Create a new class of Rigger that will be used to parse a input source file and 
produce a parsed output file.

## Valid Options

- filetype {String} - (default: js) the type of file that we are processing (js, coffee, css, roy, etc)
- encoding {String} - (default: utf8) file encoding
- cwd {String} - The current working directory 
*/
function Rigger(opts) {
    // call the inherited Stream constructor
    Stream.call(this);
    
    // save a reference to the options
    // these options will be passed through to getit calls
    this.opts = opts || {};
    
    // initialise the default file format
    this.filetype = (this.opts.filetype || 'js').replace(reLeadingDot, '');
    
    // initialise the encoding (default to utf8)
    this.encoding = this.opts.encoding || 'utf8';
    
    // initialise the cwd (this is also used by getit)
    this.cwd = this.opts.cwd || process.cwd();
    this.csd = this.cwd;
    
    // initiliase the include pattern
    this.regexes = this.opts.regexes || includeRegexes[this.filetype] || includeRegexes.js;

    // initialise the stream as writable
    this.writable = true;
    
    // create a resolving queue to track resolving includes progress
    this.activeIncludes = 0;
    
    // initialise the context, if not explicitly defined, match the filetype
    this.context = this.opts.context || this.filetype;
    
    // initialise the buffer to empty
    this.buffer = '';
}

util.inherits(Rigger, Stream);

Rigger.prototype.convert = function(conversion, input, callback) {
    // get the converter
    var converter = converters[conversion],
        steps = [converter];
    
    // if we don't have a converter, then return an error
    if (! converter) {
        callback(new Error('Unable to run converter: ' + conversion));
        return;
    }
    
    // add the first step in the waterfall
    steps.unshift(function(itemCb) {
        itemCb(null, input);
    });
    
    // bind the steps
    for (var ii = 0; ii < steps.length; ii++) {
        steps[ii] = steps[ii].bind(this);
    }
    
    // start the conversion process
    async.waterfall(steps, callback);
};

Rigger.prototype.get = function(getTarget, callback) {
    var multiMatch = reMultiTarget.exec(getTarget),
        targets = [getTarget];
    
    // check whether we have more than one target
    if (multiMatch) {
        targets = multiMatch[2].split(/\,\s*/).map(function(item) {
            return multiMatch[1] + item;
        });
    }
    
    async.map(
        targets,
        this._getSingle.bind(this),
        function(err, results) {
            callback(err, (results || []).join('\n'));
        }
    );
};

Rigger.prototype.end = function() {
    // if we have active includes, then wait
    if (this.activeIncludes) {
        this.once('resume', this.end.bind(this));
    }
    else if (this.buffer) {
        this.once('resume', this.end.bind(this));
        this.write('', true);
    }
    else {
        this.emit('end');
    }
};

Rigger.prototype.write = function(data, all) {
    var rigger = this, lines,
        settings = {};
    
    // if we have active includes, then wait until we resume before pushing out more data
    // otherwise we risk pushing data back not in order (which would be less than ideal)
    if (this.activeIncludes) {
        this.once('resume', this.write.bind(this, data));
    }
    
    // split on line breaks and include the remainder
    lines = (this.buffer + data).toString(this.encoding).split(reLineBreak);
    
    // reset the remainder
    this.buffer = '';
    
    // grab everything but the last line
    // unless we are building all
    if (! all) {
        this.buffer = lines.splice(lines.length - 1)[0];
    }
        
    // process each of the lines
    async.map(
        lines,
        
        // expand the known includes
        this._expandIncludes.bind(this, settings),
        
        function(err, result) {
            // if we processed everything successfully, emit the data
            if (! err) {
                // if we have lines, then join
                if (result.length > 0) {
                    // emit a buffer for the parsed lines
                    rigger.emit('data', new Buffer(result.join('\n')));
                }
                
                // iterate through the settings and emit those settings
                for (var key in settings) {
                    rigger.emit('setting', key, settings[key]);
                }
                    
                // resume processing the stream
                rigger.emit('resume');
            }
            else {
                rigger.emit('error', err);
            }
        }
    );
    
    // pause the stream
    this.emit('pause');
};

/* core action handlers */

Rigger.prototype.include = function(match, settings, callback) {
    var target = match[3].replace(reTrailingDot, '').replace(reQuotesLeadAndTrail, ''),
        targetExt = path.extname(target),
        rigger = this, conversion;
        
    // update the current context (js, coffee, roy, css, etc)
    this.context = targetExt.slice(1).toLowerCase();
        
    // otherwise, check whether a conversion is required
    if (targetExt && this.context !== this.filetype.toLowerCase()) {
        conversion = (this.context + '2' + this.filetype).toLowerCase();
    }
    
    // get the file
    debug('including: ' + target);
    this.get(target, function(err, data) {
        callback(err, data, conversion);
    });
};

Rigger.prototype.plugin = function(match, settings, callback) {
    var pluginName = match[3],
        plugin,
        scope = {
            done: callback
        },
        packagePath = this.cwd,
        lastPackagePath = '';
        
    // first try to include a node_module from the cwd
    try {
        // FIXME: hacky
        while (packagePath && packagePath != lastPackagePath && (! _existsSync(path.join(packagePath, 'package.json')))) {
            lastPackagePath = packagePath;
            packagePath = path.dirname(packagePath);
        }

        plugin = require(path.join(packagePath, 'node_modules', 'rigger-' + pluginName));
    }
    catch (projectErr) {
        // first try an npm require for the plugin
        try {
            plugin = require('rigger-' + pluginName);
        }
        catch (npmError) {
            try {
                plugin = require('./plugins/' + pluginName);
            }
            catch (localError) {
                // not found
            }
        }
    }
    
    // if we have a plugin then call it with the temporary scope
    if (typeof plugin == 'function') {
        plugin.apply(scope, [this].concat(match.slice(4)));
    }
    else {
        callback(new Error('Unable to find plugin "' + pluginName + '"'));
    }
    
    return plugin;
};

Rigger.prototype.set = function(match, settings, callback) {
    var parts = (match[3] || '').split(/\s/),
        err;
        
    try {
        settings[parts[0]] = JSON.parse(parts.slice(1).join(' '));
    }
    catch (e) {
        err = new Error('Could not parse setting: ' + parts[0] + ', value must be valid JSON');
    }
    
    callback(err);
};

Rigger.prototype.resolve = function(targetPath) {
    var scopeRelative = path.resolve(this.csd, targetPath),
        workingRelative = path.resolve(this.cwd, targetPath);
        
    return _existsSync(scopeRelative) ? scopeRelative : workingRelative;
};

/* internal functions */

Rigger.prototype._expandIncludes = function(settings, line, callback) {
    var rigger = this, 
        ii, regexes = this.regexes,
        conversion = '', cacheResults,
        match, action;

    // iterate through the regexes and see if this line is a match
    for (ii = regexes.length; (!match) && ii--; ) {
        // test for a regex match
        match = regexes[ii].exec(line);
      
        // if we have a match, then process the result
        if (match) {
            match[2] = match[2] || 'include';
            break;
        }
    }
    
    // if we have a target, then get that content and pass that back
    if (! match) return callback(null, line);
    
    // increment the number of active includes
    this.activeIncludes += 1;
    
    // initialise the action name to the backreference
    action = match[2];

    // if the action is not defined, default to the plugin action
    if (typeof this[action] != 'function') {
        action = 'plugin';
        match.splice(2, 0, 'plugin');
    }
    
    // run the specified action
    this[action].call(this, match, settings, function(err, content, conversion) {
        // reduce the number of active includes
        rigger.activeIncludes -=1;
        
        // if we have an error, trigger the callback
        if (err) return callback(err);
        
        // parse the lines
        async.map(
            (content || '').split(reLineBreak),
            function(line, itemCallback) {
                rigger._expandIncludes(settings, match[1] + line, itemCallback);
            },
            rigger._recombinate.bind(rigger, conversion, settings, callback)
        );
    });
};

Rigger.prototype._getSingle = function(target, callback) {
    var rigger = this;
    
    // if the target is remote, then let getit do it's job
    if (getit.isRemote(target)) {
        // ensure the extension is provided
        if (path.extname(target) === '') {
            target += '.' + this.filetype;
        }
        
        // flag that we are getting the specified file
        this.emit('include:remote', target);

        // get the include
        getit(target, this.opts, callback);
    }
    // otherwise, we'll do a little more work
    else {
        var testTargets = [
            path.resolve(this.csd, target), // the target relative to the last processed include
            path.resolve(this.cwd, target)  // the target relative to the originally specified working directory
        ];

        // if the test target does not have an extension then add it
        // ensure the extension is provided
        testTargets.forEach(function(target, index) {
            // if no extension is present then include one with a filetype to the end
            // of the current test targets
            if (path.extname(target) === '') {
                testTargets[testTargets.length] = target + '.' + rigger.filetype;
            }
        });
        
        // find the first of the targets that actually exists
        async.detect(testTargets, _exists, function(realTarget) {
            if (! realTarget) {
                callback(new Error('Unable to find target for: ' + testTargets[0]));
                return;
            }
            
            // determine the type of the real target
            fs.stat(realTarget, function(err, stats) {
                if (err) {
                    callback(err);
                    return;
                }
                
                // update the current scope directory
                // FIXME: the csd is updated but never restored to the original value
                rigger.csd = path.dirname(realTarget);

                // if it is a file, then read the file and pass the content back
                if (stats.isFile()) {
                    rigger.emit('include:file', realTarget);
                    fs.readFile(realTarget, rigger.encoding, callback);
                }
                // otherwise, if the target is a directory, read the files and then read the 
                // valid file types from the specified directory
                else if (stats.isDirectory()) {
                    rigger.emit('include:dir', realTarget);                    
                    fs.readdir(realTarget, function(dirErr, files) {
                        // get only the files that match the current file type
                        files = (files || []).filter(function(file) {
                            return path.extname(file).slice(1).toLowerCase() === rigger.filetype;
                        })
                        // explicitlly sort the files
                        .sort()
                        // turn into the fully resolved path
                        .map(function(file) {
                            return path.join(realTarget, file);
                        });

                        // read each of the file contents
                        async.map(files, fs.readFile, function(readErr, results) {
                            callback(readErr, (results || []).join('\n'));
                        });
                    });
                }
            });            
        });
    }
};

Rigger.prototype._recombinate = function(conversion, settings, callback, processingError, results) {
    var content, rigger = this;
    
    if (processingError) return callback(processingError);

    // update the content
    content = results.join('\n');
    
    // if a conversion is required, then do that now
    if (conversion) {
        rigger.convert(conversion, content, function(convertErr, convertedContent) {
            // trigger the item callback
            callback(convertErr, convertedContent, settings);
        });
    }
    else {
        // trigger the item callback
        callback(null, content, settings);
    }
};

exports = module.exports = function(targetFile, encoding, callback) {
    var input, 
        parser,
        opts;
    
    // if we have no arguments passed to the function, then return a new rigger instance
    if (arguments.length === 0) {
        return new Rigger();
    }
    
    // remap arguments if required
    if (typeof encoding == 'function') {
        callback = encoding;
        encoding = undefined;
    }
    
    // initialise the options
    opts = { encoding: encoding || 'utf8' };

    // create the input stream
    input = fs.createReadStream(targetFile, opts);
    
    // add the additional rigger options
    // initialise the filetype based on the extension of the target file
    opts.filetype = path.extname(targetFile);

    // pass the rigger the cwd which will be provided to getit
    opts.cwd = path.dirname(targetFile);
    
    // create the parser
    parser = new Rigger(opts);
    
    // attach the callback
    _attachCallback(parser, opts, callback);
    
    // pipe the input to the parser
    input.pipe(parser);

    // return the parser instance
    return parser;
};

// export a manual processing helper
exports.process = function(data, opts, callback) {
    var rigger;
    
    // remap args if required
    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }
    
    // ensure options are valid
    opts = opts || {};
    
    // create a new rigger
    rigger = new Rigger(opts);
    
    // handle the callback appropriately
    _attachCallback(rigger, opts, callback);
    
    process.nextTick(function() {
        // write the data into the rigger
        rigger.write(data);
        rigger.end();
    });
    
    // return the rigger instance
    return rigger;
};

// export the rigger class
exports.Rigger = Rigger;

// expose the regexes for tweaking
exports.regexes = includeRegexes;

// intialise the default converters
['coffee2js'].forEach(function(converter) {
    converters[converter] = require('./converters/' + converter);
});

// expose the converters
exports.converters = converters;

/* private helpers */

function _attachCallback(rigger, opts, callback) {
    var output = [],
        settings = {};
    
    // ensure the options are defined
    opts = opts || {};
    
    // if we have a callback, then process the data and handle end and error events
    if (callback) {
        rigger
            .on('data', function(data) {
                output[output.length] = data.toString(opts.encoding || 'utf8');
            })
            
            .on('setting', function(name, value) {
                settings[name] = value;
            })
    
            // on error, trigger the callback
            .on('error', callback)
        
            // on end emit the data
            .on('end', function() {
                if (callback) {
                    callback(null, output.join('\n'), settings);
                }
            });
    }
}