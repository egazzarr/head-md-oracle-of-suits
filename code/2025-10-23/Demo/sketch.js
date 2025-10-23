// the blendshapes we are going to track
let leftEyeBlink = 0.0;
let rightEyeBlink = 0.0;
let jawOpen = 0.0;
let mouthPressRight = 0.0; // ADD THIS

// object of blendshape names we want to track
let blendshapes = [];
// and what sounds they are going to make (snare, kick, hihat)
blendshapes.push(new Blendshape("jawOpen", "kik"));
blendshapes.push(new Blendshape("mouthPressRight", "snare"));


function setup() {
  // full window canvas
  createCanvas(windowWidth, windowHeight);
  // initialize MediaPipe
  setupFace();
  setupVideo();

}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {

  // clear the canvas
  background(0);

  jawOpen = getBlendshapeScore('jawOpen');
  mouthPressRight = getBlendshapeScore('mouthPressRight');

  // change color background if jawopen, if mouth is plucked, otherwise normal
  if (jawOpen > 0.5) {
    background(0, 0, 255, 64);
  }
  else if (mouthPressRight > 0.5) {
    background(255, 0, 0, 64);
  }
  else {
    background(255, 0);
  }
  // draw blendshape values
  drawBlendshapeScores();
  drawMouth();
  DenseLiquid(); 
    // get detected faces
  let faces = getFaceLandmarks();
  // update each blendshape score
  updateBlendshapeScores();

}

function drawBlendshapeScores() {
  fill(255, 0, 0);
  textFont('Courier New');
  noStroke();
  textSize(20);
  // print scores on top right screen
  // print jawopen and mouthpressright only
  text("mouthPressRight: " + mouthPressRight.toFixed(2), 10, height - 20);
  text("jawOpen: " + jawOpen.toFixed(2), 10, height - 40);
}


function drawEyes() {

  // ordered rings (outer loop first) from the helper
  const leftEye = getFeatureRings('FACE_LANDMARKS_LEFT_EYE');
  const rightEye = getFeatureRings('FACE_LANDMARKS_RIGHT_EYE');
  const leftIris = getFeatureRings('FACE_LANDMARKS_LEFT_IRIS');
  const rightIris = getFeatureRings('FACE_LANDMARKS_RIGHT_IRIS');

  if (!leftEye || !rightEye) return;

  // --- outline the sockets (no fill) ---
  noFill();
  stroke(255, 255, 0);
  strokeWeight(1);

  // left eye outline
  beginShape();
  for (let p of leftEye[0]) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

  // right eye outline
  beginShape();
  for (let p of rightEye[0]) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

  // fill the irises only if the eyes aren’t blinking
  if (leftEyeBlink < 0.5) {
    noStroke();
    fill(0, 255, 0); // left
    beginShape();
    for (let p of leftIris[0]) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }

  if (rightEyeBlink < 0.5) {
    noStroke();
    fill(0, 0, 255); // right
    beginShape();
    for (let p of rightIris[0]) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
  }
}



function drawMouth() {

  let mouth = getFeatureRings('FACE_LANDMARKS_LIPS');
  // make sure we have mouth data
  if (!mouth) return;

  // set fill and stroke based on jawOpen value
  if (jawOpen > 0.5) {
    fill(0, 255, 255);
    stroke(0, 255, 255);
  } else {
    fill(255, 255, 0);
    stroke(255, 255, 0);
  }

  // there are two rings: outer lip and inner lip
  let outerLip = mouth[0];
  let innerLip = mouth[1];

  // draw outer lip
  beginShape();
  for (const p of outerLip) {
    vertex(p.x, p.y);
  }

  // draw inner lip as a hole
  beginContour();
  // we need to go backwards around the inner lip
  for (let j = innerLip.length - 1; j >= 0; j--) {
    const p = innerLip[j];
    vertex(p.x, p.y);
  }
  endContour();
  endShape(CLOSE);

  // if jaw is open
  if (jawOpen > 0.5) {
    // fuchsia fill
    fill(255, 0, 255);
  } else {
    // yellow fill
    fill(255, 255, 0);
  }

  // fill inner mouth
  beginShape();
  for (const p of innerLip) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

}

function DenseLiquid() {
  // Get mouth center position
  let mouth = getFeatureRings('FACE_LANDMARKS_LIPS');
  let mouthCenterX = width/2;
  let mouthCenterY = height/2;
  let hasMouth = false;
  
  if (mouth) {
    let innerLip = mouth[1];
    mouthCenterX = 0;
    mouthCenterY = 0;
    for (let p of innerLip) {
      mouthCenterX += p.x;
      mouthCenterY += p.y;
    }
    mouthCenterX /= innerLip.length;
    mouthCenterY /= innerLip.length;
    hasMouth = true;
  }

  // Draw MANY MORE crosses densely covering entire screen with varying sizes
  let numCrosses = 8000; // Much denser - simulating liquid
  let baseInfluenceRadius = 250;
  
  // Fix random seed for consistent base positions
  randomSeed(42);
  
  noFill();
  
  for (let i = 0; i < numCrosses; i++) {
    // Generate base position uniformly across entire screen
    let baseX = random(0, width);
    let baseY = random(0, height);
    
    // Random cross size to simulate dense liquid with varying particle sizes
    let crossSize = random(3, 12);
    
    // Start with base position
    let crossX = baseX;
    let crossY = baseY;
    
    // Calculate distance to mouth center
    let distToMouth = dist(baseX, baseY, mouthCenterX, mouthCenterY);
    
    // Add noise/perlin to make influence radius less circular
    let noiseVal = noise(baseX * 0.01, baseY * 0.01, frameCount * 0.01);
    let irregularInfluenceRadius = baseInfluenceRadius * (0.7 + noiseVal * 0.6); // Varies between 70%-130%
    
    // REPULSION when jaw is open - crosses move away from mouth
    if (jawOpen > 0.3 && distToMouth < irregularInfluenceRadius && hasMouth) {
      let repulsionStrength = map(distToMouth, 0, irregularInfluenceRadius, 1, 0);
      repulsionStrength *= jawOpen;
      
      // Add some organic irregularity to the repulsion
      let angleNoise = noise(baseX * 0.02, baseY * 0.02) * TWO_PI;
      
      // Calculate repulsion direction (away from mouth)
      let dirX = baseX - mouthCenterX;
      let dirY = baseY - mouthCenterY;
      let dist = sqrt(dirX * dirX + dirY * dirY);
      if (dist > 0) {
        dirX /= dist;
        dirY /= dist;
      }
      
      // Add angular irregularity
      let tempX = dirX * cos(angleNoise * 0.3) - dirY * sin(angleNoise * 0.3);
      let tempY = dirX * sin(angleNoise * 0.3) + dirY * cos(angleNoise * 0.3);
      dirX = tempX;
      dirY = tempY;
      
      // Apply repulsion force
      let force = repulsionStrength * 80;
      crossX = baseX + dirX * force;
      crossY = baseY + dirY * force;
    }
    
    // ATTRACTION when mouthPressRight - crosses get sucked into mouth
    if (mouthPressRight > 0.5 && distToMouth < irregularInfluenceRadius && hasMouth) {
      let attractionStrength = map(distToMouth, 0, irregularInfluenceRadius, 1, 0);
      attractionStrength *= mouthPressRight;
      
      // Add irregularity to attraction as well
      let attractNoise = noise(baseX * 0.015, baseY * 0.015, frameCount * 0.02);
      attractionStrength *= (0.8 + attractNoise * 0.4);
      
      crossX = lerp(baseX, mouthCenterX, attractionStrength);
      crossY = lerp(baseY, mouthCenterY, attractionStrength);
    }
    
    // Check if this cross is near mouth position - color it red
    let distFromMouth = dist(crossX, crossY, mouthCenterX, mouthCenterY);
    let isNearMouth = distFromMouth < 15 && hasMouth; // Within 15 pixels of mouth center
    
    // Draw cross with varying sizes and transparency
    let alpha = map(crossSize, 3, 12, 150, 255);
    
    if (isNearMouth) {
      stroke(255, 0, 0, alpha); // Red for crosses near mouth
      strokeWeight(map(crossSize, 3, 12, 1, 3));
    } else {
      stroke(255, alpha); // White for other crosses
      strokeWeight(map(crossSize, 3, 12, 0.5, 1.5));
    }
    
    // Vertical line
    line(crossX, crossY - crossSize/2, crossX, crossY + crossSize/2);
    // Horizontal line
    line(crossX - crossSize/2, crossY, crossX + crossSize/2, crossY);
  }
}

