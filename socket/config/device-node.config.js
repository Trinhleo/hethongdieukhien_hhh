var iotf = require('ibmiotf');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var _ = require('lodash');
var config = require("./app-client.json");
var deviceConfig = require("./device.json");
var apiKey = config["auth-key"];
var appClient = new iotf.IotfApplication(config);
var deviceClient = new iotf.IotfDevice(deviceConfig);
module.exports = function (io) {
    var deviceNode = io.of('/device-node');
    var data;
    deviceNode.on('connection', clientConnect);
    //setting the log level to trace. By default its 'warn'
    appClient.log.setLevel('info');
    appClient.log.setLevel('debug');
    appClient.log.setLevel('error');
    appClient.host = config.host;
    appClient.connect();

    appClient.on("connect", function () {
        var myData = "offpump2";
        appClient.subscribeToDeviceEvents();
    });
    appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
        var arr = {};
        if (payload) {
            var pay = payload.toString('utf8').trim();
            console.log("pay: ", pay);
            data = pay;
            onDataReceived();
        }
    });

    appClient.on("error", function (err) {
        console.log("Error : " + err);
    })

    function onDataReceived() {
        console.log(data);
        eventEmitter.emit('dataChange', data);
        var info = data;
        function cb(err, res) {
            console.log(err);
            console.log(res);
        }
    }
    function clientConnect(socket) {
        socket.rom = apiKey;
        socket.join(apiKey);
        function cb(err, res) {
            if (res) {
                socket.emit('loadHistorydeviceNodeData', res);
            }
        }
        eventEmitter.on('dataChange', function (data) {
            var info = data;
            socket.emit('deviceNodeData', info);
        });
        function sendData(data) {
            var myData = data ? "on" : "off";
            appClient.publishDeviceCommand("esp8266", "device01", "control", "txt", data);
        }
        socket.on('fan1', function (data) {
            sendData(data);
        })
        socket.on('fan2', function (data) {
            sendData(data);
        })
        socket.on('pumb1', function (data) {
            sendData(data);
        })
        socket.on('pumb2', function (data) {
            sendData(data);
        })
        socket.on('boiler1', function (data) {
            sendData(data);
        })
        socket.on('boiler2', function (data) {
            sendData(data);
        })
        socket.on('light', function (data) {
            sendData(data);
        })
        socket.on('mode', function (data) {
            sendData(data);
        })
        socket.on('disconnect', function onDisconnect() {
            socket.leaveAll()
            eventEmitter.removeAllListeners('dataChange');
        });

    }
};
