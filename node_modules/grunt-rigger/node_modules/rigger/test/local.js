var expect = require('expect.js'),
    rigger = require('..'),
    fs = require('fs'),
    path = require('path'),
    inputPath = path.resolve(__dirname, 'input'),
    outputPath = path.resolve(__dirname, 'output');

// run tests for each of the input files
fs.readdir(inputPath, function(err, files) {
    describe('local rigging tests', function() {
        
        // create a test for each of the input files
        (files || []).forEach(function(file) {
            it('should be able to rig: ' + file, function(done) {
                var targetPath = path.join(inputPath, file);
                
                fs.stat(targetPath, function(err, stats) {
                    if ((! err) && stats.isFile()) {
                        // read the output file
                        fs.readFile(path.join(outputPath, file), 'utf8', function(refErr, reference) {
                            expect(refErr, 'No output file found for test').to.not.be.ok();

                            rigger(path.join(inputPath, file), 'utf8', function(parseErr, parsed) {
                                if (! parseErr) {
                                    expect(parsed).to.equal(reference);
                                }

                                done(parseErr);
                            });
                        });
                    }
                    else {
                        done(err);
                    }
                });
            });
        });
    });
});