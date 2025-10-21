// CLASS to create PLANET objects
class Planet{
  constructor(x,y,z = 0){
    this.x = x;
    this.y = y;
    this.z = z;       
  }
  draw(){
    push();
    // random movement for x and y
    this.x += random(-1,1);
    this.y += random(-1,1);

    // convert from top-left mouse coordinates to WEBGL center
    translate(this.x - width/2, this.y - height/2, this.z);

    // solid body

    ellipsoid(30, 60, 15, 20, 12);

    // wireframe overlay so you can see the 3D mesh

    ellipsoid(30, 60, 15, 20, 12);

    pop();
  } 

}

// create an array of PLANET objects
let planets = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  // white background and lights

  background(255);
   
  stroke(255, 0, 0);
  strokeWeight(1);


  fill(0,0,255, 40)
  // draw all planets
  for (let planet of planets) {
    planet.draw();
  }
}

// when mouse is dragged
function mouseDragged() {
  let planet = new Planet(mouseX, mouseY);
  planets.push(planet);
}

// when mouse is pressed
function mousePressed() {
  let planet = new Planet(mouseX, mouseY);
  planets.push(planet);
}


function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}
