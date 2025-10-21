function setup() {
  createCanvas(windowWidth, windowHeight);
  // Remove noLoop() so it animates
  textAlign(CENTER, CENTER);
  textFont('Courier New');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function drawFadingLine(x) {
  // Calculate repulsion from mouse
  let repulsion = calculateRepulsion(x);
  let displacedX = x + repulsion;
  
  // Draw line as many thin vertical strips with varying alpha
  let strips = 100;
  let lineThickness = windowWidth/7;
  
  noStroke(); // otherwise all black
  
  // Draw the fading red line first
  for (let i = 0; i < strips; i++) {
    let offsetX = map(i, 0, strips, -lineThickness/2, lineThickness/2);
    let stripX = displacedX + offsetX;
    
    // Calculate distance from center of line (horizontally)
    let distFromCenter = abs(offsetX);
    let maxDist = lineThickness/2;
    
    // Fade out toward left/right edges (255 at center, 0 at edges)
    let alpha = map(distFromCenter, 0, maxDist, 255, 0);
    
    // Red with varying alpha
    fill(255, 0, 0, alpha);
    
    // Draw thin vertical strip
    let stripWidth = lineThickness / strips;
    rect(stripX, 0, stripWidth, height);
  }
  
  // RANDOM GAUSSIAN-LIKE DISTRIBUTION: Stationary dots that follow mouse when close
  let numDots = 2500;
  let centerX = displacedX;
  let centerY = height / 2;
  
  // Fix random seed so dots stay in same base positions
  randomSeed(x * 1000);
  
  for (let i = 0; i < numDots; i++) {
    // Use Box-Muller transform for Gaussian-like distribution with random()
    // Generate base position (stationary)
    let u1 = random();
    let u2 = random();
    let gaussianX = sqrt(-2 * log(u1)) * cos(TWO_PI * u2);
    let gaussianY = sqrt(-2 * log(random())) * cos(TWO_PI * random());
    
    let baseOffsetX = gaussianX * lineThickness/4;
    let baseOffsetY = gaussianY * height/4;
    
    let baseDotX = centerX + baseOffsetX;
    let baseDotY = centerY + baseOffsetY;
    
    // Start with base position
    let dotX = baseDotX;
    let dotY = baseDotY;
    
    // Calculate distance to mouse
    let distToMouse = dist(baseDotX, baseDotY, mouseX, mouseY);
    let attractionRadius = 200;
    
    if (distToMouse < attractionRadius) {
      // Move dot toward mouse based on distance
      let attractionStrength = map(distToMouse, 0, attractionRadius, 1, 0);
      dotX = lerp(baseDotX, mouseX, attractionStrength);
      dotY = lerp(baseDotY, mouseY, attractionStrength);
    }
    
    // Calculate distance from center point for density
    let distFromCenterPoint = dist(baseDotX, baseDotY, centerX, centerY);
    let maxDistForDots = max(lineThickness/2, height/2);
    
    // Density falls off with distance - denser at center
    let densityFactor = map(distFromCenterPoint, 0, maxDistForDots, 1, 0.1);
    if (random() > densityFactor) continue;
    
    // Dot alpha fades with distance
    let dotAlpha = map(distFromCenterPoint, 0, maxDistForDots, 180, 20);
    
    // Pink/magenta dots
    fill(255, 0, 255, dotAlpha);
    ellipse(dotX, dotY, 3, 7);
  }
}

function calculateRepulsion(lineX) {
  // Distance from mouse to line (horizontal only)
  let distToMouse = mouseX - lineX;
  let absDist = abs(distToMouse);
  
  // Influence radius - how far the mouse affects the line
  let influenceRadius = 200;
  
  // If mouse is too far, no repulsion
  if (absDist > influenceRadius) {
    return 0;
  }
  
  // Calculate repulsion force (inverse square falloff)
  let force = map(absDist, 0, influenceRadius, 40, 0);
  
  // Push away from mouse
  if (distToMouse > 0) {
    return -force; // Mouse is to the right, push left
  } else {
    return force;  // Mouse is to the left, push right
  }
}

function drawRecursiveLines(x) {
  // Base case: stop when we reach the right edge
  if (x > width) {
    return;
  }
  
  // Draw the fading line
  drawFadingLine(x);
  
  // RECURSIVE
  drawRecursiveLines(x + 200);
}

function draw() {
  background(255);
  drawRecursiveLines(200);
  push();
  fill(250,0,0);
  textSize(17);

  textStyle(BOLD);
  translate(100, height/2);
  rotate(PI+PI/2);
  text("CATCH THE CENTRE OF THE LINES", 0, 0);
  pop();
}