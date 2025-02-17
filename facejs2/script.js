const video = document.getElementById('video')
var labels = []

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models')

])
  .then(getListKaryawan)
  .then(startVideo)


function getListKaryawan() {

  $.ajax({
    url: 'http://localhost:8080/api/karyawan/list',
    type: 'GET',
    // mode: 'no-cors',
    contentType: 'application/json',
    success: function (response) {
      // sama dengan
      for (let index = 0; index < response.length; index++) {
        const item = response[index];
        labels.push(item.nama);
      }
    },
    error: function (xhr, status, error) {
      alert('Error: ' + error);
    }
  });


}



async function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


var recognizeCounter = 0;
var prevFace = '';
var cleanResult = '';

video.addEventListener('play', async () => {
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)

  let canvas

  const displaySize = { width: video.width, height: video.height }

  setInterval(async () => {
    if (canvas) canvas.remove()
    canvas = faceapi.createCanvasFromMedia(video)
    faceapi.matchDimensions(canvas, displaySize)
    document.body.append(canvas)


    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)

      
      if (!result.toString().includes('unknown')) {
        cleanResult = result.toString().split('(')[0].trim();
        if (cleanResult == prevFace) {
          recognizeCounter++;
        } else {
          recognizeCounter = 1;
        }
        prevFace = cleanResult;
        console.log(result + ' | ' + prevFace + ' | ' + recognizeCounter);
      }

      if (recognizeCounter == 10) {
        alert('Anda Dikenali ' + cleanResult);
        recognizeCounter = 0;
        prevFace = '';
      }
    })


  }, 10)
})

function loadLabeledImages() {
  faceapi_env = { FACEAPI_CORS_ORIGINS: '*' }
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`http://127.0.0.1:8080/api/karyawan/image/${label}/${i}`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
