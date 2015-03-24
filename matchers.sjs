var _ = require('lodash');

var NOT_NULL = function (m) { return !!m; };
var NOT_EMPTY = function (m) { return m != ''; };

function getMethodSignature(m) {
  /*excluding because invoke stmts do not have attrs: m.attrs.join(' ') + ' ' + */
  return [m.clazz, m.name].join('.') + '(' + m.params.join(',') + ') => ' + m.ret; 
}

function getMethodSigFromInvoke(m) {
  return m.name + '(' + m.params.join(',') + ') => ' + m.ret; 
}

function class2Filename(className) {
  return className.split('$')[0].replace(/\./g, '/');
}

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

/** Matches .infoflow files */

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


/** Matches .sxddx files */

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

function buildClass(type, attrs, path, filename, parent, members) {
  var clazz = path.replace(/\//g, '.');
  var parent = parent.replace(/\//g, '.');
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
  }
}

function matchClass {
  [S(type), [S('attrs'), ...attrs], S(path), [S('super'), S(parent)], [S('source'), file], ...members]  
    if (type == 'class' || type == 'interface') => {
      return buildClass(type, attrs, path, path.split('$')[0], parent, members)
  },
  [S(type), [S('attrs'), ...attrs], S(path), [S('super'), S(parent)], ...members]  
    if (type == 'class' || type == 'interface') => {
      return buildClass(type, attrs, '/_no_source/' + path, '/_no_source/' + path, parent, members)
  }, 
  * => null
}

module.exports = {
  matchClass: matchClass,
  matchPathNode: matchPathNode,
  NOT_NULL: NOT_NULL,
  NOT_EMPTY: NOT_EMPTY,
  getMethodSignature: getMethodSignature
}


