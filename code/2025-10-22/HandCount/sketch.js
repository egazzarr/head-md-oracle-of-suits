let currentDistances = [0, 0, 0, 0, 0]; // for thumb, index, middle, ring, pinky
let maxDistances = [0, 0, 0, 0, 0]; // track max distances for each finger

// separate tracking for left and right hands
let leftHandDistances = [0, 0, 0, 0, 0];
let leftHandMaxDistances = [0, 0, 0, 0, 0];
let leftHandZDistance = 0; // z-distance from camera for left hand
let rightHandDistances = [0, 0, 0, 0, 0];
let rightHandMaxDistances = [0, 0, 0, 0, 0];
let rightHandZDistance = 0; // z-distance from camera for right hand

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

  // reset hand detections
  let leftHandDetected = false;
  let rightHandDetected = false;

  // make sure we have detections to draw
  if (detections && detections.multiHandLandmarks && detections.multiHandLandmarks.length > 0) {

    // for each detected hand
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      let hand = detections.multiHandLandmarks[i];
      let handedness = detections.multiHandedness[i].label; // "Left" or "Right"
      
      // calculate distances for the appropriate hand
      if (handedness === "Left") {
        calculateDistancesForHand(hand, leftHandDistances, leftHandMaxDistances);
        leftHandZDistance = hand[0].z; // wrist z-coordinate
        leftHandDetected = true;
      } else if (handedness === "Right") {
        calculateDistancesForHand(hand, rightHandDistances, rightHandMaxDistances);
        rightHandZDistance = hand[0].z; // wrist z-coordinate
        rightHandDetected = true;
      }
      
      // draw the index finger
      drawIndex(hand);
      // draw the thumb finger
      drawThumb(hand);
      // draw fingertip points
      drawTips(hand);
      // draw connections
      drawConnections(hand);
      // draw all landmarks
      drawLandmarks(hand);
    } // end of hands loop

  }
  
  // reset distances if hand not detected
  if (!leftHandDetected) {
    leftHandDistances = [0, 0, 0, 0, 0];
    leftHandZDistance = 0;
  }
  if (!rightHandDetected) {
    rightHandDistances = [0, 0, 0, 0, 0];
    rightHandZDistance = 0;
  }
  
  // draw rectangles for both hands
  drawLeftHandRectangles();
  drawRightHandRectangles();
  
  // display the distances
  displayDistances();

  //write instructions
  fill(255, 0, 0);
  textSize(14);
  textFont('Courier New');
  text("HOW DO YOU COUNT TO 10?", windowWidth - windowWidth / 2, 100);
  
} // end of draw

function drawLeftHandRectangles() {
  fill(255, 0, 0);
  noStroke();
  
  // dimensions for rectangles
  let rectWidth = 50;
  let rectHeight = height * 0.6;
  let spacing = 40; // gap between rectangles
  let y = (height - rectHeight) / 2;
  
  // start from right and go left (reverse order: pinky to thumb)
  let startX = 30 + (4 * (rectWidth + spacing));

  // handle thumb separately (i=0) with 5/6 threshold - rightmost position
  if (leftHandMaxDistances[0] > 0 && leftHandDistances[0] > leftHandMaxDistances[0] * (5/6)) {
    let x = startX;
    rect(x, y, rectWidth, rectHeight);
  }
  
  // draw rectangles for other 4 fingers (index, middle, ring, pinky) - going left
  for (let i = 1; i < 5; i++) {
    // only draw rectangle if current distance is MORE than 2/3 of max distance
    if (leftHandMaxDistances[i] > 0 && leftHandDistances[i] > leftHandMaxDistances[i] * (2/3)) {
      let x = startX - (i * (rectWidth + spacing));
      rect(x, y, rectWidth, rectHeight);
    }
  }
}

function drawRightHandRectangles() {
  fill(0, 0, 255); // blue for right hand
  noStroke();
  
  // dimensions for rectangles
  let rectWidth = 50;
  let rectHeight = height * 0.6;
  let spacing = 40; // gap between rectangles
  let y = (height - rectHeight) / 2;
  
  // start from left side of right group and go right
  let startX = width - 30 - (5 * rectWidth) - (4 * spacing);

  // handle thumb separately (i=0) with 4/5 threshold - leftmost position
  if (rightHandMaxDistances[0] > 0 && rightHandDistances[0] > rightHandMaxDistances[0] * (4/5)) {
    let x = startX;
    rect(x, y, rectWidth, rectHeight);
  }
  
  // draw rectangles for other 4 fingers (index, middle, ring, pinky) - going right
  for (let i = 1; i < 5; i++) {
    // only draw rectangle if current distance is MORE than 2/3 of max distance
    if (rightHandMaxDistances[i] > 0 && rightHandDistances[i] > rightHandMaxDistances[i] * (2/3)) {
      let x = startX + (i * (rectWidth + spacing));
      rect(x, y, rectWidth, rectHeight);
    }
  }
}


function calculateDistancesForHand(landmarks, distancesArray, maxDistancesArray) {
  // wrist is landmark 0
  let wrist = landmarks[0];
  
  // fingertip indices from FINGER_TIPS constant: thumb, index, middle, ring, pinky
  const tips = [FINGER_TIPS.thumb, FINGER_TIPS.index, FINGER_TIPS.middle, FINGER_TIPS.ring, FINGER_TIPS.pinky];
  
  for (let i = 0; i < tips.length; i++) {
    let tip = landmarks[tips[i]];
    
    // calculate Euclidean distance in normalized coordinates
    let dx = tip.x - wrist.x;
    let dy = tip.y - wrist.y;
    let dz = tip.z - wrist.z;
    let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // store current distance
    distancesArray[i] = distance;
    
    // update max distance if current is greater
    if (distance > maxDistancesArray[i]) {
      maxDistancesArray[i] = distance;
    }
  }
}


function displayDistances() {
  fill(0);
  textSize(12);
  textAlign(LEFT, TOP);
  
  const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
  let lineHeight = 16;
  let startY = 20;
  
  // Display left hand distances
  text('LEFT HAND:', 10, startY);
  for (let i = 0; i < 5; i++) {
    let y = startY + ((i + 1) * lineHeight);
    text(`${fingerNames[i]}: ${leftHandDistances[i].toFixed(3)} / ${leftHandMaxDistances[i].toFixed(3)}`, 10, y);
  }
  // Display left hand z-distance
  text(`Z-Distance: ${leftHandZDistance.toFixed(3)}`, 10, startY + 6 * lineHeight);
  
  // Display right hand distances
  textAlign(RIGHT, TOP);
  text('RIGHT HAND:', width - 10, startY);
  for (let i = 0; i < 5; i++) {
    let y = startY + ((i + 1) * lineHeight);
    text(`${fingerNames[i]}: ${rightHandDistances[i].toFixed(3)} / ${rightHandMaxDistances[i].toFixed(3)}`, width - 10, y);
  }
  // Display right hand z-distance
  text(`Z-Distance: ${rightHandZDistance.toFixed(3)}`, width - 10, startY + 6 * lineHeight);
}

// add keyboard control to reset max distances
function keyPressed() {
  if (key === 'r' || key === 'R') {
    leftHandMaxDistances = [0, 0, 0, 0, 0];
    rightHandMaxDistances = [0, 0, 0, 0, 0];
    console.log('Max distances reset for both hands');
  }
}

function drawIndex(landmarks) {

  // get the index fingertip landmark
  let mark = landmarks[FINGER_TIPS.index];

  noStroke();
  // set fill color for index fingertip
  fill(0, 255, 255);

  // adapt the coordinates (0..1) to canvas coordinates
  let x = mark.x * width;
  let y = mark.y * height;
  circle(x, y, 20);

}


// draw the thumb finger tip landmark
function drawThumb(landmarks) {

  // get the thumb fingertip landmark
  let mark = landmarks[FINGER_TIPS.thumb];

  noStroke();
  // set fill color for thumb fingertip
  fill(255, 255, 0);

  // adapt the coordinates (0..1) to canvas coordinates
  let x = mark.x * width;
  let y = mark.y * height;
  circle(x, y, 20);

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
    
    // draw the landmark index and coordinates
    fill(0); // black text
    textSize(10);
    textAlign(LEFT, CENTER);
    text(`[${i}] (${mark.x.toFixed(2)}, ${mark.y.toFixed(2)})`, x + 10, y);
    
    // reset fill color for next landmark
    fill(255, 0, 0);
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