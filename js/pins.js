/**
 * Created by ola on 10.06.17.
 */

function addPin(myPin, myName, photoName, socket){
    var photo = document.querySelector("#uploadedCanv");

    var width = photo.clientWidth;
    var height = photo.clientHeight;
    // console.log(height);
    var top = photo.getBoundingClientRect().top;
    var left = photo.getBoundingClientRect().left;

    var offsets2 = document.querySelector('#picChat').getBoundingClientRect();
    var top1 = offsets2.top;
    var left1 = offsets2.left;

    let pin = new Image();
    if (myName === myPin['sender']) pin.src = "https://blogs.bing.com/getmedia/6a0ad432-45ff-4658-a6af-7427695191eb/HTML5CanvasPusPins-GreenPin.aspx";
    else pin.src = "https://blogs.bing.com/getmedia/4686a870-cd98-4cd9-9f65-e35bc4dba9d4/HTML5CanvasPushPins-TransparentPushPin.aspx";


    let list = document.querySelector("#PinsList");
    let li = document.createElement("li");
    li.style.position ="absolute";

    li.style.left = left -left1 -12.5 + (myPin['x']*width); // left - left1 -12.5  +(cX - left);

    li.style.top = top -top1 - 39 + (myPin['y']*height); //top - top1 - 39 + (cY - top);
    li.innerHTML = pin.outerHTML;


    /* Creating comment div *****************************/
    let commDiv = document.createElement("div");
    commDiv.style.display = "none";
    commDiv.className = "panel panel-default";
    let headDiv = document.createElement("div");
    headDiv.className= "panel-heading";
    headDiv.innerHTML = "Comment by: <b>" + myPin['sender'] + '</b>';
    let textDiv = document.createElement("div");
    textDiv.className = "panel-body";

    if(myPin['sender'] === myName){
        let inputBox = document.createElement("input");
        inputBox.type = "text";
        let sendBtn = document.createElement("button");
        sendBtn.className = "btn-success btn btn-block";
        sendBtn.innerHTML = "Update comment!";
        textDiv.appendChild(inputBox);
        textDiv.appendChild(sendBtn);
    } else {
        textDiv.innerHTML = myPin['text'];
    }

    commDiv.appendChild(headDiv);
    commDiv.appendChild(textDiv);
    li.appendChild(commDiv);
    /****************************************************/

    if(myPin['sender'] === myName) {
        li.addEventListener("click",function(event) {
            //console.log(event.target.nodeName);
            if (event.target.nodeName === "IMG") {
                let myDiv = this.querySelector(".panel");
                myDiv.querySelector("input").value = myPin['text'];

                if (myDiv.style.display === "block") myDiv.style.display = "none";
                else myDiv.style.display = "block";

                myDiv.querySelector("button").addEventListener("click", function (event) {
                    console.log(myDiv.querySelector("input").value);
                    myPin['text'] = myDiv.querySelector("input").value;
                    // sending pin update
                    var message = {
                        type: 'pin',
                        name: myName,
                        photoName: photoName,
                        pins: myPin
                    };
                    sendTo(socket, message);

                    myDiv.style.display = "none";
                });
            }
        });
    } else {
        li.addEventListener("click",function(event) {
            if (event.target.nodeName === "IMG") {
                let myDiv = this.querySelector(".panel");
                if (myDiv.style.display === "block") myDiv.style.display = "none";
                else myDiv.style.display = "block";
            }
        });
    }

    list.appendChild(li);
}

function pinHandler(data, socket){
    console.log("PIN HANDLER");


    var pins = data.pins;

    for( var i=0, l=pins.length; i<l; i++ ) {
        addPin(pins[i], data.myName, data.photoName, socket);
    }
}

function removePins(){
    let list = document.querySelector("#PinsList");
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

function pinUpdate(socket, myName, photoName){
    let message = {
        type: 'pin',
        name: myName,
        photoName: photoName,
        pins: {}
    };
    sendTo(socket, message);
}

function photoClickHandler(socket, data, event){
    var photo = document.querySelector("#uploadedCanv");

    var image = new Image();
    image.src = data.photo;
    var width = photo.clientWidth;
    var height = photo.clientHeight;
    var top = photo.getBoundingClientRect().top;
    var left = photo.getBoundingClientRect().left;
    //console.log("Picture top:" + top + "Picture left:" + left);

    var cX = event.clientX - left;
    var cY = event.clientY - top;
    //console.log( "client - X: " + cX + ", Y coords: " + cY);

    var percentLeft = (cX/width);
    var percentTop = (cY/height);

//    console.log("percentleft: " + percentleft);
//    console.log("percenttop: " + percenttop);

    let pin = {x: percentLeft, y: percentTop, text:'', sender: data.myName};

    data.pins = pin;

    //console.log("click on" + data.photoName);

    var message = {
        type: 'pin',
        name: data.myName,
        photoName: data.photoName,
        pins: data.pins
    };
    sendTo(socket, message);
}

function PictureHandler(socket, data){

    console.log("PICTURE HANDLER");

    var image = new Image();
    image.src = data.photo;
    image.className = data.photoName;
    image.style.maxWidth = "100%";
    let list = document.querySelector("#PicList");
    let li = document.createElement("li");
    li.className = 'list-group-item';
    li.style.display ="inline-block";
    li.style.maxHeight = "100%";
    li.innerHTML = "<p>" + data.photoName + "</p>";

    image.style.maxHeight = "200px";
    li.innerHTML += image.outerHTML;

    let myBtn = document.createElement("button");
    myBtn.className = "btn-success btn btn-block";
    myBtn.innerHTML = "Delete photo";
    myBtn.addEventListener("click",function(event) {
        var message = {
            type: 'picDel',
            name: data.myName,
            photoName: data.photoName,
        };
        sendTo(socket, message);
    });

    li.appendChild(myBtn);

    li.addEventListener("click",function(event) {
        var children = this.childNodes;
        var photo, photoClass;

        for (let child in children)
            if (children.hasOwnProperty(child)) {
                if (children[child].getAttribute('src') != null) photo = children[child].src;
                if (children[child].getAttribute('src') != null && children[child].getAttribute('class') != null) photoClass = children[child].className;
            }
        removePins();

        updatePicArea(photo, photoClass);

        pinUpdate(socket, data.myName, data.photoName);

        var chosenPic = document.querySelector("#uploadedCanv");
        chosenPic.addEventListener("click", function(event) {
            console.log("chosenpic click");
            photoClickHandler(socket, data, event);
            this.removeEventListener('click', arguments.callee);
        });
    });

    list.appendChild(li);

    var editBtn = document.querySelector("#editBtn");
    editBtn.style.display = "block";
    editBtn.addEventListener("click", function(event){
        console.log("edit!");
        editHandler(data.name, socket, data.photo);
    });

    updatePicArea(data.photo, data.photoName);

}

function updatePicArea(picture, picClass) {
    // var pictureDiv = document.querySelector("#picArea");
    document.querySelector("#picName").innerHTML = 'Picture name: ' + picClass;
    //var image = new Image();
    //image.src = picture;
    //image.className = picClass;
    //image.id = "ChosenPhoto";
    // image.style.maxWidth = "100%";
    //image.style.maxHeight = "500px";
    //pictureDiv.innerHTML = image.outerHTML;

    var imageObj = new Image();
    imageObj.src =picture;
    imageObj.style.maxWidth = '100%';
    imageObj.style.minWidth = '500px';

    var canvas = document.getElementById('uploadedCanv');
    canvas.className = picClass;

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


        var context = canvas.getContext('2d');
        canvas.height = myHeight;
        canvas.width = myWidth;
        context.drawImage(imageObj, 0, 0,myWidth, myHeight);
    };


    var chosenPic = document.querySelector("#uploadedCanv");

    document.querySelector("#PinsList").style.width = chosenPic.offsetWidth;
    document.querySelector("#PinsList").style.left = chosenPic.left;
    document.querySelector("#PinsList").style.top = chosenPic.top;

}
