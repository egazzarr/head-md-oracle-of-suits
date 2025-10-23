function setup() {
  createCanvas(windowWidth, windowHeight);
  // setup MediaPipe Hands
  setupHands();
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
    image(videoElement, 0, 0);
  }

  // make sure we have detections to draw
  if (detections && detections.multiHandLandmarks) {
    
    // collect index and thumb positions from all hands
    let indexPositions = [];
    let thumbPositions = [];
    
    for (let hand of detections.multiHandLandmarks) {
      // get the index tip
      let indexTip = hand[FINGER_TIPS.index];
      // get the thumb tip
      let thumbTip = hand[FINGER_TIPS.thumb];
      
      indexPositions.push({
        x: indexTip.x * width,
        y: indexTip.y * height
      });
      
      thumbPositions.push({
        x: thumbTip.x * width,
        y: thumbTip.y * height
      });
    }
    
    // draw blob between index and thumb tips
    if (indexPositions.length > 0 && thumbPositions.length > 0) {
      drawGlossyBlob(indexPositions, thumbPositions);
    }

  }
}

function drawGlossyBlob(indexPositions, thumbPositions) {
  // collect all 4 fingertip positions
  let allPoints = [];
  
  for (let pos of indexPositions) {
    allPoints.push(pos);
  }
  
  for (let pos of thumbPositions) {
    allPoints.push(pos);
  }
  
  // calculate center position (average of all fingertips)
  let centerX = 0;
  let centerY = 0;
  
  for (let pos of allPoints) {
    centerX += pos.x;
    centerY += pos.y;
  }
  
  centerX /= allPoints.length;
  centerY /= allPoints.length;
  
  // calculate the radius needed to touch the farthest fingertip
  let maxDistance = 0;
  
  for (let pos of allPoints) {
    let dx = pos.x - centerX;
    let dy = pos.y - centerY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      maxDistance = distance;
    }
  }
  
  // blob size reaches to the farthest fingertip
  let blobSize = maxDistance * 2; // diameter
  
  // draw the glossy blob
  push();
  translate(centerX, centerY);
  
  // draw shadow
  noStroke();
  fill(0, 0, 0, 30);
  ellipse(5, 5, blobSize + 10, blobSize + 10);
  
  // draw main blob with gradient effect
  for (let i = blobSize; i > 0; i -= 2) {
    let inter = map(i, 0, blobSize, 0, 1);
    let c = lerpColor(color(100, 200, 255), color(0, 100, 200), inter);
    fill(c);
    noStroke();
    ellipse(0, 0, i, i);
  }
  
  // draw highlight for glossy effect
  fill(255, 255, 255, 150);
  ellipse(-blobSize * 0.2, -blobSize * 0.2, blobSize * 0.3, blobSize * 0.3);
  
  // draw smaller bright highlight
  fill(255, 255, 255, 200);
  ellipse(-blobSize * 0.15, -blobSize * 0.15, blobSize * 0.15, blobSize * 0.15);
  
  pop();
}
