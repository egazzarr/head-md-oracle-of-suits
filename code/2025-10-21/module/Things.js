class Thing {
    x;
    y;
    length = 0;
    speed = 5;
    direction;
    isVertical = false; // Track if line should be vertical or horizontal
    points = []; // Store all points of the line
    noiseOffset; // Offset for Perlin noise
    noiseScale = 0.1; // How quickly the noise changes
    // noise amplitude can vary from 0 to 20
    noiseAmplitude = 40; // How much the line can deviate
    
    // Constructor runs automatically when you create a new Thing
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.noiseOffset = random(1000); // Random starting point in noise space
        
        // Start with initial point
        this.points.push({x: x, y: y});
        
        // Top half: horizontal line going randomly left or right
        // Bottom half: vertical line going randomly up or down
        if (y < height / 2) {
            this.direction = random([-1, 1]);
            this.isVertical = false;
            this.maxLength = width;
        } else {
            this.direction = random([-1, 1]);
            this.isVertical = true;
            this.maxLength = height;
        } 
    }
  
  draw() {

    push();

    stroke(255, 0, 0, 50); // Red color
    strokeWeight(0.4);
    noFill();
    
    // Add new point if not at max length
    if (this.length < this.maxLength) {
      let newPoint;
      
      if (this.isVertical) {
        // Vertical line with horizontal noise
        let baseY = this.y + (this.length * this.direction);
        
        // If going up (direction = -1), stop at middle of screen
        if (this.direction === -1 && baseY < height / 2) {
          baseY = height / 2;
        } else {
          let noiseValue = noise(this.noiseOffset + this.length * this.noiseScale);
          let xOffset = map(noiseValue, 0, 1, -this.noiseAmplitude, this.noiseAmplitude);
          newPoint = {x: this.x + xOffset, y: baseY};
          this.points.push(newPoint);
        }
      } else {
        // Horizontal line with vertical noise
        let baseX = this.x + (this.length * this.direction);
        let noiseValue = noise(this.noiseOffset + this.length * this.noiseScale);
        let yOffset = map(noiseValue, 0, 1, -this.noiseAmplitude, this.noiseAmplitude);
        newPoint = {x: baseX, y: this.y + yOffset};
        this.points.push(newPoint);
      }
      
      this.length += this.speed;
    }
    
    // Draw the line through all points
    beginShape();
    for (let i = 0; i < this.points.length; i++) {
      vertex(this.points[i].x, this.points[i].y);
    }
    endShape();
    
    pop();
  }
}
