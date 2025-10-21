let size = 10;
let noiseOffset = 0;
let rotationY = 0;
let spheresize = 7;

//store the r, i , j values in arrays to optimize performance
let rValues = [];
let iValues = [];
let jValues = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} 

function draw1() {
  push();
  // Centre in first quadrant of the screen
  translate(-width / 4, -height / 4, 0);

  // Adjust size based on mouse movement along Y
  if (mouseY < pmouseY) {
    size += 3; // Grow when moving down
  } else if (mouseY > pmouseY) {
    size -= 3; // Shrink when moving up
  }
  // Constrain size
  size = constrain(size, 0, 150);
  // Adjust rotation based on movement along X
  if (mouseX < pmouseX) {
     rotationY -= 5;
  } else if (mouseX > pmouseX) {
    rotationY += 5;
  }
  rotateY(rotationY);  

  fill(255, 0, 0);
  stroke(150, 0, 150);
  strokeWeight(0.1);
  angleMode(DEGREES);

  // Create biological blob using noise
  for (let i = 0; i < 360; i += 10) {
    for (let j = 0; j < 180; j += 5) {
      let r = size + noise(i*0.1, j*0.1, noiseOffset) * 20;
      let x = r * sin(j);
      let y = r * cos(j) * cos(i);
      let z = r * cos(j) * sin(i);
      push();
      translate(x, y, z);
      sphere(spheresize); // Draw a small sphere at this point
      pop();
      //store and update r, i, j values to the arrays
      rValues.push(r);
      iValues.push(i);
      jValues.push(j);
    }
  }
  noiseOffset += 0.01; // This increments each frame
  pop();


}

function draw2() {
  push();
  // Centre in second quadrant of the screen
  translate(width / 4, -height / 4, 0);

    // Adjust size based on mouse movement along Y
  if (mouseY < pmouseY) {
    size += 3; // Grow when moving down
  } else if (mouseY > pmouseY) {
    size -= 3; // Shrink when moving up
  }
  // Constrain size
  size = constrain(size, 0, 150);
  // Adjust rotation based on movement along X
  if (mouseX < pmouseX) {
     rotationY -= 5;
  } else if (mouseX > pmouseX) {
    rotationY += 5;
  }
  rotateY(rotationY);  

  stroke(100, 0, 250);
  strokeWeight(0.1);

  angleMode(DEGREES);
  // Create biological blob using noise
  for (let i = 0; i < 360; i += 10) {
    for (let j = 0; j < 180; j += 5) {
      let r = size + noise(i*0.1, j*0.1, noiseOffset) * 20;
      let x = r * -sin(j);
      let y = r * cos(j) * cos(i);
      let z = r * cos(j) * sin(i);
      push();
      translate(x, y, z);
      sphere(spheresize); // Draw a small sphere at this point
      pop();
    }
  }
  noiseOffset += 0.01; // This increments each frame
  pop();
}


function draw3() {
  push();
  // Centre in third quadrant of the screen
  translate(width / 4, height / 4, 0);

    // Adjust size based on mouse movement along Y
  if (mouseY < pmouseY) {
    size += 3; // Grow when moving down
  } else if (mouseY > pmouseY) {
    size -= 3; // Shrink when moving up
  }
  // Constrain size
  size = constrain(size, 0, 150);
  // Adjust rotation based on movement along X
  if (mouseX < pmouseX) {
     rotationY -= 5;
  } else if (mouseX > pmouseX) {
    rotationY += 5;
  }
  rotateY(rotationY);  
  fill(0, 0, 255, 50);
  stroke(255, 0, 10);
  strokeWeight(0.1);

  angleMode(DEGREES);
  // Create biological blob using noise
  for (let i = 0; i < 360; i += 10) {
    for (let j = 0; j < 180; j += 5) {
      let r = size + noise(i*0.1, j*0.1, noiseOffset) * 20;
      let x = r * sin(j) * cos(i);
      let y = r * cos(j)* cos(i);
      let z = r * cos(j);
      push();
      translate(x, y, z);
      sphere(spheresize); // Draw a small sphere at this point
      pop();
    }
  }
  noiseOffset += 0.01; // This increments each frame
  pop();
}

function draw4() {
  push();
  // Centre in fourth quadrant of the screen
  translate(-width / 4, height / 4, 0);

    // Adjust size based on mouse movement along Y
  if (mouseY < pmouseY) {
    size += 3; // Grow when moving down
  } else if (mouseY > pmouseY) {
    size -= 3; // Shrink when moving up
  }
  // Constrain size
  size = constrain(size, 0, 150);
  // Adjust rotation based on movement along X
  if (mouseX < pmouseX) {
     rotationY -= 5;
  } else if (mouseX > pmouseX) {
    rotationY += 5;
  }
  rotateY(rotationY);  
  fill(20, 0, 230, 140);
  stroke(100, 0, 100);
  strokeWeight(0.1);

  angleMode(DEGREES);
  // Create biological blob using noise
  for (let i = 0; i < 360; i += 10) {
    for (let j = 0; j < 180; j += 5) {
      let r = size + noise(i*0.1, j*0.1, noiseOffset) * 20;
      let x = r * sin(j);
      let y = r * cos(j)* cos(i);
      let z = r * cos(i) ;
      push();
      translate(x, y, z);
      sphere(spheresize); // Draw a small sphere at this point
      pop();
    }
  }
  noiseOffset += 0.01; // This increments each frame
  pop();
}

// create a text box for a title in the middle of the screen
function drawTitle() {
  push();
  translate(0, 0, 100);
  fill(0);
  textSize(48);
  textAlign(CENTER, CENTER);
  textFont('Courier New');
  text("HI", 0, 0);
  pop();
}

function drawgrid() { 
  push();
  stroke(100);
  strokeWeight(1);
  for (let x = -width / 2; x <= width / 2; x += 20) {
    line(x, -height / 2, -5, x, height / 2, 0);
  }
  for (let y = -height / 2; y <= height / 2; y += 20) {
    line(-width / 2, y, -5, width / 2, y, 0);
  }
  pop();
}

function draw() {
  background(250);
  draw1();
  draw2();
  draw3();
  draw4();
  drawgrid();
  drawTitle();
}