// sketch.js

let diameter; // diameter of the main circle, defined in setup()
let diameterRatio = 0.8; // ratio of height used for diameter (persistent)

let bgImg;

// Mode: 0 = video, 1 = symbols mode, 3 = interactive
let currentMode = 0;
let symbolsStartTime = 0;

// Hand detection globals
let leftHandDetected = false;
let rightHandDetected = false;
let leftIndexPos = null;
let rightIndexPos = null;
let lastLeftPos = null;
let lastRightPos = null;

// Color feedback
let leftHoverColor = "Unknown";
let rightHoverColor = "Unknown";

// Track previous quadrant states
let wasInQ1 = false;
let wasInQ2 = false;
let wasInQ3 = false;
let wasInQ4 = false;

// Video overlay
let demoVideo;
let videoStartTime = 0;
let videoPlaying = false;


function preload() {
  preloadSymbols();

  // Try to load the image, but don't crash if missing
  bgImg = loadImage(
    'line_art.png',
    () => console.log("Background loaded"),
    () => {
      console.warn("line_art.png not found — using plain white background");
      bgImg = null; // Just mark as missing
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Load saved diameter ratio if present
  const savedRatio = parseFloat(localStorage.getItem('diameterRatio'));
  if (!isNaN(savedRatio)) {
    diameterRatio = savedRatio;
  }
  diameter = height * diameterRatio;


  // Initialize MediaPipe
  setupHands();
  setupVideo();

  // Load video with callback
  demoVideo = createVideo('../../../davin_visual.mov', vidLoaded);
  demoVideo.hide();
  demoVideo.elt.muted = false;
  demoVideo.elt.volume = 1.0;
  demoVideo.loop();
  console.log('Video loading...');
}

function vidLoaded() {
  console.log('Video loaded successfully');
  demoVideo.volume(1.0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recompute diameter based on stored ratio
  diameter = height * diameterRatio;
}


function draw() {
  // Check for hand detection in any mode
  let handInQuadrant = false;
  if (detections && detections.multiHandLandmarks && detections.multiHandLandmarks.length > 0) {
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      let hand = detections.multiHandLandmarks[i];
      let indexTip = hand[FINGER_TIPS.index];
      
      // Map camera coordinates to canvas coordinates
      let fingerPos;
      if (typeof mapCameraToCanvas === 'function') {
        fingerPos = mapCameraToCanvas(indexTip.x, indexTip.y, width, height);
      } else {
        fingerPos = {
          x: indexTip.x * width,
          y: indexTip.y * height
        };
      }
      
      // Check if hand is in a quadrant
      const quadrant = getQuadrant(fingerPos);
      if (quadrant !== "None" && quadrant !== "Unknown") {
        handInQuadrant = true;
        break;
      }
    }
  }
  
  // Auto-switch to symbols mode when hand detected in quadrant
  if (currentMode === 0 && handInQuadrant) {
    currentMode = 1;
    if (demoVideo) {
      demoVideo.volume(0.5);
    }
    symbolsStartTime = millis();
    console.log('Hand detected in quadrant - switching to Mode 1: Symbols');
  }
  
  // MODE 1: Symbols mode - show year 1700 symbols in quadrants
  if (currentMode === 1) {
    background(0);
    
    const cx = width / 2;
    const cy = height / 2;
    const radius = diameter / 2;
    
    // Calculate video dimensions
    let videoAspect = demoVideo && demoVideo.loadedmetadata ? demoVideo.width / demoVideo.height : 16/9;
    let drawHeight = height * 1.08;
    let drawWidth = drawHeight * videoAspect;
    let drawX = (width - drawWidth) / 2;
    let drawY = (height - drawHeight) / 2;
    
    // Draw video at full opacity
    if (demoVideo && demoVideo.loadedmetadata) {
      push();
      image(demoVideo, drawX, drawY, drawWidth, drawHeight);
      pop();
    }
    
    // Draw year 1700 symbols in each quadrant (large size)
    const symbolSize = radius * 0.6;
    const symbolOffset = radius * 0.5;
    
    // Q1: Diamonds (top-right)
    if (symbolImages.diamonds && symbolImages.diamonds[1700]) {
      let img = symbolImages.diamonds[1700];
      if (Array.isArray(img)) img = img[0];
      if (img) {
        push();
        imageMode(CENTER);
        image(img, cx + symbolOffset, cy - symbolOffset, symbolSize, symbolSize);
        pop();
      }
    }
    
    // Q2: Spades (top-left)
    if (symbolImages.spades && symbolImages.spades[1700]) {
      let img = symbolImages.spades[1700];
      if (Array.isArray(img)) img = img[0];
      if (img) {
        push();
        imageMode(CENTER);
        image(img, cx - symbolOffset, cy - symbolOffset, symbolSize, symbolSize);
        pop();
      }
    }
    
    // Q3: Hearts/Cups (bottom-left)
    if (symbolImages.hearts && symbolImages.hearts[1700]) {
      let img = symbolImages.hearts[1700];
      if (Array.isArray(img)) img = img[0];
      if (img) {
        push();
        imageMode(CENTER);
        image(img, cx - symbolOffset, cy + symbolOffset, symbolSize, symbolSize);
        pop();
      }
    }
    
    // Q4: Clubs (bottom-right)
    if (symbolImages.clubs && symbolImages.clubs[1700]) {
      let img = symbolImages.clubs[1700];
      if (Array.isArray(img)) img = img[0];
      if (img) {
        push();
        imageMode(CENTER);
        image(img, cx + symbolOffset, cy + symbolOffset, symbolSize, symbolSize);
        pop();
      }
    }
    
    return; // Skip rest of draw
  }
  
  // MODE 0: Video mode
  if (currentMode === 0) {
    background(0);
    
    if (demoVideo && demoVideo.loadedmetadata) {
      push();
      // Fit to height + 8%, maintain aspect ratio
      let videoAspect = demoVideo.width / demoVideo.height;
      let drawHeight = height * 1.08;
      let drawWidth = drawHeight * videoAspect;
      let drawX = (width - drawWidth) / 2;
      let drawY = (height - drawHeight) / 2;
      
      image(demoVideo, drawX, drawY, drawWidth, drawHeight);
      pop();
      
      // Draw "TOUCHING SOUNDS" text
      push();
      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(60);
      textStyle(BOLD);
      text('TOUCHING\nSOUNDS', width / 2, height / 2);
      pop();
    }
    
    return; // Skip rest of draw
  }
  
  // MODE 3: Interactive mode
  // Ensure audio is initialized
  if (typeof Gibberish !== 'undefined' && !Gibberish.ctx && typeof userStartAudio === 'function') {
    userStartAudio().then(() => {
      if (!Gibberish.ctx) Gibberish.init();
    }).catch(e => console.log('Audio init:', e));
  }
  
  if (calibrationMode) {
    background(255); // white background in calibration mode
  } else {
    background(0); // black background otherwise
  }
  
  // Create circular area constants
  //const diameter = height * 4 / 5;
  const cx = width / 2;
  const cy = height / 2;
  
  // --- Background image (square, centered, keeping proportions) ---
  if (bgImg) {
    push();
    tint(255, 230);
    // Make it square based on height, centered horizontally
    let imgSize = height * 0.9; // 0.8 * 0.9 = 0.72
    let imgX = (width - imgSize) / 2;
    let imgY = (height - imgSize) / 2;
    
    // Clip background image to circle
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.arc(cx, cy, diameter / 2, 0, TWO_PI);
    drawingContext.clip();
    image(bgImg, imgX, imgY, imgSize, imgSize);
    drawingContext.restore();
    pop();
  }


  // Always draw the circle overlay
  drawCircleWithNumbers();

  strokeWeight(1);

  // Reset flags
  leftHandDetected = false;
  rightHandDetected = false;
  leftIndexPos = null;
  rightIndexPos = null;

  // Track which quadrants are currently active (any hand)
  let currentlyInQ1 = false;
  let currentlyInQ2 = false;
  let currentlyInQ3 = false;
  let currentlyInQ4 = false;

  // --- Process hands ---
  if (detections && detections.multiHandLandmarks && detections.multiHandLandmarks.length > 0) {
    console.log(`Number of hands detected: ${detections.multiHandLandmarks.length}`);
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      let hand = detections.multiHandLandmarks[i];
      let handedness = detections.multiHandedness[i].label;
      let indexTip = hand[FINGER_TIPS.index];

      // Map camera coordinates to canvas coordinates using active area calibration
      let fingerPos;
      if (typeof mapCameraToCanvas === 'function') {
        fingerPos = mapCameraToCanvas(indexTip.x, indexTip.y, width, height);
      } else {
        // Fallback to direct mapping if function not available
        fingerPos = {
          x: indexTip.x * width,
          y: indexTip.y * height
        };
      }

      // Determine quadrant for this finger and generate visuals/sounds per-hand
      const quadrant = getQuadrant(fingerPos);
      if (quadrant !== "None") {
  const created = (typeof symbolgenTrail === 'function') ? symbolgenTrail(fingerPos.x, fingerPos.y, quadrant) : false;

        // Q1: Monosynth - sustained notes
        if (quadrant === "1") {
          currentlyInQ1 = true;
          if (window.isQ1Playing && !window.isQ1Playing()) {
            window.playQ1();
          }
          if (window.updateQ1Note && window.getYearFromFingerPos) {
            const year = window.getYearFromFingerPos(fingerPos);
            if (year) window.updateQ1Note(year);
          }
        }

        // Q2: Soft melody sequencer — only start when a particle was created
        if (quadrant === "2") {
          if (created) currentlyInQ2 = true;
          if (created && window.isQ2Playing && !window.isQ2Playing()) {
            window.playQ2();
          } else if (created && window.playQ2 && !window.isQ2Playing()) {
            window.playQ2();
          }
          if (window.updateQ2Melody && window.getYearFromFingerPos) {
            const year = window.getYearFromFingerPos(fingerPos);
            if (year) window.updateQ2Melody(year);
          }
        }

        // Q3: PolyFM - constant chord (cups)
        if (quadrant === "3") {
          currentlyInQ3 = true;
          if (window.isQ3Playing && !window.isQ3Playing()) {
            window.playQ3();
          }
        }

        // Q4: Kick drum with sequencer (clubs)
        if (quadrant === "4") {
          currentlyInQ4 = true;
          if (window.isQ4Playing && !window.isQ4Playing()) {
            window.playQ4();
          }
          if (window.modulateQ4ByCircles && window.getYearFromFingerPos) {
            const year = window.getYearFromFingerPos(fingerPos);
            if (year) window.modulateQ4ByCircles(year);
          }
        }
      }

      // still set left/right indexes for overlay/debug
      if (handedness === 'Left') {
        leftHandDetected = true;
        leftIndexPos = fingerPos;
      } else if (handedness === 'Right') {
        rightHandDetected = true;
        rightIndexPos = fingerPos;
      }
    }
    }
  if (calibrationMode) {
    drawQuadrantOverlay();
  }



  // Stop sounds when finger leaves quadrants
  if (wasInQ1 && !currentlyInQ1 && window.isQ1Playing && window.isQ1Playing()) {
    window.stopQ1();
  }
  if (wasInQ2 && !currentlyInQ2 && window.isQ2Playing && window.isQ2Playing()) {
    window.fadeOutQ2(600);
  }
  if (wasInQ3 && !currentlyInQ3 && window.isQ3Playing && window.isQ3Playing()) {
    window.stopQ3();
  }
  if (wasInQ4 && !currentlyInQ4 && window.isQ4Playing && window.isQ4Playing()) {
    window.stopQ4();
  }
  
  // Update previous state
  wasInQ1 = currentlyInQ1;
  wasInQ2 = currentlyInQ2;
  wasInQ3 = currentlyInQ3;
  wasInQ4 = currentlyInQ4;

  /* // --- Color detection for fingers ---
if (leftIndexPos) {
  let imgPt = canvasToImageCoords(leftIndexPos.x, leftIndexPos.y, bgImg, width, height);
  let avgRgb = sampleAvgColor(bgImg, imgPt.x, imgPt.y, 5);
  leftHoverColor = detectColor(rgbToHsv(...avgRgb));

  // Continuous emission if on silver
  if (leftHoverColor === "Silver" && frameCount % 4 === 0) {
    symbolgen(leftIndexPos.x, leftIndexPos.y);
  }
} else {
  leftHoverColor = "Unknown";
}

if (rightIndexPos) {
  let imgPt = canvasToImageCoords(rightIndexPos.x, rightIndexPos.y, bgImg, width, height);
  let avgRgb = sampleAvgColor(bgImg, imgPt.x, imgPt.y, 5);
  rightHoverColor = detectColor(rgbToHsv(...avgRgb));

  if (rightHoverColor === "Silver" && frameCount % 4 === 0) {
    symbolgen(rightIndexPos.x, rightIndexPos.y);
  }
} else {
  rightHoverColor = "Unknown";
} */
  
  // --- Draw trail symbols (snake formation) ---
  updateAndDrawTrail();

  // --- Camera preview in top right corner ---
  if (calibrationMode && typeof getCameraPreview === 'function') {
    let preview = getCameraPreview();
    if (preview) {
      push();
      let previewW = 640; // Bigger preview width
      let previewH = 480; // Bigger preview height
      let previewX = width - previewW - 10; // 10px from right edge
      let previewY = 10; // 10px from top edge
      
      // Draw preview (no border, not mirrored)
      image(preview, previewX, previewY, previewW, previewH);
      pop();
    }
  }
  
  /* drawColorOverlay(); */


}

function getQuadrant(fingerPos) {
  if (!fingerPos) return "None";

  const cx = width / 2;
  const cy = height / 2;
  const radius = diameter / 2;

  const dx = fingerPos.x - cx;
  const dy = fingerPos.y - cy; // p5 y coordinate (not inverted here)
  
  // Check if finger is inside the circle
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > radius) return "None";

  // Invert dy for quadrant calculation (math coordinate system)
  const dyInverted = -dy;

  if (dx >= 0 && dyInverted >= 0) return "1"; // top-right
  if (dx < 0 && dyInverted >= 0) return "2";  // top-left
  if (dx < 0 && dyInverted < 0) return "3";   // bottom-left
  if (dx >= 0 && dyInverted < 0) return "4";  // bottom-right

  return "Unknown";
}

function drawCircleWithNumbers() {
  //const diameter = height * 4 / 5;
  const cx = width / 2;
  const cy = height / 2;
  const radius = diameter / 2;

  // main circle outline
  if (calibrationMode) {
    fill(0, 255, 0); // green in calibration mode
  } else {
    fill(255); // white otherwise
  }
  stroke(0);
  strokeWeight(1);
  ellipse(cx, cy, diameter, diameter);

  // quadrant cross
  line(cx - radius, cy, cx + radius, cy);
  line(cx, cy - radius, cx, cy + radius);

  // --- concentric circles with years ---
  const years = [1100, 1200, 1300, 1400, 1500, 1600, 1700];
  const ringCount = years.length;

  // All rings in white
  noFill();
  
  for (let i = 0; i < ringCount; i++) {
    const r = map(i, 0, ringCount - 1, radius * 0.1, radius * 0.9);
    ellipse(cx, cy, r * 2, r * 2);
  }

  // Draw year labels in all
  
  textSize(14);

  
  for (let i = 0; i < ringCount; i++) {
    const r = map(i, 0, ringCount - 1, radius * 0.1, radius * 0.9);
    const yearText = years[i].toString();
    const offset = 15; // distance from circle line
    
    // Q2: Top-left quadrant (135° in screen coords = negative x, negative y from center)
    push();
    translate(cx - r * cos(PI/4), cy - r * sin(PI/4) - offset);
    rotate(0); // horizontal, readable from left
    textAlign(CENTER, BOTTOM);
    text(yearText, 0, 0);
    pop();
    
    // Q4: Bottom-right quadrant (315° in screen coords = positive x, positive y from center)
    push();
    translate(cx + r * cos(PI/4), cy + r * sin(PI/4) + offset);
    rotate(0); // horizontal, readable from right
    textAlign(CENTER, TOP);
    text(yearText, 0, 0);
    pop();
  }
  
  textStyle(NORMAL); // Reset text style
}

// --- Diameter adjustment & persistence helpers ---
function updateDiameter(newRatio) {
  // Clamp ratio so circle remains visible (30% to 95% of height)
  diameterRatio = constrain(newRatio, 0.3, 0.95);
  diameter = height * diameterRatio;
  try {
    localStorage.setItem('diameterRatio', diameterRatio.toFixed(4));
  } catch (e) {
    // Ignore storage errors (e.g., privacy mode)
    console.warn('Could not persist diameterRatio', e);
  }
}

// --- Overlay: show which quadrant each finger is in ---
function drawQuadrantOverlay() {
  const pad = 12;
  const leftQuadrant = getQuadrant(leftIndexPos);
  const rightQuadrant = getQuadrant(rightIndexPos);

  const lines = [
    `Left: Q${leftQuadrant}`,
    `Right: Q${rightQuadrant}`
  ];

  textSize(18);
  textAlign(RIGHT, BOTTOM);

  let boxW = max(textWidth(lines[0]), textWidth(lines[1])) + pad * 2;
  let boxH = lines.length * 22 + pad;

  noStroke();
  fill(255, 150);
  rect(width - boxW - 20, height - boxH - 20, boxW, boxH, 8);

  fill(0);
  for (let i = 0; i < lines.length; i++) {
    text(
      lines[i],
      width - 20 - pad / 2,
      height - 20 - (lines.length - 1 - i) * 22 - pad / 2
    );
  }
}

// Keyboard controls for mode switching
function keyPressed() {
  if (key === '0') {
    currentMode = 0;
    if (demoVideo) demoVideo.play();
    console.log('Mode 0: Video');
  } else if (key === '3') {
    currentMode = 3;
    if (demoVideo) demoVideo.pause();
    console.log('Mode 3: Interactive');
  }
  // C key for calibration is handled in MediaPipeHands.js
}

