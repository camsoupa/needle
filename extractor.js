var processor = require('./app_processor.js');

var rootTarPath = process.argv[2];
var appsRootDir = process.argv[3];

function logMsg (msg) { console.log(msg); }

processor.processAppTarballs(rootTarPath, appsRootDir, function (msg) {}, logMsg);


