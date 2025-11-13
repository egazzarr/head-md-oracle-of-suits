let things=[]

function setup() {
  createCanvas(windowWidth , windowHeight);
}
function resizewindow() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Clear the background each frame
  background(255);
  // top background is white
  fill(200);
  stroke(100);
  strokeWeight(0.1);
  //draw horizontal line in middle of screen that adapt to screen size
  line(0, height / 2, width, height / 2);
  
  // Draw all things in loop
  for (let i = 0; i < things.length; i++) {
    things[i].draw();
  }

  //mouseX and mouseY position text in top left corner changing dynamically
  fill(255, 0, 0);
  noStroke();
  textSize(12);
  text(mouseX + ", " + mouseY, 10, 20);

}

function mousePressed() {
  // Create a new Thing at mouse position and add to array
  let t = new Thing(mouseX, mouseY);
  things.push(t)
}

function mouseDragged() {
  // Create a new Thing at mouse position and add to array
  let t = new Thing(mouseX, mouseY);
  things.push(t)
}
