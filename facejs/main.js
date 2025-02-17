// //Get elemen video untuk menampilkan kamera
// const videEl = document.getElementById('videEl');

// //Membuat function untuk menampilkan input webcam di elemen video
// async function startCamera(){
//     navigator.mediaDevices.getUserMedia({video: true})
//     .then(function(stream){
//         videoEl.srcObject = stream;
//     })
//     .catch(function(err){
//         console.log('Ada yang error');
//         console.log(err);
//     })
// }

// startCamera();


//Get elemen video untuk menampilkan kamera
const videoEl = document.getElementById('videoEl');

//Inisiasi function dari faceapi load model
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
])
.then(startCamera);

//Membuat function untuk menampilkan input webcam di elemen video
async function startCamera(){
    navigator.mediaDevices.getUserMedia({video: true})
    .then(function(stream){
        videoEl.srcObject = stream;
    })
    .catch(function(err){
        console.log('Ada yang error');
        console.log(err);
    })
}

//Main function untuk deteksi wajah
function startFunction(){
    //Set interval setiap 0,1 detik
    setInterval(async function(){
        //Memanggil function untuk mendeteksi wajah di video webcam
        const detection = await faceapi.detectAllFaces(
            videoEl,
            new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        console.log(detection);//Tes  berhasil atau tidak
    }, 100);
}

//Listen event saat output webcam sudah mulai muncul di browser
videoEl.addEventListener('playing', startFunction)
