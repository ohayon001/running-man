const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 50,
    y: canvas.height - 40, // Adjust to touch the ground
    radius: 10, // Make the player ball smaller
    speed: 5,
    gravity: 1,
    jumpPower: 15,
    velocityY: 0,
    isJumping: false,
    moveDirection: 1 // 1: right, -1: left
};

let obstacles = [];
let gameSpeed = 1.5; // Slow down enemy speed
let score = 0;
let keys = {};
let gameOver = false;

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function createObstacle() {
    if (Math.random() < 0.01) { // Reduce the number of enemies
        const height = Math.random() * 30 + 10; // Make enemies lower
        const obstacle = {
            x: canvas.width,
            y: canvas.height - height - 30, // Adjust to touch the ground
            width: 20,
            height: height
        };
        obstacles.push(obstacle);
    }
}

function resetGame() {
    player.x = 50;
    player.y = canvas.height - 40;
    player.velocityY = 0;
    player.isJumping = false;
    obstacles = [];
    score = 0;
    gameOver = false;
}

function update() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#87CEEB'; // Sky color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

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
        if (player.y >= canvas.height - 30 - player.radius) {
            player.isJumping = false;
            player.y = canvas.height - 30 - player.radius;
            player.velocityY = 0;
        }
    }

    // Draw player
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Create obstacles
    createObstacle();

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
            gameOver = true;
        }
    });

    // Display score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);

    if (!gameOver) {
        requestAnimationFrame(update);
    } else {
        setTimeout(() => {
            resetGame();
            update();
        }, 1000);
    }
}

function handleGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gamepad = gamepads[0];
        console.log(`Gamepad connected: ${gamepad.id}`); // デバッグ出力
        console.log(`Axes: ${gamepad.axes}, Buttons: ${gamepad.buttons.map(b => b.pressed)}`); // デバッグ出力

        // 左スティックの入力をチェック
        if (gamepad.axes[0] < -0.5) {
            player.x -= player.speed;
            player.moveDirection = -1;
        }
        if (gamepad.axes[0] > 0.5) {
            player.x += player.speed;
            player.moveDirection = 1;
        }
        // Aボタンの入力をチェック
        if (gamepad.buttons[0].pressed && !player.isJumping) {
            player.isJumping = true;
            player.velocityY = player.jumpPower;
        }
    }
}

function startGame() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gamepadconnected', () => {
        console.log('Gamepad connected');
    });
    window.addEventListener('gamepaddisconnected', () => {
        console.log('Gamepad disconnected');
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

function handleKeyUp(e) {
    keys[e.key] = false;
}

// キーボードのキーアップイベントをリッスン
window.addEventListener('keyup', handleKeyUp);

// ゲームを開始
startGame();
