var fs = require('fs'),
    parse = require('sexpression').parse,
    _ = require('lodash'),
    find = require('recursive-readdir');

/* avoid recalculation each time */
var appCache = {};

var NOT_NULL = function (m) { return !!m; };

/* extracts a javascript encoded symbol for pattern matching */
var S = {
  getSymbolName: function { 
    { ':' : name } => name,
    *          => null
  },
  hasInstance: function(x) {
    return !!S.getSymbolName(x);
  },
  unapply: function(x) {
    var name = S.getSymbolName(x);
    if (name) {
      return [name];
    }
  }
};

function class2Filename(className) {
  return className.split('$')[0].replace(/\./g, '/');
}

function getPkg(clazz) {
  var parts = clazz.split('.');
  parts.pop();
  return parts.join('.');
}

function matchPathNode {
  [className, stmt, ln] => {
    return {
      className: className,
      filename: class2Filename(className),
      stmt: stmt,
      line: ln
    }
  },
  x @ * => {
    console.log(x);
    throw "matchPathNode failed!";  
  }
}

function parseSourceSinkPaths (str) {
  var paths = parse(str);
  return _.map(paths, function (path) {
    return _.map(path, matchPathNode);
  })
}

function matchType {
  [S('array'), type] => [ matchType(type) ],
  [S('object'), S(className)] => className.replace(/\//g, '.'),
  S(prim) => prim
}

function matchStmt {
  [S(type), regs, S(name), params, ret] if !type.indexOf('invoke')  => {
    var invoke =  {
      type: type,
      name: name.replace(/\//g, '.'),
      params: _.map(params, matchType),
      ret: matchType(ret)
    };
    invoke.signature = getMethodSigFromInvoke(invoke);
    return invoke;
  },
  [S(type), regs, [S('array'), array_type], S(name), params, ret] => {
    var invoke = {
      type: type,
      name: matchType(array_type) + '[]' + name.replace(/\//g, '.'),
      params: _.map(params, matchType),
      ret: matchType(ret)
    };
    invoke.signature = getMethodSigFromInvoke(invoke);
    return invoke;	
  },
  [S('line'), ln] => ln,
  * => null
}

function matchMethodDef {
  [S('method'), [S('attrs'), ...attrs], S(name), params, ret, ...body] => {
    var lines = [];
    var calls = [];
    var stmts = _.chain(body).map(matchStmt).filter(NOT_NULL).value();
    _.forEach(stmts, function (stmt) {
      if (typeof stmt === "number") {
        lines.push(stmt);
      } else {
        stmt.line = _.last(lines);
        calls.push(stmt);
      }
    });
 
    return {
      type: 'method',
      name: name,
      startLine: lines[0],
      endLine: _.last(lines),
      attrs: _.map(attrs, S.getSymbolName),
      params: _.map(params, matchType),
      ret: matchType(ret),
      calls: calls
    }
  }, 
  * => null
}

function matchClass {
  [S(type), [S('attrs'), ...attrs], S(path), [S('super'), S(parent)], [S('source'), file], ...members]  
    if (type === 'class' || type == 'interface') => {
      clazz = path.replace(/\//g, '.');
      parent = parent.replace(/\//g, '.');
      filename = path.split('$')[0];
      return {
        type: type,
        file: filename,
        name: clazz,
        parent: parent,
        attrs: _.map(attrs, S.getSymbolName),
        methods: _.chain(members)
                  .map(matchMethodDef)
                  .filter(NOT_NULL)
                  .map(function (m) { m.clazz = clazz; m.filename = filename; return m; })
                  .value()
      };
  }, 
  * => null
}

var onFilesDone = function (appName, classes, onComplete) { 
  var methods = {};
  var outClasses = {};
  var files = {};
  
  _.forEach(classes, function (clazz) {
    outClasses[clazz.name] = {
      type: clazz.type,
      file: clazz.file,
      name: clazz.name,
      parent: clazz.parent,
      attrs: clazz.attrs,
      methods: [],
      subClasses: []
    };
    files[clazz.file] = {};
    _.forEach(clazz.methods, function (method) {
      var sig = getMethodSig(method);
      methods[sig] = method;
      methods[sig].file = clazz.file;
      outClasses[clazz.name].methods.push(sig);
    });
  });
  
  /* put all parent classes into the outClasses - TODO should we pull in the source code too for java.util, etc? */
  _.forEach(_.clone(outClasses), function (clazz) {
    if(clazz.parent) {
      if(!(clazz.parent in outClasses)) {
        outClasses[clazz.parent] = {
          name: clazz.parent,
          external: true,
          methods: [],
          subClasses: [ clazz.name ]
        }
      } else {
        outClasses[clazz.parent].subClasses.push(clazz.name);
      }
    } else {
       console.log('NO PARENT FOR: ' + clazz.name);
    }
  });

  /* TODO consider if all indirectSubclasses is really what we want */
  function indirectSubclassesOf (className) {
    if (!className || !(className in outClasses)) return []; /* i.e. - no known subclasses */
    return _.flatten(outClasses[className].subClasses.concat(_.map(outClasses[className].subClasses, function (sub) { 
        return indirectSubclassesOf(sub); 
      })));
  }

  /* including direct and indirect subClasses in calls for invoke-virtual and invoke-interface */
  _.forEach(methods, function (method, methodSig) {
    _.forEach(method.calls, function (invoke) {
      if (invoke.type == 'invoke-virtual' || invoke.type == 'invoke-interface') {
        /* add known subTypes of the called class to the calls list */
        var parentClass = invoke.name.split('.').slice(0,-1).join('.');
        var methodName = invoke.name.split('.').pop();
        _.forEach(indirectSubclassesOf(parentClass), function (subClass) {
          method.calls.push({
            type: invoke.type,
            name: [subClass, methodName].join('.'),
            file: method.file,
            line: invoke.line,
            params: invoke.params,
            signature: invoke.signature.replace(parentClass, subClass),
            isInferred: true
          })
        })
      }    
    })
  })

  readSourcesAndSinks(function (sources, sinks) {
    _.forEach(methods, function (m, mSig) {
      _.forEach(m.calls, function (invoke) {

        if (invoke.signature in sources) {
          if(!(m.risks)) m.risks = [];
          invoke.isSource = true;
          invoke.category = sources[invoke.signature].category;
          m.risks.push(invoke);
          if (!(invoke.line in files[m.file])) files[m.file][invoke.line] = [];
          files[m.file][invoke.line].push(invoke.category);
        }
        if (invoke.signature in sinks) {

          if(!(m.risks)) m.risks = [];
          invoke.isSink = true;
          invoke.category = sinks[invoke.signature].category;
          m.risks.push(invoke);
          console.log(m.file);
          if (!(invoke.line in files[m.file])) files[m.file][invoke.line] = [];
          files[m.file][invoke.line].push(invoke.category);
        }
      })
    });
    appCache[appName] = {classes: outClasses, methods: methods, files: files};
    onComplete(appCache[appName]);
  }); 
}

function getMethodSig(m) {
  /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
  return [m.clazz, m.name].join('.') + '(' + m.params.join(',') + ') => ' + m.ret; 
}

function getMethodSigFromInvoke(m) {
  return m.name + '(' + m.params.join(',') + ') => ' + m.ret; 
}

function processFiles(appName, files, classes, cb) {
  if (!classes) classes = {};
  if (files.length) {
    console.log(_.last(files));
    fs.readFile(files.pop(), { encoding: 'utf-8' }, function (err, data) {
      var clazz = matchClass(parse(data));
      classes[clazz.name] = clazz;
      processFiles(appName, files, classes, cb);   
    });
  } else {
    
    onFilesDone(appName, classes, cb);
  }
}

var NOT_EMPTY = function (m) { return m != ''; };

function parseSourceSinkLine(ln) {
  var m = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*((?:\S+\s+)*)\(([^)]+)\)\s*/.exec(ln);
  if (m) {
    m = m.slice(1); // matched groups 
    return {
      clazz: m[0],
      ret:   m[1],
      name:  m[2],
      params: _.filter(m[3].split(','), NOT_EMPTY),
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
    var parsed = _.chain(lines).map(parseSourceSinkLine).filter(NOT_NULL).value(); 
    onComplete(parsed);
  }) 
}


var cachedSources;
var cachedSinks;

function readSourcesAndSinks(onComplete) {
  if (!!cachedSources && !!cachedSinks) {
    onComplete(cachedSources, cachedSinks);
    return;
  }
  parseSourceSinkList('data/sources_list', function (sources) {
    parseSourceSinkList('data/sinks_list', function (sinks) {
      var outSources = {};
      var outSinks = {};

      _.forEach(sources, function (src) {
        outSources[getMethodSig(src)] = src;
      })

      _.forEach(sinks, function (sink) {
        outSinks[getMethodSig(sink)] = sink;
      })
      cachedSources = outSources; cachedSinks = outSinks;
      onComplete(outSources, outSinks);
    })
  })
}

var cachedSourceSinkPaths = {};

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
exports.getCallGraph = function (appName, path, callback) {
  find(path, function (err, files) {
    if(!!err) throw err;
    
    /* filter out android support lib files */
	  var appFiles = _.filter(files, function (f) {
			return f.indexOf('android/support') == -1;
		})

    processFiles(appName, appFiles, null, callback);
  })
}


