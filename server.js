var fs = require('fs'),
    proc = require('child_process'),
    express = require('express'),
    hl = require('highlight.js'),
    _  = require('lodash'),
    fs = require('fs'),
    getCallGraph = require('./compiled/_s2js.js').getCallGraph;

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

app.get("/", function(req, res){
    res.send('index.html');
});

// TODO memoizing to speed up
app.get('/file/:path', function (req, res) {
  var app = 'Memotis'; // TODO accept an app param
  fs.readFile('data/apps/source/' + app + '/src/' + req.params.path.replace(/\./g, '/') + '.java', 
    { encoding: 'utf-8' }, 
    function (err, data) { 
      if (!!err) throw err;
      res.send({ filename: req.params.path, lines: syntaxHighlightCode('java', data) });
    });
}) 

app.get('/manifest/:app', function (req, res) {
  var app = req.params.app;
  var filename = 'AndroidManifest.xml';
  fs.readFile('data/apps/source/' + app + '/' + filename, { encoding: 'utf-8' }, 
    function (err, data) { 
      if (!!err) throw err;
      res.send({ filename: filename, lines: syntaxHighlightCode('xml', data) });
    });
}) 

var graphCache = {};

app.get('/callgraph/:app', function (req, res) {
  var app = req.params.app;
  var filename = 'AndroidManifest.xml';
  if (app in graphCache) {
    res.send(graphCache[app]);
  } else {
    // TODO: readdir recursively
    getCallGraph('data/apps/compiled/' + app + '/org/memotis/', function (graph) {
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
