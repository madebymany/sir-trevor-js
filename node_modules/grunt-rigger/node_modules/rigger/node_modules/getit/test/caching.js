var fs = require('fs'),
    path = require('path'),
    expect = require('chai').expect,
    getit = require('../'),
    rimraf = require('rimraf'),
    testContent,
    cacheFolder = path.resolve(__dirname, '_cache'),
    target = 'github://DamonOehlman/getit/test/files/test.txt',
    cacheFile = path.join(cacheFolder, getit.getCacheTarget(target)),
    metaFile = cacheFile + '.meta',
    cacheTextOverride = 'cached_text';
    
describe('caching tests', function() {
    before(function(done) {
        fs.readFile(path.resolve(__dirname, 'files/test.txt'), 'utf8', function(err, data) {
            if (! err) {
                testContent = data;
            }
            
            done(err);
        });
    });
    
    before(function(done) {
        rimraf(cacheFolder, done);
    });
    
    it('should be able to create a filename suitable for caching', function() {
        expect(getit.getCacheTarget(target)).to.equal('github-DamonOehlman-getit-test-files-test.txt');
    });
    
    it('should be able to get the non-cached version of the file', function(done) {
        getit(target, { cachePath: cacheFolder }, function(err, data) {
            expect(err).to.not.exist;
            expect(data).to.equal(testContent);
            done(err);
        });
    });
    
    it('should have created a cache file', function(done) {
        fs.readFile(cacheFile, 'utf8', function(err, data) {
            expect(err).to.not.exist;
            expect(data).to.equal(testContent);
            done(err);
        });
    });
    
    it('should have created an metadata file', function(done) {
        fs.readFile(metaFile, 'utf8', function(err, data) {
            expect(err).to.not.exist;
            done(err);
        });
    });
    
    it('should used the cached file if we have an etag match', function(done) {
        // update the cache file with content that we can test
        fs.writeFile(cacheFile, cacheTextOverride, 'utf8', function(err) {
            if (err) {
                done(err);
            }
            else {
                getit(target, { cachePath: cacheFolder }, function(err, data) {
                    expect(err).to.not.exist;
                    expect(data).to.equal(cacheTextOverride);
                    done(err);
                });
            }
        });
    });
    
    it('should be able to cache a file locally', function(done) {
        done();
    });
});