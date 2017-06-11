function sendTo(socket, message) {
    socket.send(JSON.stringify(message));
}

function previewFile(){
    var preview = document.querySelector('#uploadedPic'); //selects the query named img
    var file    = document.querySelector('input[type=file]').files[0]; //sames as here
    var sendBtn = document.querySelector('#sendPhotoBtn');
    var PicDiv = document.querySelector("#uploadedPicDiv");
    var reader  = new FileReader();

    PicDiv.style.display = "inline-block";


    preview.onload = function(){
        preview.style.maxHeight = "200px";
        PicDiv.style.width = preview.width;
        document.querySelector("#UploadedPicLabel").style.display ="block";
        sendBtn.style.display = 'block';
    }

    reader.onloadend = function () {
        preview.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file); //reads the data as a URL
    } else {
        preview.src = "";
    }
}

function modalBtnHandler(MyName, socket){

    var modalBtn = document.querySelector("#sendPhotoModalBtn");

    modalBtn.addEventListener("click", function (event){
        var photoNameInput = document.querySelector("#photoNameInput");
        var photoName = photoNameInput.value;
        if (photoName === "") {
            alert("Put the name!");
            this.removeEventListener('click', arguments.callee);
            return;
        }

        var preview = document.querySelector('#uploadedPic');
        photoNameInput.value = "";
        var message = {
            type: 'picReq',
            name: MyName,
            myName: MyName,
            photoName: photoName,
            photo: preview.src
        };
        sendTo(socket, message);
        pinUpdate(socket, MyName, photoName);
        this.removeEventListener('click', arguments.callee);
    })
}

