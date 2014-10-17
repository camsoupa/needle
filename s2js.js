var fs = require('fs'),
    parse = require('sexpression').parse,
    _ = require('lodash');

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

var onFilesDone = function (classes) { 
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
  console.log(JSON.stringify({classes: outClasses, methods: methods}, null, 2));
}

function getMethodSig(m) {
  /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
  return [m.clazz.replace(/\//g, '.'), m.name].join('.') + '(' + m.params.join(',') + ') => ' + m.ret; 
}

function getMethodSigFromInvoke(m) {
  return m.name.replace(/\//g, '.') + '(' + m.params.join(',') + ') => ' + m.ret; 
}

function processFiles(files, classes) {
  if (!classes) classes = {};
  if (files.length) {
    console.log(_.last(files));
    fs.readFile(files.pop(), { encoding: 'utf-8' }, function (err, data) {
      var clazz = matchClass(parse(data));
      classes[clazz.name] = clazz;
      processFiles(files, classes);   
    });
  } else {
    onFilesDone(classes);
  }
}

var path = process.argv[2];
fs.readdir(path, function (err, files) {
  processFiles(_.map(files, function (f) { return path + f; }));
})


