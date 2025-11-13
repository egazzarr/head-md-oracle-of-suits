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
  background(0);

  // use thicker lines for drawing hand connections
  strokeWeight(2);

  // reset hand detections
  let leftHandDetected = false;
  let rightHandDetected = false;
  let leftIndexPos = null;
  let rightIndexPos = null;

  // make sure we have detections to draw
  if (detections && detections.multiHandLandmarks && detections.multiHandLandmarks.length > 0) {

    // for each detected hand
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      let hand = detections.multiHandLandmarks[i];
      let handedness = detections.multiHandedness[i].label; // "Left" or "Right"
      
      // get index finger position
      let indexTip = hand[FINGER_TIPS.index];
      
      // store positions based on handedness
      if (handedness === 'Left') {
        leftHandDetected = true;
        leftIndexPos = {
          x: indexTip.x * width,
          y: indexTip.y * height
        };
      } else if (handedness === 'Right') {
        rightHandDetected = true;
        rightIndexPos = {
          x: indexTip.x * width,
          y: indexTip.y * height
        };
      }
      
      // draw the index finger
      drawIndex(hand);
      // draw connections
      drawConnections(hand);
      // draw all landmarks
      drawLandmarks(hand);
    } // end of hands loop

    // Draw many noisy lines between left and right index fingers
    if (leftHandDetected && rightHandDetected && leftIndexPos && rightIndexPos) {
      drawNoisyLinesBetweenIndexes(leftIndexPos, rightIndexPos);
    }

  }

} // end of draw

function drawNoisyLinesBetweenIndexes(leftPos, rightPos) {
  // Draw multiple thin lines with random noise
  let numLines = 20; // number of noisy lines
  
  for (let lineNum = 0; lineNum < numLines; lineNum++) {
    let segments = 50; // number of segments per line
    
    // Vary opacity for each line
    let alpha = random(50, 150);
    stroke(0, 255, 0, alpha);
    strokeWeight(random(0.5, 1.5));
    noFill();
    
    beginShape();
    for (let i = 0; i <= segments; i++) {
      let t = i / segments;
      
      // Base position interpolated between left and right index
      let x = lerp(leftPos.x, rightPos.x, t);
      let y = lerp(leftPos.y, rightPos.y, t);
      
      // Add Perlin noise for organic movement
      // Each line has different noise offset
      let noiseOffsetX = lineNum * 100;
      let noiseOffsetY = lineNum * 100 + 500;
      
      let noiseX = noise(t * 3 + noiseOffsetX, frameCount * 0.02);
      let noiseY = noise(t * 3 + noiseOffsetY, frameCount * 0.02);
      
      // Map noise to offset range
      let xOffset = map(noiseX, 0, 1, -40, 40);
      let yOffset = map(noiseY, 0, 1, -40, 40);
      
      // Apply offsets
      x += xOffset;
      y += yOffset;
      
      vertex(x, y);
    }
    endShape();
  }
}

function drawIndex(landmarks) {
  // get the index fingertip landmark
  let mark = landmarks[FINGER_TIPS.index];

  noStroke();
  // set fill color for index fingertip
  fill(0, 100, 255);

  // adapt the coordinates (0..1) to canvas coordinates
  let x = mark.x * width;
  let y = mark.y * height;
  circle(x, y, 20);
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