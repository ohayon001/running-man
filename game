const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 50,
    y: canvas.height - 60,
    width: 20,
    height: 40,
    speed: 5,
    gravity: 1,
    jumpPower: 15,
    velocityY: 0,
    isJumping: false
};

let obstacles = [];
let gameSpeed = 3;
let score = 0;

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

    // Player gravity and movement
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
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x, player.y, player.width, player.height);

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

function handleKeyDown(e) {
    if (e.key === 'ArrowUp' && !player.isJumping) {
        player.isJumping = true;
        player.velocityY = player.jumpPower;
    }
}

// Controller support
function handleGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gamepad = gamepads[0];
        if (gamepad.buttons[0].pressed && !player.isJumping) {
            player.isJumping = true;
            player.velocityY = player.jumpPower;
        }
    }
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('gamepadconnected', () => {
    console.log('Gamepad connected');
});

function gameLoop() {
    handleGamepad();
    update();
}

gameLoop();
