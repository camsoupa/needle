var fs = require('fs'),
    readDir = require('readdir'),
    proc = require('child_process'),
    express = require('express'),
    logger = require('morgan')('combined'),
    hl = require('highlight.js'),
    _  = require('lodash'),
    fs = require('fs'),
    /* TODO make this a build rule in package.json, or a separate node_module entirely */
    callgraph = require('./callgraph'),
    getSourceSinkPaths = require('./infoflow').getSourceSinkPaths,
    xml2js = require('xml2js'),
    search = require('./search').search;

var port = 3000;
var app = express();

function syntaxHighlightCode(filetype, code) {
  var rawLines = code.split('\n')
  var outLines = [];
  var cont;
  _.forEach(rawLines, function (ln) {   
    if (!ln.match(/^\s*$/)) {
      var result = hl.highlight(filetype, ln, false, cont);
      cont = result.continutation;
      outLines.push({text: ln, html: '<pre class="source-code">' + result.value })
    } else {
      outLines.push({text: ln, html: '<pre class="source-code"><br>' })
    }
  });
  return outLines;
}

app.use(express.static(__dirname + '/public'));
app.use(logger);

app.get('/', function(req, res){
    res.send('index.html');
});

var fileCache = {};

app.get('/search?', function (req, res) {

})

/* /file?app=Memotis&path=org.memotis.Crypto */
app.get('/file?', function (req, res) {
  var appName = req.query.app;
  var path = req.query.path;
  if (!path) {
    res.send({ filename: path, lines: [{ text: 'No Source =(', html: 'No Source =('}] });
  } else if (path in fileCache) {
    res.send(fileCache[path]);
  } else {
    path = path.replace('.java', '').replace('.sxddx', '');
    if (!path.indexOf('/_no_source/')) {
      path = path.replace('/_no_source', '');
      path = 'apps/' + appName + '/dedex/' + appName.split('-')[0] + path.replace(/\./g, '/') + '.sxddx';
    } else {
      path = 'apps/' + appName + '/' + appName.split('-')[0] + '/src/' + path.replace(/\./g, '/') + '.java';
    } 

    fs.readFile(path, { encoding: 'utf-8' }, function (err, data) { 
      if (!!err) {
        res.send({ filename: req.query.path, lines: [{ text: path, html: path }] });
        return;
      }
      fileCache[path] = { filename: path, lines: syntaxHighlightCode('java', data) };
      res.send(fileCache[path]);
    });
  }
});

var appsCache = {};

app.get('/apps', function (req, res) {
  var dir = 'apps/';
  fs.readdir(dir, function (err, files) {
    var appNames = _.filter(files, function (file) {
      return fs.statSync(dir + file).isDirectory();
    });
    var readNextManifest = function (results) {
      if(!results) results = [];
      if (appNames.length > 0) {
        var next = appNames.pop();
        if (next in appsCache) {
          results.push(appsCache[next]);
          readNextManifest(results);
        } else {
          readManifest(next, false, function (manifest) {
            appsCache[next] = manifest;
            results.push(manifest);
            readNextManifest(results);
          });
        }
      } else {
        res.send({ apps: results });
      }
    }
    readNextManifest();
  })
})

function readManifest(appName, highlightCode, callback) {
  var filename = 'AndroidManifest.xml';
  /* some folder structures are of form Vermilion-update3/Vermilion/AndroidManifest.xml */
  fs.readFile('apps/' + appName + '/' + appName.split('-')[0] + '/' + filename, { encoding: 'utf-8' }, 
    function (err, data) { 
      if (!!err) throw err;
      var parser = new xml2js.Parser({ attrkey: 'attributes' });
      parser.parseString(data, function (err2, result) {
        if (!!err2) throw err2;
        var manifest = { app: appName, filename: filename, parsed: result }
        if (highlightCode) {
          manifest.html = syntaxHighlightCode('xml', data);
        }
        callback(manifest);
      });
    });
}

/* /manifest?app=AWeather */
app.get('/manifest?', function (req, res) {
  readManifest(req.query.app, true, function (result) {
    res.send(result);
  });
});

var graphCache = {};

function getCallGraph (appName, callback) {
  if (appName in graphCache) {
    callback(graphCache[appName]);
  } else {
    // TODO: readdir recursively
    callgraph.getCallGraph(appName, 'apps/' + appName + '/dedex/', function (graph) {
      graphCache[appName] = graph;
      callback(graph);
    });
  }
}

app.get('/callgraph?', function (req, res) {
  getCallGraph(req.query.app, function (graph) {
    res.send(graph);
  })
  
});

app.get('/sourcesinks?', function (req, res) {
  var appName = req.query.app;
  var appPath = 'apps/' + appName + '/';
  getCallGraph(appName, function (cg) {
    /* TODO name file by a convention - consider apps with AppName-update#/AppName-debug.apk anomolies */
    readDir.read(appPath, [ '**.infoflow' ], function (err, files) {
      if (err) {
        console.log(err);
        // this may be reasonable but needs a warning of some kind
        //res.send(cg);
      } else if (!files.length) {
        /* no infoflow results */
        res.send(graph);
      } else { 
        getSourceSinkPaths(appName, appPath + files[0], cg.files, function (graph) {
          res.send(graph);
        })
      }
    })
  })
});

/** currently unused */
var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
  socket.on('search', function (req) {
    var appName = req.app;
    var query = req.query;
    var path = 'apps/' + appName + '/' + appName.split('-')[0] + '/src/';
    search(path, query, 
      function (data) { socket.emit('search_results', data); },
      function (error) { socket.emit('error', error); },
      function () { socket.emit('done'); });
  });
  console.log('connected');
})

console.log('listening on port 3000');

