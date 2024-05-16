const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

let player = {
    x: 50,
    y: canvas.height - 40, // Adjust to touch the ground
    radius: 10, // Make the player ball smaller
    speed: 5,
    gravity: 20, // Gravity strength
    jumpPower: 15,
    velocityY: 0,
    isJumping: false,
    moveDirection: 1 // 1: right, -1: left
};

let obstacles = [];
const gameSpeed = 60; // Significantly increase enemy speed (4 times the previous value)
let score = 0;
let keys = {};
let gameOver = false;
let lastFrameTime = 0;
let startTime = 0;
let elapsedTime = 0;

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function updateStatus(message) {
    status.textContent = message;
}

function createObstacle() {
    if (Math.random() < 0.02) { // Increase the number of enemies
        const height = Math.random() * 30 + 10; // Make enemies lower
        const obstacleType = Math.random() < 0.5 ? 'type1' : 'type2'; // Increase enemy types
        const obstacle = {
            x: canvas.width,
            y: canvas.height - height - 30, // Adjust to touch the ground
            width: 20,
            height: height,
            type: obstacleType
        };

        // Check if the new obstacle overlaps with any existing obstacles
        const isOverlapping = obstacles.some(obs => obstacle.x < obs.x + obs.width + 50 && obstacle.x + obstacle.width > obs.x - 50); // Add space between obstacles

        if (!isOverlapping) {
            obstacles.push(obstacle);
        }
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
    lastFrameTime = 0;
    startTime = performance.now();
    elapsedTime = 0;
}

function update(deltaTime) {
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
        if (player.x - player.radius < 0) { // Prevent player from going off screen to the left
            player.x = player.radius;
        }
    }
    if (keys['ArrowRight']) {
        player.x += player.speed;
        if (player.x + player.radius > canvas.width) { // Prevent player from going off screen to the right
            player.x = canvas.width - player.radius;
        }
    }
    if (keys['ArrowUp'] && !player.isJumping) {
        player.isJumping = true;
        player.velocityY = -player.jumpPower;
    }

    // Player gravity and jump
    if (player.isJumping) {
        player.velocityY += player.gravity * deltaTime;
        player.y += player.velocityY;
        if (player.y >= canvas.height - 30 - player.radius) {
            player.isJumping = false;
            player.y = canvas.height - 30 - player.radius;
            player.velocityY = 0;
        }
    }

    // Prevent player from going off screen vertically
    if (player.y - player.radius < 0) {
        player.y = player.radius;
        player.velocityY = 0;
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
        obstacle.x -= gameSpeed * deltaTime;

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }

        // Draw obstacles
        if (obstacle.type === 'type1') {
            ctx.fillStyle = 'green';
        } else {
            ctx.fillStyle = 'blue';
        }
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

    // Display time
    elapsedTime = (performance.now() - startTime) / 1000; // Time in seconds
    ctx.fillText('Time: ' + elapsedTime.toFixed(2) + 's', 10, 50);

    if (elapsedTime >= 60) {
        gameOver = true;
        alert('Stage 1 cleared!');
    }

    if (gameOver) {
        setTimeout(() => {
            resetGame();
            lastFrameTime = performance.now();
            gameLoop();
        }, 1000);
    }
}

function handleGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gamepad = gamepads[0];
        updateStatus(`Gamepad connected: ${gamepad.id}`);
        console.log(`Gamepad connected: ${gamepad.id}`);
        console.log(`Axes: ${gamepad.axes}, Buttons: ${gamepad.buttons.map(b => b.pressed)}`);

        // 左スティックの入力をチェック
        if (gamepad.axes[0] < -0.5) {
            player.x -= player.speed;
            if (player.x - player.radius < 0) { // Prevent player from going off screen to the left
                player.x = player.radius;
            }
        }
        if (gamepad.axes[0] > 0.5) {
            player.x += player.speed;
            if (player.x + player.radius > canvas.width) { // Prevent player from going off screen to the right
                player.x = canvas.width - player.radius;
            }
        }
        // Aボタンの入力をチェック
        if (gamepad.buttons[0].pressed && !player.isJumping) {
            player.isJumping = true;
            player.velocityY = -player.jumpPower;
        }
    } else {
        updateStatus('コントローラーを接続してください...');
    }
}

function startGame() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gamepadconnected', (event) => {
        console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
          event.gamepad.index, event.gamepad.id,
          event.gamepad.buttons.length, event.gamepad.axes.length);
        updateStatus(`Gamepad connected: ${event.gamepad.id}`);
    });
    window.addEventListener('gamepaddisconnected', (event) => {
        console.log('Gamepad disconnected from index %d: %s',
          event.gamepad.index, event.gamepad.id);
        updateStatus('コントローラーを接続してください...');
    });
    lastFrameTime = performance.now();
    startTime = performance.now();
    gameLoop();
}

function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000; // 秒に変換
    lastFrameTime = currentTime;
    handleGamepad();
    update(deltaTime);
    if (!gameOver) {
        requestAnimationFrame(gameLoop); // ゲームループを継続
    }
}

function handleKeyDown(e) {
    keys[e.key] = true;
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

// キーボードのキーアップイベントをリスン
window.addEventListener('keyup', handleKeyUp);

// ゲームを開始
startGame();
