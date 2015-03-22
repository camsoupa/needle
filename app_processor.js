var targz = require('tar.gz'),
    _ = require('lodash'),
    proc = require('child_process');

var level = 6 //the compression level from 0-9, default: 6
var memLevel = 6 //the memory allocation level from 1-9, default: 6
var proprietary = true //to include or not proprietary headers, default: true

function dedex(apkPath, destPath, callback) {
  console.log('dedex', apkPath, destPath);
  proc.spawn('./apk2s', [ apkPath, destPath], { cwd: './tools' });
  proc.on('exit', function (code, signal) {
    callback(code != 0 ? code : null);  
  })
}

function infoflow(apkPath, destPath, callback) {
  console.log('infoflow', apkPath, destPath);
  proc.spawn('./infoflow', [ apkPath, destPath], { cwd: './tools' });
  proc.on('exit', function (code, signal) {
    callback(code != 0 ? code : null);  
  })
}

function anadroid(apkPath, destPath, callback) {
  callback();
}

function tapas(apkPath, destPath, callback) {
  callback();
}

/**
 * argumente archivePath, outputPath, callback(err)
 */
exports.extractApp = new targz(level, memLevel, proprietary).extract;

/**
 * apkPath the path of the apk file.  Expected to be sibling of AndroidManifest.xml and src/ dir
 */
exports.processApp = function (apkPath, onProgress, onDone) { 
  console.log('processApp')
  /* dedex the app */
  var rootPath = apkPath.split('/'); 
  var appName = rootPath.pop(/* last */);
  appName = appName.replace('.apk', '');
  rootPath = rootPath.join('/');
  var srcPath = rootPath + '/' + appName + '/src/'
  var dedexPath = rootPath + '/dedex/'
  var infoflowPath = rootPath + '/' + appName + '.infoflow'
  console.log(srcPath, dedexPath, infoflowPath);
  dedex(apkPath, dedexPath, function (dedexErr) {
    if (!dedexErr) {
      onProgress('dedex done');
    } else {
      onProgress(dedexErr);
    }
    infoflow(apkPath, infoflowPath, function (infoflowErr) {
      if (!infoflowErr) {
        onProgress('infoflow done');
      } else {
        onProgress(infoflowErr);
      }
    })
  })
}

