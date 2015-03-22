var extractor = require('tarball-extract');
var readDir = require('readdir');
var _ = require('lodash');
var processApp = require('./app_processor.js').processApp;
console.log(process.argv)

var tarPath = process.argv[2];
var appsRootDir = process.argv[3];

/** make sure appsRootDir is an absolute path */
extractor.extractTarball(tarPath, appsRootDir, function (err) {
  if (err) 
    console.log(err)
  else {
    console.log('success');
    var appName = _.last(tarPath.split('/')).split('.')[0]
    var appOutDir = appsRootDir + appName + '/';
    console.log(appOutDir);
    readDir.read(appOutDir, [ '**.apk' ], function (err, files) {
      if (err)
        console.log(err);
      else {
        var apkPath = appOutDir + files[0];
        console.log(apkPath);
        processApp(apkPath, function (progress) { console.log(progress); }, function (done) { console.log(done); });
      }
    })
  }
})

