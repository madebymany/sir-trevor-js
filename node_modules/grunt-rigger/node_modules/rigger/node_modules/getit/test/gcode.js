var expect = require('chai').expect,
    getit = require('../'),
    testContent;
    
describe('gcode scheme test', function() {
    before(function(done) {
        getit('https://leveldb.googlecode.com/git/README', function(err, content) {
            testContent = content;
            done(err);
        });
    });
    
    it('should be able to download a file using the gcode scheme', function(done) {
        getit('gcode://leveldb/git/README', function(err, content) {
            expect(err).to.not.exist;
            expect(content).to.equal(testContent);
            
            done(err);
        });
    });
});