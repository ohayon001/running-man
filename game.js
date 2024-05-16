const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

let player = {
    x: 50,
    y: canvas.height - 40, // 地面に接するように調整
    radius: 10, // 主人公のたまを小さくする
    speed: 5,
    gravity: 1,
    jumpPower: 15,
    velocityY: 0,
    isJumping: false,
    moveDirection: 1 // 1: right, -1: left
};

let obstacles = [];
const gameSpeed = 1.5; // 敵の速度を一定にする
let score = 0;
let keys = {};
let gameOver = false;
let lastFrameTime = 0;

document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function updateStatus(message) {
    status.textContent = message;
}

function createObstacle() {
    if (Math.random() < 0.01) { // 敵の出現確率を低くする
        const height = Math.random() * 30 + 10; // 敵の高さを低くする
        const obstacle = {
            x: canvas.width,
            y: canvas.height - height - 30, // 地面に接するように調整
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
    lastFrameTime = 0;
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
        player.x -= player.speed * deltaTime;
        player.moveDirection = -1;
    }
    if (keys['ArrowRight']) {
        player.x += player.speed * deltaTime;
        player.moveDirection = 1;
    }
    if (keys['ArrowUp'] && !player.isJumping) {
        player.isJumping = true;
        player.velocityY = player.jumpPower;
    }

    // Player gravity and jump
    if (player.isJumping) {
        player.velocityY -= player.gravity * deltaTime;
        player.y -= player.velocityY * deltaTime;
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
        obstacle.x -= gameSpeed * deltaTime;

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

// キーボードのキーアップイベントをリッスン
window.addEventListener('keyup', handleKeyUp);

// ゲームを開始
startGame();
