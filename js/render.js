function draw(grid, cellSize) {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    ctx.fillStyle = '#ffffff';
    for (const value of grid.get_cells()) {
        const values = value.split(',');
        ctx.fillRect(values[0] * cellSize, values[1] * cellSize, cellSize - 1, cellSize - 1);
    }

    ctx.restore();
}
