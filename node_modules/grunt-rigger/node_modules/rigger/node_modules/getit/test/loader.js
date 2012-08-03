var fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    getit = require('../'),
    testContent,
    opts = {
        cwd: __dirname
    };
    
describe('local loading test', function() {
    before(function(done) {
        fs.readFile(path.resolve(__dirname, 'files/test.txt'), 'utf8', function(err, data) {
            if (! err) {
                testContent = data;
            }
            
            done(err);
        });
    });
    
    it('should be able to load a local file', function(done) {
        getit('files/test.txt', opts, function(err, data) {
            expect(err).to.not.exist;
            expect(data).to.equal(testContent);
            done(err);
        });
    });
    
    it('should be able to load a remote file', function(done) {
        getit('github://DamonOehlman/getit/test/files/test.txt', opts, function(err, data) {
            expect(err).to.not.exist;
            expect(data).to.equal(testContent);
            done(err);
        });
    });
    
    it('should return an error for a non-existant remote file', function(done) {
        getit('github://DamonOehlman/getit/test/files/test2.txt', opts, function(err, data) {
            expect(err).to.exist;
            done();
        });
    });
});