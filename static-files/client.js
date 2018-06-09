navigator.mediaDevices
  .getUserMedia({
    video: {
      width: { min: 1280 },
      height: { min: 720 }
    }
  })
  .then(function(stream) {
    var video = document.querySelector("video");
    video.srcObject = stream;
    video.onloadedmetadata = function(e) {
      video.play();
    };
  })
  .catch(function(err) {
    console.log(err);
  });

const button = document.querySelector("button");
const img = document.getElementById("myImg");
const video = document.querySelector("video");
const input = document.querySelector("input");

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

button.onclick = video.onclick = function() {
  caputreVideoStream();
  uploadFile();

  button.disabled = true;
};

let blob;

function caputreVideoStream(faces) {
  if (faces) {
    ctx.strokeStyle = "rgb(220,20,60)";
    ctx.lineWidth = 5;

    faces.forEach(face => {
      const { BoundingBox } = face;

      ctx.strokeRect(
        canvas.width * BoundingBox.Left,
        canvas.height * BoundingBox.Top,
        canvas.width * BoundingBox.Width,
        canvas.height * BoundingBox.Height
      );
    });
  } else {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    img.src = canvas.toDataURL("image/jpeg");

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  }
}

function uploadFile(data) {
  return fetch(
    "https://g1rev8tym3.execute-api.us-east-1.amazonaws.com/myjs/rekognize",
    {
      method: "POST",
      body: canvas.toDataURL("image/jpeg")
    }
  )
    .then(r => r.json())
    .then(({ FaceDetails }) => {
      caputreVideoStream(FaceDetails);

      button.disabled = false;
    });
}
