var iotf = require('ibmiotf');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var _ = require('lodash');
var config = require("./app-client.json");
var deviceConfig = require("./device.json");
var apiKey = config["auth-key"];
var appClient = new iotf.IotfApplication(config);
var deviceClient = new iotf.IotfDevice(deviceConfig);
var mqtt = require('mqtt'), url = require('url');
// Parse 
var mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://m13.cloudmqtt.com:13492');
var auth = (mqtt_url.auth || ':').split(':');
var url = "mqtt://m13.cloudmqtt.com";
module.exports = function (io) {
    var deviceNode = io.of('/device-node');

    deviceNode.on('connection', clientConnect);
    //setting the log level to trace. By default its 'warn'
    // appClient.log.setLevel('info');
    // appClient.log.setLevel('debug');
    // appClient.log.setLevel('error');
    // appClient.host = config.host;
    // appClient.connect();

    // appClient.on("connect", function () {
    //     appClient.subscribeToDeviceEvents();
    // });

    // appClient.on("error", function (err) {
    //     console.log("Error : " + err);
    // })
    var options = {
        port: "13492",
        clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
        username: "rauzdzhf",
        password: "VXloiMpGvtxe",
    };

    var client = mqtt.connect(url, options);


    function clientConnect(socket) {
        socket.rom = apiKey;
        socket.join(apiKey);
        client.on('connect', function () { // When connected

            // subscribe to a topic
            client.subscribe('event1', function () {
                // when a message arrives, do something with it
                client.on('message', function (topic, message, packet) {
                    var pay = message.toString('utf8').trim();
                    socket.emit('deviceNodeData1', pay);
                });
            });
            client.subscribe('event2', function () {
                // when a message arrives, do something with it
                client.on('message', function (topic, message, packet) {
                    var pay = message.toString('utf8').trim();
                    socket.emit('deviceNodeData2', pay);
                });
            });

            // publish a message to a topic

        });
        function sendData(data, device) {
            // appClient.publishDeviceCommand("esp8266", topic, "control", "txt", data);
            var topic = device == "device01" ? "control1" : "control2";
            client.publish(topic, data, function () {
                console.log("Message is published");
            });
        }
        socket.on('fan1', function (data) {
            var myData = data ? "of1" : "ff1";
            sendData(myData, "device01");
        })
        socket.on('fan2', function (data) {
            var myData = data ? "of2" : "ff2";
            sendData(myData, "device02");
        })
        socket.on('pumb1', function (data) {
            var myData = data ? "op1" : "fp1";
            sendData(myData, "device01");
        })
        socket.on('pumb2', function (data) {
            var myData = data ? "op2" : "fp2";
            sendData(myData, "device02");
        })
        socket.on('boiler1', function (data) {
            var myData = data ? "ob1" : "fb1";
            sendData(myData, "device01");
        })
        socket.on('boiler2', function (data) {
            var myData = data ? "ob2" : "fb2";
            sendData(myData, "device02");
        })
        socket.on('light1', function (data) {
            var myData = data ? "ol1" : "fl1";
            sendData(myData, "device01");
        })
        socket.on('light2', function (data) {
            var myData = data ? "ol2" : "fl2";
            sendData(myData, "device02");
        })
        socket.on('mode1', function (data) {
            var myData = data ? "ma1" : "au1";
            sendData(myData, "device01");
        })
        socket.on('mode2', function (data) {
            var myData = data ? "ma2" : "au2";
            sendData(myData, "device02");
        })
        socket.on('disconnect', function onDisconnect() {
            socket.leaveAll()
            eventEmitter.removeAllListeners('dataChange');
        });

    }
};
