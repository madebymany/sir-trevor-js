var expect = require('expect.js'),
    rigger = require('..'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    inputPath = path.resolve(__dirname, 'input'),
    outputPath = path.resolve(__dirname, 'output'),
    testFiles = {
        'noincludes.js': ''
    };

describe('manual stream manipulation tests', function() {
    before(function(done) {
        async.forEach(
            Object.keys(testFiles),
            
            function(filename, itemCallback) {
                fs.readFile(path.join(outputPath, filename), 'utf8', function(err, data) {
                    testFiles[filename] = data;
                    itemCallback(err);
                });
            }, 
            
            done
        );
    });
    
    it('should be able to generate output from using rigger.write', function(done) {
        rigger.process('//= noincludes', { cwd: inputPath }, function(err, output) {
            expect(err).to.not.be.ok();
            expect(output).to.equal(testFiles['noincludes.js']);
            
            done(err);
        });
    });
});