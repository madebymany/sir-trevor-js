var fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    getit = require('../'),
    testfile = path.resolve(__dirname, 'test.txt'),
    testContent,
    opts = {
        cwd: __dirname
    };
    
describe('bitbucket scheme test', function() {
    before(function(done) {
        getit('https://bitbucket.org/puffnfresh/roy/raw/master/README.md', function(err, content) {
            testContent = content;
            done(err);
        });
    });
    
    it('should be able to download a file using the bitbucket scheme', function(done) {
        getit('bitbucket://puffnfresh/roy/README.md', function(err, content) {
            expect(err).to.not.exist;
            expect(content).to.equal(testContent);
            
            done(err);
        });
    });
});