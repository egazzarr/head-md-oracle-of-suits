class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.length = 0;
        this.opacity = 255;
        this.alive = true;
        this.direction = random([-1, 1]);
        this.amplitude = 40;
        this.noiseScale = 0.03;
        this.noiseOffset = random(1000);
        this.points = [];
        this.points.push({x: x, y: y});
    }

    draw() {
        // Grow the line
        this.length = this.length + 5;
        
        // Fade out randomly
        this.opacity = this.opacity - random(0.2, 3);

        // Check if dead
        if (this.opacity <= 0) {
            this.alive = false;
        }
        
        // Add new point with noise
        if (this.y < height / 2) {
            // Top half: horizontal line with vertical noise
            let baseX = this.x + (this.length * this.direction);
            let noiseValue = noise(this.noiseOffset + this.length * this.noiseScale);
            let yOffset = map(noiseValue, 0, 1, -this.amplitude, this.amplitude);
            this.points.push({x: baseX, y: this.y + yOffset});
        } else {
            // Bottom half: vertical line with horizontal noise
            let baseY = this.y + (this.length * this.direction);
            
            // Stop at middle if going up
            if (this.direction === -1 && baseY < height / 2) {
                baseY = height / 2;
            } else {
                let noiseValue = noise(this.noiseOffset + this.length * this.noiseScale);
                let xOffset = map(noiseValue, 0, 1, -this.amplitude, this.amplitude);
                this.points.push({x: this.x + xOffset, y: baseY});
            }
        }
        
        // Draw the wavy line through all points
        stroke(255, 0, 0, this.opacity);
        strokeWeight(0.6);
        noFill();
        
        beginShape();
        for (let i = 0; i < this.points.length; i++) {
            vertex(this.points[i].x, this.points[i].y);
        }
        endShape();
    }
}