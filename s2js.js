var fs = require('fs'),
    parse = require('sexpression').parse,
    _ = require('lodash');

var NOT_NULL = function (m) { return !!m; };

/* extracts a javascript encoded symbol for pattern matching */
var $ = {
  getSymbolName: function { 
    { ':' : name } => name,
    *          => null
  },
  hasInstance: function(x) {
    return !!$.getSymbolName(x);
  },
  unapply: function(x) {
    var name = $.getSymbolName(x);
    if (name) {
      return [name];
    }
  }
};

var filename = process.argv[2];

var classes = {};

function matchType {
  [$('array'), type] => [ matchType(type) ],
  [$('object'), className] => className,
  $(prim) => prim
}

function matchStmt {
  [$(type), regs, $(name) params, ret] if !type.indexOf('invoke')  => {
    return {
      type: type,
      name: name,
      params: _.map(params, matchType),
      ret: matchType(ret)
    }
  },
  [$('line'), ln] => ln,
  * => null
}

function matchMethodDef {
  [$('method'), [$('attrs'), ...attrs], $(method), params@Array, ret, ...body] => {
    var lines = [];
    var stmts = _.chain(body).map(matchStmt).filter(NOT_NULL).value();
    _.forEach(stmts, function (stmt) {
      if (typeof stmt === "number") {
        lines.push(stmt);
      } else {
        stmt.line = _.last(lines);
      }
    });
 
    return {
      name: method,
      startLine: lines[0],
      endLine: _.last(lines),
      attrs: _.map(attrs, $.getSymbolName),
      params: _.map(params, matchType),
      ret: matchType(ret),
      calls: calls
    }
  }, 
  * => null
}

function matchClass {
  [$('class'), [$('attrs'), ...attrs], $(clazz), [$('super'), $(parent)], [$('source'), file], ...members] => {
    return {
      file: file,
      name: clazz,
      parent: parent,
      attrs: _.map(attrs, $.getSymbolName),
      methods: _.chain(members)
                .map(matchMethodDef)
                .filter(NOT_NULL)
                .map(function (m) { m.owner = clazz; m.file = file; })
                .value()
    }
  }, 
  * => null
}

fs.readFile(filename, { encoding: 'utf-8' }, function (err, data) {
  var classExpr = matchClass(parse(data));
  console.log(JSON.stringify(classExpr, null, 2));
  
})
