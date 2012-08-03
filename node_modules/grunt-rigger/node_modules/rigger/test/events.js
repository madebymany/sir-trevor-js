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

describe('event tests', function() {
    it('it should trigger an include:file for a local file include', function(done) {
        rigger.process('//= noincludes', { cwd: inputPath }, function(err, output) {
        })
        .on('include:file', function() {
            done();
        });
    });

    it('it should trigger an include:dir for a local dir include', function(done) {
        rigger.process('//= input', { cwd: __dirname }, function(err, output) {
        })
        .on('include:dir', function() {
            done();
        });
    });
    
    it('it should trigger an include:remote for a remote include', function(done) {
        rigger.process('//= github://DamonOehlman/snippets/qsa', function(err, output) {
        })
        .on('include:remote', function() {
            done();
        });
    });
});