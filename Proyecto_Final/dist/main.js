import { Bird } from './bird.js';
import { handleObstacles, obstaclesArray } from './obstacles.js';
import { handleParticles, particlesArray } from './particles.js';
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;
let spacePressed = false;
let angle = 0;
let hue = 0;
let frame = 0;
let score = 0;
let record = 0;
let gamespeed = 4;
const gradient = ctx.createLinearGradient(0, 0, 0, 70);
gradient.addColorStop(0.4, '#fff');
gradient.addColorStop(0.5, '#000');
gradient.addColorStop(0.55, '#4040ff');
gradient.addColorStop(0.6, '#000');
gradient.addColorStop(0.9, '#fff');
const background = new Image();
background.src = 'assets/BG.jpg';
const BG = {
    x1: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
};
const bird = new Bird();
const restartBtn = document.getElementById('restartBtn');
const levelSelect = document.getElementById('levelSelect');
const recordDisplay = document.getElementById('recordDisplay');
function incrementScore() {
    score++;
    if (score > record) {
        record = score;
        recordDisplay.textContent = `Récord: ${record}`;
    }
}
function handleBackground() {
    BG.x1 -= gamespeed;
    if (BG.x1 <= -BG.width) {
        BG.x1 = 0;
    }
    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x1 + BG.width, BG.y, BG.width, BG.height);
}
function handleCollision() {
    for (let i = 0; i < obstaclesArray.length; i++) {
        const obs = obstaclesArray[i];
        if (bird.x < obs.x + obs.width &&
            bird.x + bird.width > obs.x &&
            ((bird.y < obs.top && bird.y + bird.height > 0) ||
                (bird.y > canvas.height - obs.bottom &&
                    bird.y + bird.height < canvas.height))) {
            ctx.drawImage(new Image(), bird.x, bird.y, 50, 40); // You can replace with bang image
            ctx.font = '20px Georgia';
            ctx.fillStyle = 'white';
            ctx.fillText('GAME OVER, Tu puntuación es ' + score, 160, canvas.height / 2 - 10);
            return true;
        }
    }
    return false;
}
function resetGame() {
    score = 0;
    frame = 0;
    obstaclesArray.length = 0;
    particlesArray.length = 0;
    bird.x = 150;
    bird.y = 200;
    bird.vy = 0;
    restartBtn.style.display = 'none';
    animate();
}
restartBtn.addEventListener('click', () => {
    resetGame();
});
levelSelect.addEventListener('change', () => {
    const val = parseInt(levelSelect.value, 10);
    switch (val) {
        case 1:
            gamespeed = 2;
            break;
        case 2:
            gamespeed = 4;
            break;
        case 3:
            gamespeed = 6;
            break;
    }
});
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBackground();
    handleObstacles(frame, canvas.width, canvas.height, hue, gamespeed, bird.x, incrementScore, ctx);
    handleParticles(bird.x, bird.y, hue, gamespeed, ctx);
    bird.update(angle, canvas.height, spacePressed);
    bird.draw(ctx);
    ctx.fillStyle = gradient;
    ctx.font = '90px Georgia';
    ctx.strokeText(score.toString(), 450, 70);
    ctx.fillText(score.toString(), 450, 70);
    if (handleCollision()) {
        restartBtn.style.display = 'inline-block';
        return;
    }
    requestAnimationFrame(animate);
    angle += 0.12;
    hue++;
    frame++;
}
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space')
        spacePressed = true;
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'Space')
        spacePressed = false;
});
animate();
