let heart = [];
let leaf = [];
let morph = [];
let slider;

let heartSound, leafSound;
let playButton;

// Add SVG variables
let heartSVG, leafSVG;

function preload() {
  // Upload these into the Files tab in p5.js Web Editor
  heartSound = loadSound("heart.mp3");
  leafSound = loadSound("leaf.mp3");
  
  // Load SVG files
  heartSVG = loadImage("heart.svg");
  leafSVG = loadImage("leaf.svg");
}

// Add this function before setup()
function createDetailedShapes() {
  // More detailed heart shape (add after the basic heart array)
  heart = [
    createVector(300, 160), // top center
    createVector(270, 140), // left top inner
    createVector(240, 150), // left top
    createVector(210, 170), // left curve start
    createVector(190, 200), // left peak
    createVector(180, 230), // left upper side
    createVector(185, 260), // left middle
    createVector(200, 290), // left lower curve
    createVector(220, 320), // left bottom curve
    createVector(250, 350), // left bottom
    createVector(280, 380), // approach bottom
    createVector(300, 410), // bottom point
    createVector(320, 380), // leave bottom
    createVector(350, 350), // right bottom
    createVector(380, 320), // right bottom curve
    createVector(400, 290), // right lower curve
    createVector(415, 260), // right middle
    createVector(420, 230), // right upper side
    createVector(410, 200), // right peak
    createVector(390, 170), // right curve start
    createVector(360, 150), // right top
    createVector(330, 140), // right top inner
  ];

  // More detailed leaf shape
  leaf = [
    createVector(300, 100), // top point
    createVector(285, 120), // left top
    createVector(270, 150), // left upper
    createVector(250, 190), // left upper middle
    createVector(235, 230), // left middle
    createVector(225, 270), // left lower middle
    createVector(230, 310), // left lower
    createVector(245, 340), // left bottom curve
    createVector(265, 370), // left bottom
    createVector(285, 390), // approach bottom
    createVector(300, 400), // bottom point
    createVector(315, 390), // leave bottom
    createVector(335, 370), // right bottom
    createVector(355, 340), // right bottom curve
    createVector(370, 310), // right lower
    createVector(375, 270), // right lower middle
    createVector(365, 230), // right middle
    createVector(350, 190), // right upper middle
    createVector(330, 150), // right upper
    createVector(315, 120), // right top
    // add extra points to match heart length
    createVector(300, 110),
    createVector(300, 120), 
    
  ];
}

function setup() {
  createCanvas(600, 600);
  
  createDetailedShapes();

  // Create morph array with same length as heart/leaf
  for (let i = 0; i < heart.length; i++) {
    morph.push(createVector());
  }

  slider = createSlider(0, 1, 0, 0.01);
  slider.position(10, height - 40);
  slider.style('width', '580px');

  // Create play button for sounds
  playButton = createButton("Play Music");
  playButton.position(10, height - 80);
  playButton.mousePressed(toggleMusic);
}

function draw() {
  background(255);

  let t = slider.value();

  // Interpolate between heart and leaf shapes
  for (let i = 0; i < heart.length; i++) {
    let x = lerp(heart[i].x, leaf[i].x, t);
    let y = lerp(heart[i].y, leaf[i].y, t);
    morph[i].set(x, y);
  }

  // Color interpolation (red → green)
  let r = lerp(255, 0, t);     // Red decreases
  let g = lerp(0, 255, t);     // Green increases
  let b = 0;                   // Blue stays 0

  // Draw morphed shape
  fill(r, g, b);
  stroke(0);
  strokeWeight(2);
  beginShape();
  for (let v of morph) {
    curveVertex(v.x, v.y);
  }
  endShape(CLOSE);

  // Audio morph
  if (heartSound.isPlaying() && leafSound.isPlaying()) {
    heartSound.setVolume(1 - t); // fade out heart
    leafSound.setVolume(t);      // fade in leaf
  }

  
}

function toggleMusic() {
  if (!heartSound.isPlaying() && !leafSound.isPlaying()) {
    heartSound.loop();
    leafSound.loop();
    heartSound.setVolume(1);
    leafSound.setVolume(0);
    playButton.html("Stop Music");
  } else {
    heartSound.stop();
    leafSound.stop();
    playButton.html("Play Music");
  }
}

function keyPressed() {
  // Space bar to toggle sounds
  if (key === ' ') {
    toggleMusic();
  }
  
  // Arrow keys for fine control
  if (keyCode === LEFT_ARROW) {
    slider.value(max(0, slider.value() - 0.05));
  }
  if (keyCode === RIGHT_ARROW) {
    slider.value(min(1, slider.value() + 0.05));
  }
}
