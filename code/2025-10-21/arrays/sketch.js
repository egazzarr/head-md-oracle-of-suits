let values=[];

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Initialize the values array with random heights
  for (let i = 0; i < width; i++) {
    values[i] = random(50, 300);
  }
}

function draw() {
  background(220);
  // Draw lines with values distance from centre of the screen radially
  // place at centre
  translate(width / 2, height / 2);
  //using values len
  for (let i = 0; i < values.length; i++) {
    let angle = map(i, 0, values.length, 0, TWO_PI);
    let x = cos(angle) * 100;
    let y = sin(angle) * 100;
    line(x, y, 0, 0);
    stroke(255, 0, 0);
    line(x, y, x + cos(angle) * values[i], y + sin(angle) * values[i]);
  }
}
