var exec = require('child_process').exec;

exports.search = function (dir, query, onData, onError, onClose) {
  var child = exec('find . -name "*.java" | xargs grep -n "' + query + '"', { cwd: dir });
  child.stdout.on('data', onData);
  child.stderr.on('data', onError);
  child.on('close', onClose);
}
