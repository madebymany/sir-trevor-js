var expect = require('expect.js'),
    rigger = require('..'),
    fs = require('fs'),
    path = require('path'),
    inputPath = path.resolve(__dirname, 'input-plugins'),
    outputPath = path.resolve(__dirname, 'output');

// run tests for each of the input files
fs.readdir(inputPath, function(err, files) {
    describe('local rigging tests', function() {
        
        // create a test for each of the input files
        (files || []).forEach(function(file) {
            it('should be able to rig: ' + file, function(done) {
                fs.stat(path.join(inputPath, file), function(err, stats) {
                    // skip directories
                    if (stats.isDirectory()) {
                        done();
                        return;
                    }
                    
                    // read the output file
                    fs.readFile(path.join(outputPath, file), 'utf8', function(refErr, reference) {
                        expect(refErr).to.not.be.ok();

                        rigger(path.join(inputPath, file), 'utf8', function(parseErr, parsed) {
                            if (! parseErr) {
                                expect(parsed).to.equal(reference);
                            }

                            done(parseErr);
                        });
                    });
                });
            });
        });
    });
});