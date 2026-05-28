let clickSound;
let fadeToImmersion = false;

let imgAlpha = 0;
let baseAlpha = 255;

let immersionImg;
let humanImg;
let customFont;

let particles = [];
let snowflakes = [];

let centerX, centerY;

function preload() {
  humanImg = loadImage("data/humanimage.png");
  immersionImg = loadImage("data/heroimage.jpg");
  customFont = loadFont("data/FleurDeLeah-Regular.ttf");
   clickSound = loadSound("data/698129__christianstuck__metal-click.wav"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  centerX = width / 2;
  centerY = height / 2 + 10;

 // noCursor();
  frameRate(60);

  for (let i = 0; i < 120; i++) {
    snowflakes.push(new Snowflake());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = width / 2;
  centerY = height / 2 + 10;
}

function draw() {
  drawBackgroundGradient();

  // ================= SNOW =================
  for (let s of snowflakes) {
    s.update();
    s.display();
  }

  // ================= TEXT =================
  fill(255, 87, 173);
  noStroke();
  textAlign(CENTER, TOP);
  textFont(customFont);
  textSize(50);
  textStyle(BOLD);
  text("Try inserting the key into the keyhole", width / 2, 28);

  // ================= KEY CENTER =================
  let heart = createVector(centerX, centerY - 40);

  // ===== CLICK DETECT =====
  let dKey = dist(mouseX, mouseY, heart.x, heart.y);
  let isClicking = mouseIsPressed && dKey < 25;

  if (isClicking && !prevClick) {
    fadeToImmersion = true;

    userStartAudio(); // IMPORTANT FIX

    if (clickSound && clickSound.isLoaded()) {
      clickSound.play();
    }
  }

  prevClick = isClicking;

  // ================= PARTICLES =================
  let m = createVector(mouseX, mouseY);
  let d = p5.Vector.dist(m, heart);

  let maxDist = min(width, height) * 0.36;
  let proximity = constrain(1 - d / maxDist, 0, 1);

  if (proximity > 0.12) {
    let spawn = floor(map(proximity, 0.12, 1, 0, 8));

    for (let i = 0; i < spawn; i++) {
      particles.push(new Particle(heart.x, heart.y, proximity));
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }

  // ================= TRANSITION =================
  if (fadeToImmersion) {
    imgAlpha = lerp(imgAlpha, 255, 0.05);
    baseAlpha = lerp(baseAlpha, 0, 0.05);
  }

  // ================= IMMERSION IMAGE =================
  if (fadeToImmersion) {

    push();
    imageMode(CENTER);

    let aspect = immersionImg.width / immersionImg.height;

    let w = width * 0.95;
    let h = w / aspect;
    noStroke();
  for (let i = 0; i < 5; i++) {
    let a = map(i, 0, 5, 0, 40); 
    fill(255, 255, 255, a);

    rect(
      centerX - w / 2 - i * 20,
      centerY - h / 2 - i * 20,
      w + i * 40,
      h + i * 40
    );
  }

 
  image(immersionImg, centerX, centerY, w, h);

  pop();
}

  // ================= HUMAN IMAGE =================
  push();
  imageMode(CENTER);

  let imgW = 500;
  let imgH = humanImg.height * (imgW / humanImg.width);

  tint(255, baseAlpha);
  image(humanImg, centerX, centerY + 110, imgW, imgH);

  pop();

  // ================= KEY =================
  if (!fadeToImmersion) {
    drawKeyhole(heart.x, heart.y, 36);
    drawKey(mouseX, mouseY, mouseX - pmouseX, mouseY - pmouseY);
  }
}

// ================= BACKGROUND =================
function drawBackgroundGradient() {
  let c1 = color(0, 158, 255);
  let c2 = color(255, 255, 255);

  for (let y = 0; y <= height; y++) {
    let t = map(y, 0, height, 1, 0);
    stroke(lerpColor(c1, c2, t));
    line(0, y, width, y);
  }
}

// ================= PARTICLE =================
class Particle {
  constructor(x, y, str) {
    this.pos = createVector(x + random(-8, 8), y + random(-8, 8));
    let a = random(TWO_PI);

    let sp = random(1.5, 6) * (0.6 + 4.0 * str);
    this.vel = p5.Vector.fromAngle(a).mult(sp);

    this.life = random(50, 120);
    this.age = 0;
    this.size = random(3, 9);
    this.col = color(237, 254, 127);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.94);
    this.vel.y -= 0.015;
    this.age++;
  }

  draw() {
    let t = constrain(1 - this.age / this.life, 0, 1);
    noStroke();
    fill(255, 255, 120, 200 * t);
    ellipse(this.pos.x, this.pos.y, this.size * t);
  }

  isDead() {
    return this.age >= this.life;
  }
}

// ================= KEY =================
function drawKeyhole(x, y, size) {
  push();
  translate(x, y);

  stroke(50, 110, 200);
  strokeWeight(2.6);
  noFill();

  ellipse(0, -4, size * 0.62, size * 0.62);

  beginShape();
  vertex(-6, 6);
  vertex(6, 6);
  vertex(3, 12);
  vertex(-3, 12);
  endShape(CLOSE);

  pop();
}

function drawKey(x, y, vx, vy) {
  push();
  translate(x, y);

  let ang = atan2(vy, vx);
  rotate(ang);

  stroke(50, 110, 200);
  strokeWeight(2.6);
  noFill();

  ellipse(0, 0, 18, 18);
  line(10, 0, 42, 0);
  line(40, 0, 40, -7);
  line(44, 0, 44, -7);

  pop();
}

// ================= SNOW =================
class Snowflake {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.size = random(2, 7);
    this.speedY = random(0.4, 2);
    this.speedX = random(-0.5, 0.5);
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.y > height + 10) {
      this.reset();
    }
  }

  display() {
    noStroke();
    fill(255, 200);
    ellipse(this.x, this.y, this.size);
  }
}
