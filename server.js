var fs = require('fs'),
    proc = require('child_process'),
    express = require('express'),
    hl = require('highlight.js'),
    _  = require('lodash'),
    fs = require('fs'),
    getCallGraph = require('./compiled/_s2js.js').getCallGraph,
    xml2js = require('xml2js');

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

app.get('/', function(req, res){
    res.send('index.html');
});

var fileCache = {};

/* /file?app=Memotis&path=org.memotis.Crypto */
app.get('/file?', function (req, res) {
  var app = req.query.app;
  var path = req.query.path;
  if (app in fileCache) {
    res.send(fileCache[path]);
  } else {
    fs.readFile('data/apps/source/' + app + '/src/' + path.replace(/\./g, '/') + '.java', 
      { encoding: 'utf-8' }, 
      function (err, data) { 
        if (!!err) throw err;
        fileCache[path] = { filename: path, lines: syntaxHighlightCode('java', data) };
        res.send(fileCache[path]);
      });
  }
});

var appsCache = {};

app.get('/apps', function (req, res) {
  var dir = 'data/apps/compiled/';
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

function readManifest(app, highlightCode, callback) {
  var filename = 'AndroidManifest.xml';
  fs.readFile('data/apps/source/' + app + '/' + filename, { encoding: 'utf-8' }, 
    function (err, data) { 
      if (!!err) throw err;
      var parser = new xml2js.Parser({ attrkey: 'attributes' });
      parser.parseString(data, function (err2, result) {
        if (!!err2) throw err2;
        var manifest = { app: app, filename: filename, parsed: result }
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

app.get('/callgraph?', function (req, res) {
  var app = req.query.app;
  if (app in graphCache) {
    res.send(graphCache[app]);
  } else {
    // TODO: readdir recursively
    getCallGraph('data/apps/compiled/' + app + '/', function (graph) {
      graphCache[app] = graph;
      res.send(graph);
    });
  }
});

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
  var child = proc.spawn('../adam/bin/adb');

  child.stdout.on('data', function (data) {
    setTimeout(function () {
      socket.emit('stdout', data); 
    }, 100);
  });

  child.stderr.on('data', function (data) {
    socket.emit('stderr', data);
  });
 
  socket.on('command', function (cmd) {
    child.stdin.write(cmd);  
  });
  console.log('connected');
})

console.log('listening on port 3000');

/*
process.stdin.on('data', function (key) {
  child.stdin.write(key);
})
*/
