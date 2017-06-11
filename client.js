function connect(socket){
    socket.connect('http://127.0.0.1:9090');

// Add a connect listener
    socket.on('connect',function() {
        console.log('Client has connected to the server!');
    });
// Add a connect listener
    socket.on('message',function(data) {
        console.log('Received a message from the server!',data);
        //accepting only JSON messages
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.log("Invalid JSON");
            data = {};
            // send err
            return false;
        }
        ClientMsgHandler(data, socket);
    });
// Add a disconnect listener
    socket.on('disconnect',function() {
        console.log('The client has disconnected!');
    });

    /*****  Part for adding buttons connections *******/

    var username = document.querySelector('#usernameInput');
    var loginBtn = document.querySelector('#connect_btn');

    loginBtn.addEventListener("click", function (event) {
        var MyName = username.value;
        var message = {
            type: "login",
            name: MyName
        };
        if (MyName.length > 0) {
            sendTo(socket, message);
        } else alert("Name must be at least one character long!");

    });

}

function ClientMsgHandler(data, socket){
    //console.log(data);
    switch (data.type){
        case 'login':
            if(data.success === true){
                LoginHandler(data, socket);
            } else alert("Name already in use!");
            break;
        case 'brdcst':
            document.querySelector("#chatarea").innerHTML += "<p>" + data.name + ": " + data.message + "</p>";
            break;
        case 'refresh':
            update(data);
            break;
        case 'picReq':
            if(data.success === true){
                document.querySelector("#uploadedPicDiv").style.display = "none";
                document.querySelector("#EditBtn").style.display = "block";
                alert("Uploaded!");
            } else alert("Name already in use!");
            break;
        case 'pic':
            removePins();
            PictureHandler(socket, data);
            var chosenPic = document.querySelector("#uploadedCanv");
            chosenPic.addEventListener("click", function(event) {
                console.log("chosen picture:" + this.className);
                photoClickHandler(socket, data, event);
                this.removeEventListener('click', arguments.callee);
                });
             break;
        case 'pin':
             //removePins();
              //debugger;
            var chosenPicClass = document.querySelector("#uploadedCanv").className;
            console.log('document.querySelector("#uploadedCanv").className: ' + chosenPicClass + ', data.photoname:' + data.photoName);
            if(chosenPicClass === data.photoName) { //NIE WCHODZI ZA PIERWSZYM
                pinHandler(data, socket);
            }
            break;
        case 'picDel':
            picDelHandler(data);
            break;
        case 'picUpdate':
             var chosenPicClass = document.querySelector("#uploadedCanv").className;
            if(chosenPicClass === data.photoName) {
                picUpdateHandler(data.settings, data.photo);
                document.querySelector("#uploadedCanv").addEventListener("click", function(event) {
                    photoClickHandler(socket, data,event);
                    });
            }
    }
}

function picUpdateHandler(arr, photo){

   // console.log(photo);
    Caman("#myCanvas",  function () {
        this.reloadCanvasData();
        this.brightness(arr[0]);
        this.contrast(arr[1]);
        this.gamma(arr[2]);
        this.saturation(arr[3]);
        this.render();
    });

    Caman("#uploadedCanv", function () {
        this.reloadCanvasData();
        this.brightness(arr[0]);
        this.contrast(arr[1]);
        this.gamma(arr[2]);
        this.saturation(arr[3]);
        this.render();
    });
    //document.querySelector("#myCanvas").innerHTML = "";

}

function picDelHandler(data){
    let list = document.querySelector("#PicList");
    var children = list.childNodes;
    for (let child in children)
        if (children.hasOwnProperty(child)) {
            let nodes = children[child].childNodes;
            for (let child2 in nodes)
                if (nodes.hasOwnProperty(child2)) {
                    if(nodes[child2].className === data.photoName){
                        list.removeChild(children[child]);
                    }
                }
        }

    document.querySelector("#picName").innerHTML = "";
    document.querySelector("#uploadedCanv").src = "";

}

// take name and photo and adds it to te list at the bottom

function LoginHandler(data, socket){
    var username  = document.querySelector('#username');
    var loginPage  = document.querySelector('#loginpage');
    var callPage  = document.querySelector('#app');
    var sendBtn  = document.querySelector('#sendMsgBtn');
    var msgInput = document.querySelector('#msgInput');
    var chatArea = document.querySelector("#chatarea");

    username.innerHTML += data.name;
    loginPage.style.display = "none";
    callPage.style.display = "block";

    sendBtn.addEventListener("click", function (event) {
        var name = data.name;
        var msg = msgInput.value;
        var message = {
            type: 'brdcst',
            name: name,
            message: msg
        };
        sendTo(socket, message);
        chatArea.innerHTML += "<p>" + name + ": " + msg + "</p>";
        msgInput.value= "";
    });

    /*************************************/

    var uploadBtn = document.querySelector("#uploadBtn");

    uploadBtn.addEventListener("change", function(event){
        previewFile();
    })

    var sendPhotoBtn = document.querySelector('#sendPhotoBtn');
    sendPhotoBtn.addEventListener("click", function(event) {
        modalBtnHandler(data.name, socket);
    });

}

function editHandler(myName, socket, photo){
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    var imageObj = new Image();
    imageObj.src = photo;
    imageObj.style.maxWidth = '500px';
    imageObj.style.minWidth = '500px';

    var settings = [];

    imageObj.onload = function() {
        let wsp1 = imageObj.width/500; let wsp2 = imageObj.height/500;
        let myWidth, myHeight;
        if (wsp1 > wsp2){
            myWidth = imageObj.width/wsp1;
            myHeight = imageObj.height/wsp1;
        } else {
            myWidth = imageObj.width/wsp2;
            myHeight = imageObj.height/wsp2;
        }
        canvas.height = myHeight;
        canvas.width = myWidth;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(imageObj, 0, 0,myWidth, myHeight);

        settings[0] = document.querySelector("#brightness").value;
        settings[1] = document.querySelector("#Contrast").value;
        settings[2] = document.querySelector("#Gamma").value;
        settings[3] = document.querySelector("#Saturation").value;
    };

    document.querySelector("#brightness").addEventListener("change", function(event){
        settings[0] = this.value;
        picUpdateHandler(settings, photo);
    });

    document.querySelector("#Contrast").addEventListener("change", function(event){
        settings[1] = this.value;
        picUpdateHandler(settings, photo);
    });

    document.querySelector("#Gamma").addEventListener("change", function(event){
        settings[2] = this.value;
        picUpdateHandler(settings, photo);
    });

    document.querySelector("#Saturation").addEventListener("change", function(event){
        settings[3] = this.value;
        picUpdateHandler(settings, photo);
    });

    document.querySelector("#confirmEditBtn").addEventListener("click", function (event){
        //console.log(settings);

        let photoName = document.querySelector("#uploadedCanv").className;

        var message = {
            type: 'picUpdate',
            name: myName,
            myName: myName,
            photoName: photoName,
            photo: photo,
            settings: settings
        };
        sendTo(socket, message);
    });
}

function refresh(socket){
    var message = {
        type: 'refresh'
    };
    sendTo(socket, message);
}

function update(data) {
    console.log(data.users);
    let list = document.querySelector("#UserList");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    for (var temp in data.users) {
        let li = document.createElement("li");
        li.className = 'list-group-item';
        li.innerHTML = data.users[temp];
        list.appendChild(li);
    }
}