
function setup() {

  // full window canvas
  createCanvas(windowWidth, windowHeight);

  // initialize MediaPipe settings
  setupHands();
  // start camera using MediaPipeHands.js helper
  setupVideo();

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  // clear the canvas
  background(255);

  // if the video connection is ready
  if (isVideoReady()) {
    // draw the capture image
    // image(videoElement, 0, 0);
  }

  // use thicker lines for drawing hand connections
  strokeWeight(2);


  // make sure we have detections to draw
  if (detections && detections.multiHandLandmarks && detections.multiHandLandmarks.length > 0) {
    
    // loop through each detected hand
    for (let hand of detections.multiHandLandmarks) {
      drawTips(hand);
      // draw connections
      drawConnections(hand);
      // draw all landmarks
      drawLandmarks(hand);
    } // end of hands loop

  }
}



function drawTips(landmarks) {

  noStroke();
  // set fill color for fingertips
  fill(0, 0, 255);

  // fingertip indices
  const tips = [4, 8, 12, 16, 20];

  for (let tipIndex of tips) {
    let mark = landmarks[tipIndex];
    // adapt the coordinates (0..1) to canvas coordinates
    let x = mark.x * width;
    let y = mark.y * height;
    circle(x, y, 10);
  }

}


function drawLandmarks(landmarks) {

  noStroke();
  // set fill color for landmarks
  fill(255, 0, 0);

  for (let i = 0; i < landmarks.length; i++) {
    let mark = landmarks[i];
    // adapt the coordinates (0..1) to canvas coordinates
    let x = mark.x * width;
    let y = mark.y * height;
    circle(x, y, 6);
    
  }

}


function drawConnections(landmarks) {

  // set stroke color for connections
  stroke(0, 255, 0);

  // iterate through each connection
  for (let connection of HAND_CONNECTIONS) {
    // get the two landmarks to connect
    const a = landmarks[connection[0]];
    const b = landmarks[connection[1]];
    // skip if either landmark is missing
    if (!a || !b) continue;
    // landmarks are normalized [0..1], (x,y) with origin top-left
    let ax = a.x * width;
    let ay = a.y * height;
    let bx = b.x * width;
    let by = b.y * height;
    line(ax, ay, bx, by);
  }

}