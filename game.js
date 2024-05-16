const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const stickmanImage = document.getElementById('stickman');
const backgroundImage = document.getElementById('background');

let player = {
    x: 50,
    y: canvas.height - 60,
    width: 20,
    height: 40,
    speed: 5,
    gravity: 1,
    jumpPower: 15,
    velocityY: 0,
    isJumping: false,
    frame: 0,
    frameCount: 3,
    frameWidth: 20,
    frameHeight: 40,
    moveDirection: 1 // 1: right, -1: left
};

let obstacles = [];
let gameSpeed = 3;
let score = 0;
let keys = {};

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function createObstacle() {
    const height = Math.random() * 100 + 20;
    const obstacle = {
        x: canvas.width,
        y: canvas.height - height,
        width: 20,
        height: height
    };
    obstacles.push(obstacle);
}

function update() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Player movement
    if (keys['ArrowLeft']) {
        player.x -= player.speed;
        player.moveDirection = -1;
    }
    if (keys['ArrowRight']) {
        player.x += player.speed;
        player.moveDirection = 1;
    }
    if (keys['ArrowUp'] && !player.isJumping) {
        player.isJumping = true;
        player.velocityY = player.jumpPower;
    }

    // Player gravity and jump
    if (player.isJumping) {
        player.velocityY -= player.gravity;
        player.y -= player.velocityY;
        if (player.y >= canvas.height - player.height) {
            player.isJumping = false;
            player.y = canvas.height - player.height;
            player.velocityY = 0;
        }
    }

    // Draw player
    player.frame = (player.frame + 1) % player.frameCount;
    ctx.save();
    if (player.moveDirection === -1) {
        ctx.scale(-1, 1);
        ctx.drawImage(stickmanImage, player.frame * player.frameWidth, 0, player.frameWidth, player.frameHeight, -player.x - player.width, player.y, player.width, player.height);
    } else {
        ctx.drawImage(stickmanImage, player.frame * player.frameWidth, 0, player.frameWidth, player.frameHeight, player.x, player.y, player.width, player.height);
    }
    ctx.restore();

    // Create obstacles
    if (Math.random() < 0.01) {
        createObstacle();
    }

    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }

        // Draw obstacles
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Check for collisions
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            alert('ゲームオーバー！ スコア: ' + score);
            document.location.reload();
        }
    });

    // Display score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);

    requestAnimationFrame(update);
}

function handleGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gamepad = gamepads[0];
        if (gamepad.buttons[0].pressed && !player.isJumping) {
            player.isJumping = true;
            player.velocityY = player.jumpPower;
        }
        if (gamepad.axes[0] < -0.5) {
            player.x -= player.speed;
            player.moveDirection = -1;
        }
        if (gamepad.axes[0] > 0.5) {
            player.x += player.speed;
            player.moveDirection = 1;
        }
    }
}

function startGame() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gamepadconnected', () => {
        console.log('Gamepad connected');
    });
    gameLoop();
}

function gameLoop() {
    handleGamepad();
    update();
}

// Wait for images to load before starting the game
stickmanImage.onload = () => {
    backgroundImage.onload = startGame;
};
