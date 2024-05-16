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
let gameSpeed = 15; // Initial enemy speed
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
    const currentTime = performance.now();
    elapsedTime = (currentTime - startTime) / 1000;

    if (Math.random() < 0.02 + elapsedTime * 0.002) { // Increase the number of enemies over time
        const height = Math.random() * 30 + 10; // Make enemies lower
        const obstacleType = Math.random() < 0.33 ? 'type1' : Math.random() < 0.5 ? 'type2' : 'type3'; // Increase enemy types
        const obstacle = {
            x: canvas.width,
            y: obstacleType === 'type2' ? Math.random() * (canvas.height - 60) : canvas.height - height - 30, // Adjust for flying enemies
            width: 20,
            height: height,
            type: obstacleType,
            velocityY: obstacleType === 'type3' ? -5 : 0, // Initial velocity for jumping enemies
            jumpTimer: 0 // Timer for jumping enemies
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

    // Increase game speed over time
    gameSpeed = 15 + elapsedTime; // Increase speed linearly

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

        // Handle different obstacle types
        if (obstacle.type === 'type2' && elapsedTime >= 20) {
            // Floating enemy
            obstacle.y += Math.sin(obstacle.x / 50) * 2; // Sine wave motion
        } else if (obstacle.type === 'type3') {
            // Jumping enemy
            obstacle.jumpTimer += deltaTime;
            if (obstacle.jumpTimer >= 1) { // Jump every second
                obstacle.velocityY = -10;
                obstacle.jumpTimer = 0;
            }
            obstacle.velocityY += 20 * deltaTime; // Gravity
            obstacle.y += obstacle.velocityY;
            if (obstacle.y >= canvas.height - 30 - obstacle.height) {
                obstacle.y = canvas.height - 30 - obstacle.height;
                obstacle.velocityY = 0;
            }
        }

        // Remove off-screen obstacles
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }

        // Draw obstacles
        if (obstacle.type === 'type1') {
            ctx.fillStyle = 'green';
        } else if (obstacle.type === 'type2') {
            ctx.fillStyle = 'blue';
        } else {
            ctx.fillStyle = 'orange';
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

    // Display time
    elapsedTime = (performance.now() - startTime) / 1000; // Time in seconds
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
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

function gameLoop()
