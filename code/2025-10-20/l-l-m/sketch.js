function setup() {
  createCanvas(windowWidth, windowHeight);
  // Remove noLoop() so it animates
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawDotCloud(lineX) {
  noStroke();
  
  // Number of dots per line
  let numDots = 300;
  
  for (let i = 0; i < numDots; i++) {
    // Random y position anywhere on screen
    let y = random(height);
    
    // Random horizontal offset from line (scattered around it)
    let offsetX = random(-50, 50); // 50 pixels left or right of line
    let x = lineX + offsetX;
    // Red color
    fill(255, 0, 0);
    
    // Draw tiny dot
    ellipse(x, y, 6, 2);
  }
}


function drawFadingLine(x) {
  // Calculate repulsion from mouse
  let repulsion = calculateRepulsion(x);
  let displacedX = x + repulsion;
  
  // Draw line as many thin vertical strips with varying alpha
  let strips = 100;
  let lineThickness = windowWidth/10;
  
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
  
  // Now draw dots on top, denser at center point
  let numDots = 800; // total dots per line
  let centerX = displacedX; // Use displaced position
  let centerY = height / 2; // y = windowHeight/2
  
  for (let i = 0; i < numDots; i++) {
    // Random position within line area
    let offsetX = randomGaussian(0, lineThickness/4); // Gaussian distribution around center
    let dotX = centerX + offsetX;
    
    let offsetY = randomGaussian(0, height/4); // Gaussian distribution around vertical center
    let dotY = centerY + offsetY;
    
    // Calculate distance from center point (centerX, centerY)
    let distFromCenterPoint = dist(dotX, dotY, centerX, centerY);
    let maxDistForDots = max(lineThickness/2, height/2);
    
    // Density falls off with distance - skip some dots based on distance
    let densityFactor = map(distFromCenterPoint, 0, maxDistForDots, 1, 0.1);
    if (random() > densityFactor) continue; // Skip this dot based on density
    
    // Dot alpha also fades with distance
    let dotAlpha = map(distFromCenterPoint, 0, maxDistForDots, 180, 20);
    
    // Grey dots
    fill(255,0,255, dotAlpha);
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
  drawRecursiveLines(100);
}