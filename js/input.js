canvas.addEventListener("click", (e) => {
    if (introState === 'done' && isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (introState === 'idle') {
        if (isOverPlayBtn(x, y)) startAnimation();
        return;
    }

    if (introState !== 'done') return;

    const [r, c] = screenToGrid(x, y);
    grid.toggle_cell(r, c);
});

document.addEventListener("keydown", (e) => {
    if (introState !== 'done') return;
    if (e.key === " ") {
        e.preventDefault();
        grid.pause = !grid.pause;
    }
    if (e.key === "c" || e.key === "C") {
        grid.clear();
    }
    if (e.key === "+" || e.key === "=" || e.key === "ArrowUp" || e.key === "ArrowRight") {
        fps = Math.min(60, fps + 5);
    }
    if (e.key === "-" || e.key === "ArrowDown" || e.key === "ArrowLeft") {
        fps = Math.max(1, fps - 5);
    }
});
