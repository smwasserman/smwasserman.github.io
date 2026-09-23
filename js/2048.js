// 2048: slide the tiles, merge equal neighbors, reach 2048.
// The board is an array of 16 numbers, row by row, with 0 for an empty cell.

const SIZE = 4;
const ROWS = [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => r * SIZE + c));
const COLS = [0, 1, 2, 3].map(c => [0, 1, 2, 3].map(r => r * SIZE + c));

// Board indices for each line, listed in the order tiles slide toward
const LINES = {
    left: ROWS,
    right: ROWS.map(line => [...line].reverse()),
    up: COLS,
    down: COLS.map(line => [...line].reverse())
};

// Slide one line toward its start. Each tile merges at most once per move.
// sources[k] lists the positions (in the input line) of the tiles that end up at position k.
function slideLine(values) {
    const tiles = [];
    values.forEach((value, pos) => {
        if (value) tiles.push({ value, pos });
    });
    const line = [];
    const sources = [];
    let gained = 0;
    for (let i = 0; i < tiles.length; i++) {
        const next = tiles[i + 1];
        if (next && next.value === tiles[i].value) {
            line.push(tiles[i].value * 2);
            sources.push([tiles[i].pos, next.pos]);
            gained += tiles[i].value * 2;
            i++;
        } else {
            line.push(tiles[i].value);
            sources.push([tiles[i].pos]);
        }
    }
    while (line.length < SIZE) line.push(0);
    return { line, gained, sources };
}

// Returns the new board, the points gained, whether anything moved,
// and where every tile went: { from, to, merged } in board indices.
function move(board, dir) {
    const next = board.slice();
    const moves = [];
    let gained = 0;
    for (const indices of LINES[dir]) {
        const result = slideLine(indices.map(i => board[i]));
        result.line.forEach((value, k) => {
            next[indices[k]] = value;
        });
        result.sources.forEach((from, k) => {
            from.forEach(pos => {
                moves.push({ from: indices[pos], to: indices[k], merged: from.length === 2 });
            });
        });
        gained += result.gained;
    }
    return { board: next, gained, moved: next.some((value, i) => value !== board[i]), moves };
}

function canMove(board) {
    return Object.keys(LINES).some(dir => move(board, dir).moved);
}

// Put a 2 (90% of the time) or a 4 in a random empty cell
function addTile(board, random = Math.random) {
    const empty = [];
    board.forEach((value, i) => {
        if (!value) empty.push(i);
    });
    if (!empty.length) return { board, index: -1 };
    const next = board.slice();
    const index = empty[Math.floor(random() * empty.length)];
    next[index] = random() < 0.9 ? 2 : 4;
    return { board: next, index };
}

function startGame(root) {
    const boardEl = root.querySelector('.board');
    const tileLayer = root.querySelector('.tiles');
    const scoreEl = root.querySelector('.score');
    const bestEl = root.querySelector('.best');
    const messageEl = root.querySelector('.game-message');
    const messageText = root.querySelector('.game-message-text');
    const keepGoingButton = root.querySelector('.keep-going');
    const SLIDE_MS = 100;
    const calm = matchMedia('(prefers-reduced-motion: reduce)');

    let board, score, won, over, paused;
    let tileEls = [];
    let pending = null;
    let best = 0;
    try {
        best = Number(localStorage.getItem('best2048')) || 0;
    } catch (e) {
        // Storage blocked: the best score lasts for this visit only
    }

    function place(el, index) {
        el.style.setProperty('--row', Math.floor(index / SIZE));
        el.style.setProperty('--col', index % SIZE);
    }

    // Draw every tile from scratch at its resting position
    function drawTiles(merged = new Set(), newIndex = -1) {
        tileLayer.replaceChildren();
        tileEls = board.map((value, i) => {
            if (!value) return null;
            const el = document.createElement('div');
            el.className = 'tile';
            el.textContent = value;
            el.dataset.value = value > 2048 ? 'super' : value;
            el.dataset.digits = String(value).length;
            place(el, i);
            if (merged.has(i)) el.classList.add('is-merged');
            if (i === newIndex) el.classList.add('is-new');
            tileLayer.appendChild(el);
            return el;
        });
        scoreEl.textContent = score;
        bestEl.textContent = best;
    }

    // If tiles are still sliding, jump them to where they're going
    function finishSlide() {
        if (!pending) return;
        clearTimeout(pending.timer);
        const { merged, newIndex } = pending;
        pending = null;
        drawTiles(merged, newIndex);
    }

    function showMessage(text, canKeepGoing) {
        paused = true;
        keepGoingButton.hidden = !canKeepGoing;
        messageEl.hidden = false;
        messageText.textContent = text;
        (canKeepGoing ? keepGoingButton : root.querySelector('.try-again')).focus();
    }

    function hideMessage() {
        paused = false;
        messageEl.hidden = true;
    }

    function newGame() {
        finishSlide();
        board = new Array(SIZE * SIZE).fill(0);
        score = 0;
        won = false;
        over = false;
        hideMessage();
        board = addTile(board).board;
        const second = addTile(board);
        board = second.board;
        drawTiles(new Set(), second.index);
    }

    function step(dir) {
        if (over || paused) return;
        finishSlide();
        const result = move(board, dir);
        if (!result.moved) return;

        // Slide the existing tiles to where they end up
        result.moves.forEach(({ from, to }) => place(tileEls[from], to));

        const added = addTile(result.board);
        board = added.board;
        score += result.gained;
        if (score > best) {
            best = score;
            try {
                localStorage.setItem('best2048', best);
            } catch (e) {
                // Storage blocked: nothing to save to
            }
        }
        scoreEl.textContent = score;
        bestEl.textContent = best;

        const merged = new Set(result.moves.filter(m => m.merged).map(m => m.to));
        pending = { merged, newIndex: added.index, timer: null };
        if (calm.matches) {
            finishSlide();
        } else {
            pending.timer = setTimeout(finishSlide, SLIDE_MS);
        }

        if (!won && board.includes(2048)) {
            won = true;
            showMessage('You win!', true);
        } else if (!canMove(board)) {
            over = true;
            showMessage(`Game over! You scored ${score}.`, false);
        }
    }

    const KEYS = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right'
    };
    boardEl.addEventListener('keydown', e => {
        const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
        if (!dir) return;
        e.preventDefault();
        step(dir);
    });

    // Swipes (touch, pen or mouse drag) on the board
    let start = null;
    boardEl.addEventListener('pointerdown', e => {
        if (e.target.closest('button')) return;
        start = { x: e.clientX, y: e.clientY };
        boardEl.focus();
    });
    boardEl.addEventListener('pointerup', e => {
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        start = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            step(dx > 0 ? 'right' : 'left');
        } else {
            step(dy > 0 ? 'down' : 'up');
        }
    });
    boardEl.addEventListener('pointercancel', () => {
        start = null;
    });

    root.querySelectorAll('[data-dir]').forEach(button => {
        button.addEventListener('click', () => step(button.dataset.dir));
    });
    root.querySelectorAll('.new-game, .try-again').forEach(button => {
        button.addEventListener('click', () => {
            newGame();
            boardEl.focus();
        });
    });
    keepGoingButton.addEventListener('click', () => {
        hideMessage();
        // The winning move may also have been the last possible one
        if (!canMove(board)) {
            over = true;
            showMessage(`Game over! You scored ${score}.`, false);
            return;
        }
        boardEl.focus();
    });

    newGame();
}

if (typeof document !== 'undefined') {
    const root = document.getElementById('game2048');
    if (root) startGame(root);
}

if (typeof module !== 'undefined') {
    module.exports = { slideLine, move, canMove, addTile };
}
