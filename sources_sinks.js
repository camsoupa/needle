var fs = require('fs'),
    _ = require('lodash'),
    matchers = require('./bin/matchers');

var cachedSources;
var cachedSinks;

function parseSourceSinkLine(ln) {
  var m = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*((?:\S+\s+)*)\(([^)]+)\)\s*/.exec(ln);
  if (m) {
    m = m.slice(1); // matched groups 
    return {
      clazz: m[0],
      ret:   m[1],
      name:  m[2],
      params: _.filter(m[3].split(','), matchers.NOT_EMPTY),
      permissions: m[4].split(' '),
      category: m[5].replace('NO_CATEGORY', 'GENERAL').replace('_INFORMATION', '').replace('SYNCHRONIZATION', 'SYNC')
    };
  } else {
      console.log("Ignoring source/sink line: " + ln)
  }
}

function parseSourceSinkList(path, onComplete) {
  fs.readFile(path, { encoding: 'utf-8' }, function (err, data) {
    if(!!err) throw err;
    var lines = data.split('\n');
    var parsed = _.chain(lines).map(parseSourceSinkLine).filter(matchers.NOT_NULL).value(); 
    onComplete(parsed);
  }) 
}

exports.readSourcesAndSinks = function(onComplete) {
  if (!!cachedSources && !!cachedSinks) {
    onComplete(cachedSources, cachedSinks);
    return;
  }
  parseSourceSinkList('data/sources_list', function (sources) {
    parseSourceSinkList('data/sinks_list', function (sinks) {
      var outSources = {};
      var outSinks = {};

      _.forEach(sources, function (src) {
        outSources[matchers.getMethodSignature(src)] = src;
      })

      _.forEach(sinks, function (sink) {
        outSinks[matchers.getMethodSignature(sink)] = sink;
      })
      cachedSources = outSources; cachedSinks = outSinks;
      onComplete(outSources, outSinks);
    })
  })
}

