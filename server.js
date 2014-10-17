var fs = require('fs'),
    proc = require('child_process'),
    express = require('express'),
    hl = require('highlight.js'),
    _  = require('lodash'),
    fs = require('fs');

var port = 3000;
var app = express();
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

      if(err) throw err;

      var lines = data.split('\n')
      
      var outLines = [];
      var cont;
      _.forEach(lines, function (ln) {   
        if (!ln.match(/^\s*$/)) {
          var result = hl.highlight('java', ln, false, cont);
          cont = result.continutation;
          outLines.push({text: ln, html: '<pre class="source-code">' + result.value })
        } else {
          outLines.push({text: ln, html: '<pre class="source-code"><br>' })
        }
      })

      res.send({
        filename: req.params.path,
        lines: outLines
      })
    });
}) 

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
