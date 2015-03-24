var fs = require('fs'),
    parse = require('sexpression').parse,
    _ = require('lodash'),
    find = require('recursive-readdir'),
    matchers = require('./bin/matchers'),
    readSourcesAndSinks = require('./sources_sinks').readSourcesAndSinks;

/* avoid recalculation each time */
var appCache = {};

function onFilesDone(appName, classes, onComplete) { 
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
      var sig = matchers.getMethodSignature(method);
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

function processFiles(appName, files, classes, cb) {
  if (!classes) classes = {};
  if (files.length) {
    console.log(_.last(files));
    fs.readFile(files.pop(), { encoding: 'utf-8' }, function (err, data) {
      var clazz = matchers.matchClass(parse(data));
      if (clazz == null) {
        console.log(data);
        console.log("Failed to match class");
      } else {
        classes[clazz.name] = clazz;
      }
      processFiles(appName, files, classes, cb);   
    });
  } else {
    
    onFilesDone(appName, classes, cb);
  }
}

exports.getCallGraph = function (appName, path, callback) {
  console.log('getCallGraph', appName, path);
  find(path, function (err, files) {
    if(!!err) { throw err; }
    
    /* filter out android support lib files */
    var appFiles = _.filter(files, function (f) {
      return f.indexOf('android/support') == -1 && f.indexOf('com/google/') == -1;
    })
    processFiles(appName, appFiles, null, callback);
  })
}

