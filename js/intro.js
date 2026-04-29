const customBlocks = [
    [14, 8],[14, 9],[15, 6],[15, 7],[15, 8],[15, 9],[15, 10],[15, 11],
    [16, 3],[16, 4],[16, 5],[16, 6],[16, 11],[16, 12],[17, 3],[17, 12],
    [17, 13],[18, 3],[18, 13],[19, 3],[19, 8],[19, 9],[19, 13],[20, 3],
    [20, 8],[20, 13],[21, 8],[21, 9],[21, 12],[21, 13],[22, 9],[22, 10],
    [22, 11],[22, 12],[25, 7],[25, 8],[25, 9],[25, 10],[25, 11],[25, 12],
    [25, 13],[26, 7],[26, 8],[26, 10],[27, 7],[27, 10],[28, 7],[28, 8],
    [28, 9],[28, 10],[28, 11],[28, 12],[28, 13],[31, 7],[31, 8],[31, 9],
    [31, 10],[31, 11],[31, 12],[31, 13],[32, 7],[32, 8],[33, 8],[33, 9],
    [34, 7],[34, 8],[35, 7],[35, 8],[35, 9],[35, 10],[35, 11],[35, 12],
    [35, 13],[38, 7],[38, 8],[38, 9],[38, 10],[38, 11],[38, 12],[38, 13],
    [39, 7],[39, 10],[39, 13],[40, 7],[40, 13],[44, 9],[44, 10],[44, 11],
    [44, 12],[44, 13],[45, 9],[45, 10],[45, 13],[46, 9],[46, 11],[46, 13],
    [47, 9],[47, 10],[47, 11],[47, 12],[47, 13],[50, 9],[50, 10],[50, 11],
    [50, 12],[50, 13],[51, 9],[51, 11],[52, 9],[52, 11],[53, 9],[57, 3],
    [57, 4],[57, 5],[57, 6],[57, 7],[57, 8],[57, 9],[57, 10],[57, 11],
    [57, 12],[57, 13],[58, 3],[58, 4],[58, 5],[58, 6],[58, 7],[58, 8],
    [58, 9],[58, 10],[58, 11],[58, 12],[58, 13],[59, 12],[59, 13],[60, 12],
    [60, 13],[61, 12],[61, 13],[64, 6],[64, 7],[64, 12],[64, 13],[65, 5],
    [65, 7],[65, 11],[65, 13],[66, 4],[66, 7],[66, 8],[66, 9],[66, 10],
    [66, 11],[66, 12],[66, 13],[67, 5],[67, 7],[67, 11],[67, 13],[68, 6],
    [68, 7],[68, 12],[68, 13],[71, 7],[71, 8],[71, 9],[71, 10],[71, 11],
    [71, 12],[71, 13],[72, 7],[72, 9],[72, 10],[73, 7],[73, 8],[73, 10],
    [74, 7],[77, 7],[77, 8],[77, 9],[77, 10],[77, 11],[77, 12],[77, 13],
    [78, 7],[78, 10],[78, 13],[79, 7],[79, 10],[79, 13],[80, 7],[80, 8],
    [80, 9],[80, 10],[80, 13]
];

// ── Coordonnées monde ─────────────────────────────────────────────────────────
const GCX = Math.round(gridWidth  / 2 / cellSize);
const GCY = Math.round(gridHeight / 2 / cellSize);

const minBX = Math.min(...customBlocks.map(([x]) => x));
const maxBX = Math.max(...customBlocks.map(([x]) => x));
const minBY = Math.min(...customBlocks.map(([, y]) => y));
const maxBY = Math.max(...customBlocks.map(([, y]) => y));

const offsetX = GCX - Math.round((minBX + maxBX) / 2);
const offsetY = (GCY - 15) - Math.round((minBY + maxBY) / 2);

const introBlocks = customBlocks.map(([ex, ey]) => ({
    gx:      ex + offsetX,
    startGy: ey + offsetY,
    rowRel:  ey - minBY,
}));

// ── Bouton play (bordure + triangle) ─────────────────────────────────────────
const PLAY_BTN_SHAPE = [
    [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],
    [0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,10],[13,10],[14,10],
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],
    [14,1],[14,2],[14,3],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],
    [6,2],[6,3],[7,3],[6,4],[7,4],[8,4],[6,5],[7,5],[8,5],[9,5],[6,6],[7,6],[8,6],[6,7],[7,7],[6,8],
];

const BTN_W = 15, BTN_H = 11;
const textBottomGY = maxBY + offsetY;
const btnOriginGX  = GCX - 7;
const btnOriginGY  = textBottomGY + 10;
const btnCenterGX  = btnOriginGX + 7;
const btnCenterGY  = btnOriginGY + 5;

const playBtnBlocks = PLAY_BTN_SHAPE.map(([dx, dy]) => ({
    gx: btnOriginGX + dx,
    gy: btnOriginGY + dy,
}));

// ── Paramètres animation ──────────────────────────────────────────────────────
const STEP_MS         = 55;   // ms par cellule (blocs courts)
const FALL_WINDOW_MS  = 2000; // durée de chute visée (adapte la vitesse selon la distance)
const REMOVAL_DUR     = 1800; // ms pour vider le bouton

// ── État ──────────────────────────────────────────────────────────────────────
let introState    = 'idle';
let btnHovered    = false;
let animStartTime = null;
let removalSchedule = [];   // {gx, gy, removeAt} — calculé au démarrage

// ── Easing ────────────────────────────────────────────────────────────────────
function easeIn(t) { return t * t; }

// ── Chemin glider : random walk vers la cible ─────────────────────────────────
function makeGliderPath(sx, sy, tx, ty) {
    const path = [];
    let x = sx, y = sy;
    while (x !== tx || y !== ty) {
        path.push([x, y]);
        const remX = tx - x;
        const remY = ty - y;
        if (remY <= 0) {
            x += Math.sign(remX);
        } else if (remX === 0) {
            y += 1;
        } else {
            // probabilité pondérée par distance restante → avance toujours vers la cible
            const p = Math.abs(remX) / (Math.abs(remX) + remY);
            if (Math.random() < p) x += Math.sign(remX);
            else                   y += 1;
        }
    }
    path.push([tx, ty]);
    return path;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isOverPlayBtn(sx, sy) {
    const [gx, gy] = screenToGrid(sx, sy);
    return gx >= btnOriginGX && gx <= btnOriginGX + BTN_W - 1 &&
           gy >= btnOriginGY && gy <= btnOriginGY + BTN_H - 1;
}

function drawCell(gx, gy) {
    ctx.fillRect(gx * cellSize, gy * cellSize, cellSize - 1, cellSize - 1);
}

// ── Rendu idle ────────────────────────────────────────────────────────────────
function drawIntroWorld() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    ctx.fillStyle = '#ffffff';
    for (const b of introBlocks) drawCell(b.gx, b.startGy);

    if (btnHovered) { ctx.shadowBlur = 10 / camera.zoom; ctx.shadowColor = '#fff'; }
    for (const b of playBtnBlocks) drawCell(b.gx, b.gy);
    ctx.shadowBlur = 0;

    ctx.restore();
}

function introIdleLoop() {
    if (introState !== 'idle') return;
    drawIntroWorld();
    requestAnimationFrame(introIdleLoop);
}

// ── Démarrage animation ───────────────────────────────────────────────────────
function startAnimation() {
    if (introState !== 'idle') return;
    introState    = 'animating';
    animStartTime = null;

    // Cible : chaque bloc tombe jusqu'au bord haut du bouton
    // Délai par rangée (haut en premier) + petit jitter
    for (const b of introBlocks) {
        b.targetGx = btnOriginGX + Math.floor(Math.random() * BTN_W);
        b.targetGy = btnOriginGY;
        b.delay    = Math.random() * 700;
        b.path     = makeGliderPath(b.gx, b.startGy, b.targetGx, b.targetGy);
        // adapte la vitesse pour que même les blocs éloignés arrivent dans FALL_WINDOW_MS
        b.stepMs   = Math.min(STEP_MS, FALL_WINDOW_MS / b.path.length);
    }

    // Calcule l'ordre de suppression des cellules du bouton
    // Centre 3×3 = jamais supprimé (reste pour le jeu)
    const centerKeys = new Set();
    for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
            centerKeys.add(`${btnCenterGX+dx},${btnCenterGY+dy}`);

    const toRemove = [];
    for (let dx = 0; dx < BTN_W; dx++) {
        for (let dy = 0; dy < BTN_H; dy++) {
            const gx = btnOriginGX + dx;
            const gy = btnOriginGY + dy;
            if (centerKeys.has(`${gx},${gy}`)) continue;
            // distance du bord (0 = périmètre)
            const dist = Math.min(dx, BTN_W - 1 - dx, dy, BTN_H - 1 - dy);
            toRemove.push({ gx, gy, dist, rand: Math.random() });
        }
    }
    // Trier : bord d'abord (dist=0), puis désordonné à l'intérieur
    toRemove.sort((a, b) => (a.dist + a.rand * 0.6) - (b.dist + b.rand * 0.6));
    toRemove.forEach((c, i) => { c.removeAt = (i / toRemove.length) * REMOVAL_DUR; });
    removalSchedule = toRemove;

    requestAnimationFrame(animateIntro);
}

// ── Boucle d'animation ────────────────────────────────────────────────────────
function animateIntro(ts) {
    if (!animStartTime) animStartTime = ts;
    const el = ts - animStartTime;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    ctx.fillStyle = '#ffffff';

    // ── Blocs qui suivent leur chemin glider ─────────────────────────────────
    let arrivedCount = 0;
    for (const b of introBlocks) {
        const t        = Math.max(0, el - b.delay);
        const rawSteps = t / b.stepMs;
        const done     = Math.floor(rawSteps);
        const frac     = rawSteps - done;

        if (done >= b.path.length - 1) {
            arrivedCount++;
            continue; // absorbé par le bouton
        }
        const [cx, cy] = b.path[done];
        const [nx, ny] = b.path[done + 1];
        const f = easeIn(frac);
        drawCell(Math.round(cx + (nx - cx) * f), Math.round(cy + (ny - cy) * f));
    }

    const allArrived = arrivedCount === introBlocks.length;

    // ── Bouton : remplissage / vidage ────────────────────────────────────────
    if (!allArrived) {
        // Remplissage de bas en haut proportionnel aux blocs arrivés
        const fillFrac = arrivedCount / introBlocks.length;
        const filledRows = Math.ceil(fillFrac * BTN_H);
        const startDy = BTN_H - filledRows;

        // Bordure toujours visible
        for (const b of playBtnBlocks) drawCell(b.gx, b.gy);

        // Intérieur rempli (bas → haut)
        for (let dy = startDy; dy < BTN_H; dy++)
            for (let dx = 0; dx < BTN_W; dx++)
                drawCell(btnOriginGX + dx, btnOriginGY + dy);

    } else {
        // Calcule le temps depuis que tout est arrivé
        // (on estime l'heure d'arrivée du dernier bloc)
        const lastArrival = Math.max(...introBlocks.map(b =>
            b.delay + b.path.length * b.stepMs
        ));
        const removalEl = el - lastArrival;

        if (removalEl < 0) {
            // Bouton plein en attente
            for (let dy = 0; dy < BTN_H; dy++)
                for (let dx = 0; dx < BTN_W; dx++)
                    drawCell(btnOriginGX + dx, btnOriginGY + dy);
        } else {
            // Vidage : dessiner seulement les cellules pas encore supprimées
            const stillHere = new Set();

            // Centre 3×3 toujours présent
            for (let dx = -1; dx <= 1; dx++)
                for (let dy = -1; dy <= 1; dy++)
                    drawCell(btnCenterGX + dx, btnCenterGY + dy);

            // Cellules à supprimer progressivement
            for (const c of removalSchedule) {
                if (removalEl < c.removeAt) {
                    drawCell(c.gx, c.gy);
                }
            }

            // Animation terminée
            if (removalEl >= REMOVAL_DUR) {
                ctx.restore();
                finishIntro();
                return;
            }
        }
    }

    ctx.restore();
    requestAnimationFrame(animateIntro);
}

// ── Fin ───────────────────────────────────────────────────────────────────────
function finishIntro() {
    introState = 'done';

    // Seed le centre 3×3 dans la grille
    for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
            grid.cells.add(`${btnCenterGX + dx},${btnCenterGY + dy}`);

    document.getElementById('key-panel').style.display = 'flex';
    document.getElementById('info').style.display      = 'block';
    startGame();
}

// ── Events ────────────────────────────────────────────────────────────────────
canvas.addEventListener('mousemove', (e) => {
    if (introState !== 'idle') return;
    const rect = canvas.getBoundingClientRect();
    const was  = btnHovered;
    btnHovered = isOverPlayBtn(e.clientX - rect.left, e.clientY - rect.top);
    if (btnHovered !== was) canvas.style.cursor = btnHovered ? 'pointer' : 'default';
});

introIdleLoop();
