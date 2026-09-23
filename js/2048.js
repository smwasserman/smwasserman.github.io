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
function slideLine(values) {
    const tiles = values.filter(Boolean);
    const line = [];
    let gained = 0;
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === tiles[i + 1]) {
            line.push(tiles[i] * 2);
            gained += tiles[i] * 2;
            i++;
        } else {
            line.push(tiles[i]);
        }
    }
    while (line.length < SIZE) line.push(0);
    return { line, gained };
}

function move(board, dir) {
    const next = board.slice();
    let gained = 0;
    for (const indices of LINES[dir]) {
        const result = slideLine(indices.map(i => board[i]));
        result.line.forEach((value, k) => {
            next[indices[k]] = value;
        });
        gained += result.gained;
    }
    return { board: next, gained, moved: next.some((value, i) => value !== board[i]) };
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
    const scoreEl = root.querySelector('.score');
    const bestEl = root.querySelector('.best');
    const statusEl = root.querySelector('.game-status');
    const cells = Array.from({ length: SIZE * SIZE }, () => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        boardEl.appendChild(cell);
        return cell;
    });

    let board, score, won, over;
    let best = 0;
    try {
        best = Number(localStorage.getItem('best2048')) || 0;
    } catch (e) {
        // Storage blocked: the best score lasts for this visit only
    }

    function render(newIndex) {
        cells.forEach((cell, i) => {
            const value = board[i];
            cell.textContent = value || '';
            cell.dataset.value = value;
            cell.classList.toggle('is-big', value > 2048);
            cell.classList.toggle('is-new', i === newIndex);
        });
        scoreEl.textContent = score;
        bestEl.textContent = best;
    }

    function newGame() {
        board = new Array(SIZE * SIZE).fill(0);
        score = 0;
        won = false;
        over = false;
        board = addTile(board).board;
        const second = addTile(board);
        board = second.board;
        statusEl.textContent = '';
        render(second.index);
    }

    function step(dir) {
        if (over) return;
        const result = move(board, dir);
        if (!result.moved) return;
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
        if (!won && board.includes(2048)) {
            won = true;
            statusEl.textContent = 'You made 2048! Keep going if you like.';
        }
        if (!canMove(board)) {
            over = true;
            statusEl.textContent = `No moves left. Final score: ${score}. Press New game to play again.`;
        }
        render(added.index);
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
    root.querySelector('.new-game').addEventListener('click', newGame);

    newGame();
}

if (typeof document !== 'undefined') {
    const root = document.getElementById('game2048');
    if (root) startGame(root);
}

if (typeof module !== 'undefined') {
    module.exports = { slideLine, move, canMove, addTile };
}
