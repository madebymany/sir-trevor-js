var expect = require('expect.js'),
    rigger = require('..'),
    fs = require('fs'),
    path = require('path'),
    inputPath = path.resolve(__dirname, 'input-settings'),
    outputPath = path.resolve(__dirname, 'output');
    
function notJSON(file) {
    return path.extname(file).toLowerCase() !== '.json';
}

// run tests for each of the input files
fs.readdir(inputPath, function(err, files) {
    describe('setting parser tests', function() {
        
        // create a test for each of the input files
        (files || []).filter(notJSON).forEach(function(file) {
            it('should be able to rig: ' + file, function(done) {
                // open the json datafile
                fs.readFile(path.join(inputPath, path.basename(file, '.js') + '.json'), 'utf8', function(err, content) {
                    var comparison = JSON.parse(content);
                    
                    // read the output file
                    rigger(path.join(inputPath, file), 'utf8', function(parseErr, parsed, settings) {
                        expect(settings).to.eql(comparison);
                        
                        done(parseErr);
                    });
                });
            });
        });
    });
});