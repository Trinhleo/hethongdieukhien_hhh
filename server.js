var express = require('express');
var app = express();
var serverConfig = require('./config/server');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var nodeDeviceConfig = require('./socket/config/device-node.config');
// =======================
// configuration =========
// =======================
var port = serverConfig.PORT;

// console.log(path.resolve('./uploads'));
//socket io
// socketConfig(io, app);
nodeDeviceConfig(io);
server.listen(port);
console.log('Server starting localhost:' + port);