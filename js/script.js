/**@type{HTMLCanvasElement} */

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

const collisionCanvas = document.querySelector('#collisionCanvas');
const ctx_2 = collisionCanvas.getContext('2d');
collisionCanvas.width = canvasWidth;
collisionCanvas.height = canvasHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
let timeToNextBird = 0;
let lastTime = 0;
let timeInterval = 500;
let score = 0;
let maxScore = 0;
let over = false;
let birdArray = [];
let explosion = [];
let particle = [];
let birdSoundFlag = true;
let shootSoundFlag = true;
ravenSound = new Audio();
ravenSound.src = './sound/raven-sound.mp3';
ravenSound.autoplay = false;
//setting javscript logic start
let darkMode = true;
let gear = document.querySelector('#gear');
let setting = document.querySelector('.setting');
let ravenSoundHTML = document.querySelector('#bird-sound');
let shootSoundHTML = document.querySelector('#shoot-sound');
let doneHTML = document.querySelector('#done');
let start = document.querySelector('#start');
let darkModeHTML = document.querySelector('#mode');
darkModeHTML.checked = true;
ravenSoundHTML.checked = true;
shootSoundHTML.checked = true;

darkModeHTML.addEventListener('change', ()=> {
    darkMode = false;
    canvas.style.backgroundColor = "#fff";
    document.querySelector('.container').style.color = '#006400';
});
doneHTML.addEventListener('click', () => {
    (ravenSoundHTML.checked === false) ? birdSoundFlag = false : birdSoundFlag = true;
    (shootSoundHTML.checked === false)? shootSoundFlag = false : shootSoundFlag = true;
    setting.classList.toggle('setting-toggle');
    gear.classList.toggle('gear-spin');
});
gear.addEventListener('click', () => {
    setting.classList.toggle('setting-toggle');
    gear.classList.toggle('gear-spin');
});
start.addEventListener('click', () => {
    timeToNextBird = 0;
    lastTime = 0;
    score = 0;
    maxScore = 0;
    over = false;
    birdArray = [];
    explosion = [];
    particle = [];
    gameLoop(0);
    setting.classList.toggle('setting-toggle');
    gear.classList.toggle('gear-spin');
});
// setting javascript logic end 

// color full particle class 
class Particle {
    constructor(x, y, size, color) {
        this.x = x + (size / 2);
        this.y = y  + (size / 3);
        this.color = color;
        this.radius = Math.random() * size / 15;
        this.maxRadius = Math.random() * 20 + 35;
        this.speed = Math.random() * 1 + 0.5;
        this.markDeletion = false;
    }
    update() {
        this.x += this.speed;
        this.radius += 0.5;
        if(this.radius > this.maxRadius - 6) this.markDeletion = true;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = 1 - (this.radius / this.maxRadius);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// explosion class  
class Explosion {
    constructor(x, y, width, height) {
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.image = new Image();
        this.image.src = './img/boom.png';
        this.explosionFrameTime = 0;
        this.explosionFrameInterval = 200;
        this.frameX = 0;
        this.width = width;
        this.height = height;
        this.x = x - (this.width / 2);
        this.y = y - (this.height / 2);
        this.markDeletion = false;
        this.sound = new Audio();
        this.sound.src = './sound/gun.mp3';
       
    }
    update(deltaTime) {
        this.explosionFrameTime += deltaTime;
        if(this.frameX === 0 && shootSoundFlag === true) this.sound.play();
        if(this.frameX > 5) this.markDeletion = true;
        if(this.explosionFrameTime > this.explosionFrameInterval) {
            this.frameX++;
            this.explosionFrameTime = 0;
        }
    }
    draw() {
        ctx.drawImage(this.image, this.frameX * this.spriteWidth,0,this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

//Raven class 
class Bird {
    constructor() {
        this.directionX = Math.random() * 4 + 1;
        this.directionY = Math.random() * 2.5 - 2.5;
        this.markDeletion = false;
        this.image = new Image();
        this.image.src = './img/enemy.png';
        this.spriteWidth = 1596 / 6;
        this.spriteHeight = 188;
        this.birdSize = Math.random() * 0.2 + 0.4;
        this.width = this.spriteWidth * this.birdSize;
        this.height = this.spriteHeight * this.birdSize;
        this.x = canvasWidth;
        this.y = Math.random() * (canvasHeight - this.height);
        this.frameX = 0;
        this.timeBirdFlap = 0;
        this.timeBirdInterval = Math.random() * 50 + 50;
        this.randomColor = [
            Math.floor(Math.random() * 255) ,
            Math.floor(Math.random() * 255) ,
            Math.floor(Math.random() * 255),
            Math.floor(Math.random() * 100) 
        ];
        this.rgbColor = `rgb(${this.randomColor[0]}, ${this.randomColor[1]}, ${this.randomColor[2]})`;
        this.hasTrail = Math.random() > 0.5 ;
    }
    update(deltaTime) {
        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.y < 0 || this.y > (canvasHeight - this.height)) this.directionY *= -1;
        this.timeBirdFlap += deltaTime;
        if(this.hasTrail) {
            particle.push(new Particle(this.x, this.y, this.width, this.rgbColor));
        }
        if(this.timeBirdFlap > this.timeBirdInterval){
            (this.frameX > 4) ? this.frameX = 0 : this.frameX++;
            this.timeBirdFlap = 0;
            if(birdSoundFlag === true) {
               ravenSound.play();
            }
        }
        if(this.x + this.width < 0) {
            over = true;
            this.markDeletion = true;
        }
    }
    draw() {
        ctx_2.fillStyle = this.rgbColor;
        ctx_2.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}


// showing score on dashboard 
function displayScore() {
    let data = JSON.parse(localStorage.getItem("raven"));
    if(data === null) {
        data = {
            maxScore: 0
        }
        localStorage.setItem("raven", JSON.stringify(data));
    }
    else {
        maxScore = data.maxScore;
    }
    let maxSocreHTML = document.querySelector('.max-score');
    let currentScoreHTML = document.querySelector('.current-score');
    maxSocreHTML.textContent = `Max Score : ${maxScore}`;
    currentScoreHTML.textContent = `Current Score : ${score}`;
}

// capturing clicked imageData using canvas method getImageData 
let killEnemy = (event) => {
    let getImageData = ctx_2.getImageData(event.x, event.y, 1, 1);
    let getData = getImageData.data;
    birdArray.forEach((item) => {
        if( item.randomColor[0] === getData[0] && item.randomColor[1] === getData[1] && item.randomColor[2] === getData[2] ){
                item.markDeletion = true;
                ++score;
                explosion.push(new Explosion(event.x, event.y, item.width, item.height));
        }
    });

    let data = JSON.parse(localStorage.getItem("raven"));
    if(data !== null && data.maxScore < score) {
        data.maxScore = score;
        localStorage.setItem("raven", JSON.stringify(data));
    }
}
window.addEventListener('click', (e) => {
  killEnemy(e);  
}); 
window.addEventListener('touchmove', (e) => {
    killEnemy(e);
});
// game over method 
let gameOver = () => {
    ctx.textAlign="center";
    ctx.font = "30px Impact";
    ctx.fillStyle='#ff0000';
    ctx.fillText("Game Over Your Score is " + score, canvasWidth / 2, canvasHeight / 2);
    ctx.shadowBlur = 100;
    ctx.fillStyle = (darkMode)? '#ffffff' : '#006400';
    ctx.fillText("Game Over Your Score is " + score, (canvasWidth / 2) - 2, (canvasHeight / 2) - 2);
}

//game loop using requestAnimationFrame
function gameLoop(timer) {
    ctx_2.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    let deltaTime = timer - lastTime;
    lastTime = timer;
    timeToNextBird += deltaTime;
    if(timeToNextBird > timeInterval) {
        birdArray.push(new Bird());
        timeToNextBird = 0;
        birdArray.sort((a, b) => {
            return a.width - b.width;
        });
    }
    
    displayScore();
    [...particle, ...birdArray, ...explosion ].forEach(item => item.update(deltaTime));
    [...particle, ...birdArray, ...explosion ].forEach(item => item.draw());
    birdArray = birdArray.filter((item) => !item.markDeletion);
    explosion = explosion.filter((item) => !item.markDeletion);
    particle = particle.filter((item) => !item.markDeletion);
    (!over) ? requestAnimationFrame(gameLoop) : gameOver();
}

gameLoop(0);