var ServerMsgHandler = require("./js/serverfunc.js").ServerMsgHandler;
var clearPicFolder = require("./js/serverfunc.js").clearPicFolder;

// Require HTTP module (to start server) and Socket.IO
clearPicFolder();
var http = require('http');
var io = require('socket.io');
var port = 9090;
var connected_users = {}
var picture_names = {}
var pins = []
var picUpdates = []

// Start the server at port 8080
var server = http.createServer(function(req, res){
    // Send HTML headers and message
    res.writeHead(200,{ 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Hello Socket Lover!</h1>');
});

server.listen(port);

// Create a Socket.IO instance, passing it our server
var socket = io.listen(server);

// Add a connect listener
socket.on('connection', function(client){
    console.log('Connection to client established');

    // Success!  Now listen to messages to be received
    client.on('message',function(message){
        ServerMsgHandler(client, message, connected_users, picture_names, pins,picUpdates);
    });

    client.on('disconnect',function(){
        //connected_users[data.name] = client;
        for (var temp in connected_users) {
            //console.log('test: ', connected_users[temp]);
            if (connected_users[temp] == client) delete connected_users[temp];
        }
        console.log(client + ' has disconnected');
    });
});

console.log('Server running at http://127.0.0.1:' + port + '/');


/************************************************************************/
