var _ = require('lodash'),
    spawn = require('child_process').spawn,
    extractor = require('tarball-extract'),
    readDir = require('readdir');

var level = 6 //the compression level from 0-9, default: 6
var memLevel = 6 //the memory allocation level from 1-9, default: 6
var proprietary = true //to include or not proprietary headers, default: true

function dedex(apkPath, destPath, callback) {
  console.log('dedex', apkPath, destPath);
  var child = spawn('./apk2s', [ apkPath, destPath], { stdio: 'inherit', cwd: './tools' });
  child.on('close', function (code, signal) {
    console.log(code, signal);
    callback(code != 0 ? code : null);  
  })
}

function infoflow(apkPath, destPath, callback) {
  console.log('infoflow', apkPath, destPath);
  /** infofow require the stdio to be hooked up or does not terminate */
//  var child = spawn('./infoflow', [ apkPath, destPath], { stdio: 'inherit', cwd: './tools' });
//  child.on('close', function (code, signal) {
//    console.log(code, signal);
//    callback(code != 0 ? code : null);  
//  })
  callback();
}

function processAppTarball(tarPath, appsRootDir, onProgress, onDone) {
  /** make sure appsRootDir is an absolute path */
  extractor.extractTarball(tarPath, appsRootDir, function (err) {
    if (err) { 
      console.log(err)
      onDone(err);
    } else {
      console.log('success');
      var appName = _.last(tarPath.split('/')).split('.')[0]
      var appOutDir = appsRootDir + appName + '/';
      console.log(appOutDir);
      readDir.read(appOutDir, [ '**.apk' ], function (err, files) {
        if (err) {
          console.log(err);
          onDone(err);
        } else {
          var apkPath = appOutDir + files[0];
          console.log(apkPath);
          processApp(apkPath, onProgress, onDone);
        }
      })
    }
  })
}

/**
 * apkPath the path of the apk file.  Expected to be sibling of AndroidManifest.xml and src/ dir
 */
function processApp (apkPath, onProgress, onDone) { 
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
        onDone();
      } else {
        onProgress(infoflowErr);
      }
    })
  })
}

exports.processAppTarballs = function (rootTarPath, appsRootDir, onProgress, onDone) {
  readDir.read(rootTarPath, [ '**.tgz' ], function (err, files) {
    if (err)
      console.log(err);
    else {
      function processRemainingApps (remainingFiles) {
        console.log(remainingFiles);
        if (!remainingFiles.length) {
          onDone('All apps processed');
          return;
        } 
        var tarPath = rootTarPath + remainingFiles.shift();
        processAppTarball(tarPath, appsRootDir, onProgress, function (doneMsg) {
          onProgress(doneMsg);
          processRemainingApps(remainingFiles);
        })
      }
      processRemainingApps(files);
    }
  })  
}

exports.processAppTarball = processAppTarball;
exports.processApp = processApp;

