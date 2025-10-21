// create the ripples array
let ripples = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(255);
  // top background is white
  fill(200);
  stroke(100);
  strokeWeight(0.1);
  //draw horizontal line in middle of screen that adapt to screen size
  line(0, height / 2, width, height / 2);
  // draw all ripples
  for (let ripple of ripples) {
    ripple.draw();
  }
  // remove dead ripples
  ripples = ripples.filter(ripple => ripple.alive);

  //add mouseX and mouseY position text in top left corner changing dynamically
  fill(100);
  noStroke();
  textSize(14);
  textFont('Courier New');
  text(mouseX + ", " + mouseY, 10, 20); 

}

function mousePressed() {
  let ripple = new Ripple(mouseX, mouseY);
  // add ripple to an array or draw it directly
  ripples.push(ripple);
  print(ripples.length);
}

function mouseDragged() {
  let ripple = new Ripple(mouseX, mouseY);
  ripples.push(ripple);
}