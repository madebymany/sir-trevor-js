var fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    getit = require('../'),
    testfile = path.resolve(__dirname, 'test.txt'),
    testContent,
    opts = {
        cwd: __dirname
    };
    
describe('streamed download test', function() {
    before(function(done) {
        fs.readFile(path.resolve(__dirname, 'files/test.txt'), 'utf8', function(err, data) {
            if (! err) {
                testContent = data;
            }
            
            done(err);
        });
    });
    
    it('should be able to stream a download', function(done) {
        var stream = getit('github://DamonOehlman/getit/test/files/test.txt', opts);
        
        stream.pipe(fs.createWriteStream(testfile));
        stream.on('end', function() {
            fs.readFile(testfile, 'utf8', function(err, data) {
                expect(err).to.not.exist;
                expect(data).to.equal(testContent);
                
                done();
            });
        });
    });
    
    after(function(done) {
        fs.unlink(testfile, done);
    });
});