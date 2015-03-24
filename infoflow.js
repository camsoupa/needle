var fs = require('fs'),
    _ = require('lodash'),
    parse = require('sexpression').parse,
    matchers = require('./bin/matchers');

var cachedSourceSinkPaths = {};

function parseSourceSinkPaths (str) {
  var paths = parse(str);
  return _.map(paths, function (path) {
    return _.map(path, matchers.matchPathNode);
  })
}

exports.getSourceSinkPaths = function (appName, path, files, callback) {
 if (appName in cachedSourceSinkPaths) {
   callback(cachedSourceSinkPaths[appName]);
   return;
 }
 fs.readFile(path, { encoding: 'utf-8' }, function (err, data) {
    if(!!err) throw err;
    var paths = parseSourceSinkPaths(data); 
    
    // TODO add categories sources and sinks here
    _.forEach(paths, function (path) {
      var src = path[0];
      var snk = path[path.length-1];
      console.log(src.filename);
      src.category = files[src.filename][src.line];
      
      if (src.category && src.category.length > 1) {
        console.log(src.filename, src.line, src.category);
      }
      snk.category = files[snk.filename][snk.line];
      if (snk.category && snk.category.length > 1) {
        console.log(snk.filename, snk.line, snk.category);
      }
    });
    
    cachedSourceSinkPaths[appName] = paths;
    callback(paths);
  })  
}

