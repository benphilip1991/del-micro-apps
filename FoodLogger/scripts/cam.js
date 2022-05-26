var streaming = false;
var width = 400;
var height = 400;
var video;
var canvas;
var photo;
var startButton;


/**
 * Manage camera ops.
 */
 function initCamera() {

    // Get rear camera
    var constraints = {
        video: {
            facingMode: {
                exact: "environment"
            }
        }
    }

    video = document.getElementById('camera');

    navigator.mediaDevices.getUserMedia(constraints)
        .then((mediaStream) => {
            video.srcObject = mediaStream;
            video.onloadedmetadata = (e) => {
                video.play();

                setTimeout(() => {
                    video.style.visibility = "visible"
                }, 1000);
            }
        }).catch((err) => {
            console.log(`Error : ${err.name} : ${err.message}`);
        });
}

function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    } else {
        clearPhoto();
    }
}

function clearPhoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
}