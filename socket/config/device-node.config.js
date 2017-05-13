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

    deviceNode.on('connection', clientConnect);
    //setting the log level to trace. By default its 'warn'
    appClient.log.setLevel('info');
    appClient.log.setLevel('debug');
    appClient.log.setLevel('error');
    appClient.host = config.host;
    appClient.connect();

    appClient.on("connect", function () {
        appClient.subscribeToDeviceEvents();
    });

    appClient.on("error", function (err) {
        console.log("Error : " + err);
    })

    function onDataReceived(eventData, deviceId) {
        console.log(eventData);
        eventEmitter.emit('dataChange', { data: eventData, deviceId: deviceId });
    }
    function clientConnect(socket) {
        socket.rom = apiKey;
        socket.join(apiKey);
        // eventEmitter.on('dataChange', function (data) {

        // });
        appClient.on("deviceEvent", function (deviceType, deviceId, eventType, format, payload) {
            var arr = {};
            if (payload) {
                var pay = payload.toString('utf8').trim();
                if (deviceId === "device001") {
                    socket.emit('deviceNodeData1', pay);
                } else if (deviceId === "device002") {
                    socket.emit('deviceNodeData2', pay);
                }
            }
        });
        function sendData(data, deviceId) {
            appClient.publishDeviceCommand("esp8266", deviceId, "control", "txt", data);
        }
        socket.on('fan1', function (data) {
            var myData = data ? "onfan1" : "offfan1";
            sendData(myData, "device01");
        })
        socket.on('fan2', function (data) {
            var myData = data ? "onfan2" : "offfan2";
            sendData(myData, "device02");
        })
        socket.on('pumb1', function (data) {
            var myData = data ? "onpump1" : "offpump1";
            sendData(myData, "device01");
        })
        socket.on('pumb2', function (data) {
            var myData = data ? "onpump2" : "offpump2";
            sendData(myData, "device02");
        })
        socket.on('boiler1', function (data) {
            var myData = data ? "onboiler1" : "offboiler1";
            sendData(myData, "device01");
        })
        socket.on('boiler2', function (data) {
            var myData = data ? "onboiler2" : "offboiler2";
            sendData(myData, "device02");
        })
        socket.on('light1', function (data) {
            var myData = data ? "onlight1" : "offlight1";
            sendData(myData, "device01");
        })
        socket.on('light2', function (data) {
            var myData = data ? "onlight2" : "offlight2";
            sendData(myData, "device02");
        })
        socket.on('mode1', function (data) {
            var myData = data ? "manual1" : "auto1";
            sendData(myData, "device01");
        })
        socket.on('mode2', function (data) {
            var myData = data ? "manual2" : "auto2";
            sendData(myData, "device02");
        })
        socket.on('disconnect', function onDisconnect() {
            socket.leaveAll()
            eventEmitter.removeAllListeners('dataChange');
        });

    }
};
