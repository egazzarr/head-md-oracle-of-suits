function setup() {
  createCanvas(600, 700);
}

function draw() {
  background(300);
  
  noFill();
  
  // red line
  stroke(255, 0, 0);    // red
  ellipse(300, 300, 300, 200);

  // moving ellipse
  stroke(0, 0, 255);    // blue
  
  // Check if mouse is at position 300, 300
  if (mouseX > 290 && mouseX < 310 && mouseY > 290 && mouseY < 310) {
    fill(255, 0, 0);    // solid red (no transparency)
  } else {
    fill(255, 0, 0, 128);    // red with transparency
  }
  
  ellipse(mouseX, mouseY, 300, 200);

  // blue
  noStroke();
  fill(0, 0, 255);
  ellipse(300, 300, 100, 500);
}