exports.ServerMsgHandler = function(client, event, connected_users, picture_names, pins, picUpdates) {
    console.log('Client: ' + client + '// message' + event);

    var data;
    //accepting only JSON messages
    try {
        data = JSON.parse(event);
    } catch (e) {
        console.log("Invalid JSON");
        data = {};
        // send err
        return false;
    }

    switch (data.type) {
        case 'login':
            //console.log("User: " + data.name + " requests logging in");
            if (connected_users[data.name]) {
                sendTo(client, {
                    type: "login",
                    success: false
                });
            } else {
                //save user connection on the server
                connected_users[data.name] = client;
                sendTo(client, {
                    type: "login",
                    success: true,
                    name: data.name
                });
                console.log("User logged", data.name);
                sendPictures(client, data.name, pins);
            }
            break;
        case 'brdcst':
            for (var temp in connected_users) {
                if (data.name != temp) sendTo(connected_users[temp], data);
            }
            break;
        case 'refresh':
            var CircularJSON = require('circular-json');
            client.send(CircularJSON.stringify({
                type: "refresh",
                users: Object.keys(connected_users)
            }));
            console.log("Connected user's list sent");
            break;
        case 'picReq':
            if (picture_names[data.photoName]) {
                sendTo(client, {
                    type: "picReq",
                    success: false
                });
                break;
            } else {
                //save user connection on the server
                picture_names[data.photoName] = client;
                pins[data.photoName] = [];
                picUpdates[data.photoName] = [];
                sendTo(client, {
                    type: "picReq",
                    success: true
                });
                savePic(data);
                data.type = 'pic';
                data.pins = pins[data.photoName];
                for (var temp in connected_users) {
                    data.myName = temp;
                    sendTo(connected_users[temp], data);
                }

                console.log("Picture added: ", data.photoName);
               /* data.type = 'picUpdate';
                data.settings = picUpdates[data.photoName];
                for (var temp in connected_users) {
                    data.myName = temp;
                    sendTo(connected_users[temp], data);
                } */
                break;
            }
        case 'pin':
            //console.log(data.pins);
            if (Object.keys(data.pins).length !== 0) {
                var myPins = pins[data.photoName];
                var updated = false;
                for( var i=0, l=myPins.length; i<l; i++ ){
                    if(data.pins['x'] === myPins[i]['x'] && data.pins['y'] === myPins[i]['y']){
                       // console.log("UPDAAAAAATE");
                        pins[data.photoName][i]['text'] = data.pins['text'];
                        updated = true;
                        break;
                    }
                }

                if (!updated) pins[data.photoName].push(data.pins);
            }

            data.pins = pins[data.photoName];
            for (var temp in connected_users) {
                data.myName = temp;
                sendTo(connected_users[temp], data);
            }
            break;
        case 'picDel':
            delFile(data.photoName);
            delete pins[data.photoName];
            delete picture_names[data.photoName];
            delete picUpdates[data.photoName];
            for (var temp in connected_users)
                sendTo(connected_users[temp], data);
            break;
        case 'picUpdate':
            if (data.settings != [])  picUpdates[data.photoName] = data.settings;
            data.settings = picUpdates[data.photoName];
            for (var temp in connected_users)
                sendTo(connected_users[temp], data);
            break;
    }
}

function sendTo(socket, message) {
    socket.send(JSON.stringify(message));
}

function savePic(data){
    var fs = require('fs');

    var message = {
        type: 'pic',
        name: data.name,
        myName: "",
        photoName: data.photoName,
        photo: data.photo,
        pins: {}
    };

    message = JSON.stringify(message);

    fs.writeFile("pictures/" + data.photoName + ".txt", message, 'utf8', function(err) {
        if(err) {
            return console.log(err);
        }
    });
}

function delFile(photoName){
    var fs = require('fs');
    var filePath = "pictures/" + photoName + ".txt";
    fs.unlinkSync(filePath);
}

function sendPictures(socket, myName, pins){
    var fs = require('fs');
    try {
        var files = fs.readdirSync("pictures");
    }
    catch (e) {
        return;
    }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = 'pictures/' + files[i];
            fs.readFile(filePath, "utf8", function read(err, data) {
                if (err) {
                    throw err;
                }
                data = JSON.parse(data);
                data.myName = myName;
                data.pins = pins[data.photoName];
                sendTo(socket, data);

                /*var message = {
                    type: 'pin',
                    name: data.name,
                    photoName: data.photoName,
                    pins: data.pins
                }; */

            });


        }
}

exports.clearPicFolder = function() {
    var fs = require('fs');
    try {
        var files = fs.readdirSync("pictures");
    }
    catch (e) {
        return;
    }
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = 'pictures/' + files[i];
            fs.unlinkSync(filePath);
        }
}