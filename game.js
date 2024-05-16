const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

function updateStatus(message) {
    status.textContent = message;
}

function handleGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gamepad = gamepads[0];
        console.log(`Gamepad connected: ${gamepad.id}`);
        console.log(`Axes: ${gamepad.axes}, Buttons: ${gamepad.buttons.map(b => b.pressed)}`);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 左スティックの入力をチェック
        if (gamepad.axes[0] < -0.5) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(50, 200, 50, 50);
        }
        if (gamepad.axes[0] > 0.5) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(150, 200, 50, 50);
        }
        // Aボタンの入力をチェック
        if (gamepad.buttons[0].pressed) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(100, 100, 50, 50);
        }
    } else {
        updateStatus('コントローラーを接続してください...');
    }
}

function gameLoop() {
    handleGamepad();
    requestAnimationFrame(gameLoop);
}

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

gameLoop();
