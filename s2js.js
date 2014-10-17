var fs = require('fs'),
    parse = require('sexpression').parse,
    _ = require('lodash'),
    find = require('recursive-readdir');

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

function matchType {
  [S('array'), type] => [ matchType(type) ],
  [S('object'), S(className)] => className,
  S(prim) => prim
}

function matchStmt {
  [S(type), regs, S(name), params, ret] if !type.indexOf('invoke')  => {
    var invoke =  {
      type: type,
      name: name,
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
  [S(type), [S('attrs'), ...attrs], S(clazz), [S('super'), S(parent)], [S('source'), file], ...members]  
    if (type === 'class' || type == 'interface') => {
      return {
        type: type,
        file: file,
        name: clazz,
        parent: parent,
        attrs: _.map(attrs, S.getSymbolName),
        methods: _.chain(members)
                  .map(matchMethodDef)
                  .filter(NOT_NULL)
                  .map(function (m) { m.clazz = clazz; m.file = file; return m; })
                  .value()
      }
  }, 
  * => null
}

var onFilesDone = function (classes, onComplete) { 
  var methods = {};
  var outClasses = {};

  _.forEach(classes, function (clazz) {
    outClasses[clazz.name] = {
      file: clazz.file,
      name: clazz.clazz,
      parent: clazz.parent,
      attrs: clazz.attrs,
      methods: []
    };
    _.forEach(clazz.methods, function (method) {
      var sig = getMethodSig(method);
      methods[sig] = method;
      outClasses[clazz.name].methods.push(sig);
    });
  });

  readSourcesAndSinks(function (sources, sinks) {
    _.forEach(methods, function (m) {
      _.forEach(m.calls, function (invoke) {
        if (invoke.signature in sources) {
          if(!(m.risks)) m.risks = [];
          invoke.isSource = true;
          invoke.category = sources[invoke.signature].category;
          m.risks.push(invoke);
        }
        if (invoke.signature in sinks) {
          if(!(m.risks)) m.risks = [];
          invoke.isSink = true;
          invoke.category = sinks[invoke.signature].category;
          m.risks.push(invoke);
        }
      })
    });
    onComplete({classes: outClasses, methods: methods});
  }); 
}

function getMethodSig(m) {
  /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
  return [m.clazz.replace(/\//g, '.'), m.name].join('.') + '(' + m.params.join(',') + ') => ' + m.ret; 
}

function getMethodSigFromInvoke(m) {
  return m.name.replace(/\//g, '.') + '(' + m.params.join(',') + ') => ' + m.ret; 
}

function processFiles(files, classes, onComplete) {
  if (!classes) classes = {};
  if (files.length) {
    console.log(_.last(files));
    fs.readFile(files.pop(), { encoding: 'utf-8' }, function (err, data) {
      var clazz = matchClass(parse(data));
      classes[clazz.name] = clazz;
      processFiles(files, classes, onComplete);   
    });
  } else {
    onFilesDone(classes, onComplete);
  }
}

var NOT_EMPTY = function (m) { return m != ''; };

function parseSourceSinkLine(ln) {
  var m = /\s*<([^:]*):\s(\S+)\s(\S+)\(([^)]*)\)>\s*\(([^)]+)\)\s*/.exec(ln);
  if (m) {
    m = m.slice(1); // matched groups 
    return {
      clazz: m[0],
      ret:   m[1],
      name:  m[2],
      params: _.filter(m[3].split(','), NOT_EMPTY),
      category: m[4] == 'NO_CATEGORY' ? 'SYSTEM' : m[4]
    };
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

function readSourcesAndSinks(onComplete) {
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

      onComplete(outSources, outSinks);
    })
  })
}

exports.getCallGraph = function (path, onComplete) {
  find(path, function (err, files) {
    if(!!err) throw err;
    processFiles(files, null, onComplete);
  })
}


