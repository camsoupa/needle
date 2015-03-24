var fs = require('fs'),
    readDir = require('readdir'),
    matchClass = require('../bin/matchers').matchClass,
    parse = require('sexpression').parse;

describe('matchClass', function () {
  it('should match a class/interface', function () {
    var sxddxDir = 'spec/sxddx/';
    var files = readDir.readSync(sxddxDir, [ '**.sxddx' ])
    expect(files.length).not.toBe(0);
    files.forEach(function (file) {
      console.log("test parsing:", file);
      var contents = fs.readFileSync(sxddxDir + file,  { encoding: 'utf-8' });
      expect(matchClass(parse(contents))).not.toBe(null);
    })
  })   
})
