const canvas = document.getElementById("canvas");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

let fps = 10;
let cellSize = 9;
const gridWidth = 3000;
const gridHeight = 2000;
let grid = new Grid(gridWidth, gridHeight, cellSize);
const ctx = canvas.getContext("2d");

let camera = { x: gridWidth / 2, y: gridHeight / 2, zoom: 1 };

let isMouseDown = false;
let isDragging = false;
let mouseDownX = 0;
let mouseDownY = 0;
let lastMouse = { x: 0, y: 0 };
const DRAG_THRESHOLD = 5;

function screenToGrid(sx, sy) {
    const wx = (sx - canvas.width / 2) / camera.zoom + camera.x;
    const wy = (sy - canvas.height / 2) / camera.zoom + camera.y;
    return [Math.floor(wx / cellSize), Math.floor(wy / cellSize)];
}

canvas.addEventListener('wheel', (e) => {
    if (introState !== 'done') return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const wx = (mx - canvas.width / 2) / camera.zoom + camera.x;
    const wy = (my - canvas.height / 2) / camera.zoom + camera.y;
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    camera.zoom = Math.min(8, Math.max(0.2, camera.zoom * factor));
    camera.x = wx - (mx - canvas.width / 2) / camera.zoom;
    camera.y = wy - (my - canvas.height / 2) / camera.zoom;
}, { passive: false });

canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || introState !== 'done') return;
    isMouseDown = true;
    isDragging = false;
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;
    lastMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const dx = e.clientX - mouseDownX;
    const dy = e.clientY - mouseDownY;
    if (!isDragging && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    }
    if (isDragging) {
        camera.x -= (e.clientX - lastMouse.x) / camera.zoom;
        camera.y -= (e.clientY - lastMouse.y) / camera.zoom;
    }
    lastMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return;
    isMouseDown = false;
    if (introState === 'done') canvas.style.cursor = 'default';
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

function gameLoop() {
    if (!grid.pause) grid.update();
    document.getElementById('gen').textContent = grid.generation;
    setTimeout(gameLoop, 1000 / fps);
}

function renderLoop() {
    draw(grid, cellSize);
    requestAnimationFrame(renderLoop);
}

function startGame() {
    gameLoop();
    renderLoop();
}
