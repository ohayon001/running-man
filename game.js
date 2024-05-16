const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 50,
    y: canvas.height - 60,
    radius: 20,
    speed: 5,
    gravity: 1,
    jumpPower: 15,
    velocityY: 0,
    isJumping: false,
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
    ctx.fillStyle = '#87CEEB'; // Sky color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mountains
    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(200, 100);
    ctx.lineTo(400, canvas.height);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(400, canvas.height);
    ctx.lineTo(600, 150);
    ctx.lineTo(800, canvas.height);
    ctx.fill();

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
        if (player.y >= canvas.height - player.radius) {
            player.isJumping = false;
            player.y = canvas.height - player.radius;
            player.velocityY = 0;
        }
    }

    // Draw player
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

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
        ctx.fillStyle = 'green';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Check for collisions
        if (player.x - player.radius < obstacle.x + obstacle.width &&
            player.x + player.radius > obstacle.x &&
            player.y - player.radius < obstacle.y + obstacle.height &&
            player.y + player.radius > obstacle.y) {
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

function handleKeyDown(e) {
    keys[e.key] = true;
}

// Start the game
startGame();
