// Client-side: JavaScript with HTML5 Canvas for 2D game development
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 20,
    height: 20,
    speed: 5,
    color: 'blue'
};

let enemies = [];
let score = 0;
let level = 1;

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEnemies() {
    ctx.fillStyle = 'red';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function moveEnemies() {
    enemies.forEach(enemy => {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) {
            enemy.y = 0;
            enemy.x = Math.random() * (canvas.width - enemy.width);
        }
    });
}

function checkCollisions() {
    enemies.forEach((enemy, index) => {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            enemies.splice(index, 1);
            score++;
        }
    });
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function drawLevel() {
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Level: ${level}`, canvas.width - 80, 20);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawEnemies();
    moveEnemies();
    checkCollisions();
    drawScore();
    drawLevel();
    requestAnimationFrame(gameLoop);
}

function spawnEnemies() {
    setInterval(() => {
        enemies.push({
            x: Math.random() * (canvas.width - 20),
            y: 0,
            width: 20,
            height: 20,
            speed: level
        });
    }, 1000 / level);
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && player.x > 0) {
        player.x -= player.speed;
    } else if (event.key === 'ArrowRight' && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
});

canvas.addEventListener('touchstart', (event) => {
    const touchX = event.touches[0].clientX;
    if (touchX < canvas.width / 2 && player.x > 0) {
        player.x -= player.speed;
    } else if (touchX > canvas.width / 2 && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
});

gameLoop();
spawnEnemies();