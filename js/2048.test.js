// Checks the 2048 rules. Run with: node js/2048.test.js
const assert = require('assert');
const { slideLine, move, canMove, addTile } = require('./2048.js');

const slide = values => {
    const { line, gained } = slideLine(values);
    return { line, gained };
};

// Sliding and merging a single line
assert.deepStrictEqual(slide([0, 0, 0, 2]), { line: [2, 0, 0, 0], gained: 0 });
assert.deepStrictEqual(slide([2, 2, 2, 2]), { line: [4, 4, 0, 0], gained: 8 });
assert.deepStrictEqual(slide([4, 4, 8, 8]), { line: [8, 16, 0, 0], gained: 24 });
// A merged tile doesn't merge again in the same move
assert.deepStrictEqual(slide([2, 2, 4, 0]), { line: [4, 4, 0, 0], gained: 4 });
assert.deepStrictEqual(slide([2, 0, 2, 4]), { line: [4, 4, 0, 0], gained: 4 });
assert.deepStrictEqual(slide([2, 4, 2, 4]), { line: [2, 4, 2, 4], gained: 0 });
// Three equal tiles: the two nearest the wall merge
assert.deepStrictEqual(slide([0, 2, 2, 2]), { line: [4, 2, 0, 0], gained: 4 });

// Where each tile came from (used to animate the slide)
assert.deepStrictEqual(slideLine([2, 0, 2, 4]).sources, [[0, 2], [3]]);
assert.deepStrictEqual(slideLine([0, 2, 2, 2]).sources, [[1, 2], [3]]);

// Directions
const board = [
    2, 0, 0, 2,
    0, 0, 0, 0,
    2, 0, 0, 0,
    4, 0, 0, 4
];
assert.deepStrictEqual(move(board, 'left').board, [4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 8, 0, 0, 0]);
assert.deepStrictEqual(move(board, 'right').board, [0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 8]);
assert.deepStrictEqual(move(board, 'up').board, [4, 0, 0, 2, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0]);
assert.deepStrictEqual(move(board, 'down').board, [0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 2, 4, 0, 0, 4]);
assert.strictEqual(move(board, 'left').gained, 12);

// Every tile's path, in board indices
const sortMoves = moves => moves.map(m => `${m.from}>${m.to}${m.merged ? '*' : ''}`).sort();
assert.deepStrictEqual(sortMoves(move(board, 'left').moves), ['0>0*', '12>12*', '15>12*', '3>0*', '8>8']);
assert.deepStrictEqual(sortMoves(move(board, 'down').moves), ['0>8*', '12>12', '15>15', '3>11', '8>8*']);

// Replaying the moves on the old board gives the new board
for (const dir of ['left', 'right', 'up', 'down']) {
    const result = move(board, dir);
    const replay = new Array(16).fill(0);
    result.moves.forEach(({ from, to }) => {
        replay[to] += board[from];
    });
    assert.deepStrictEqual(replay, result.board, dir);
}

// A move that changes nothing doesn't count
assert.strictEqual(move([2, 4, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 'left').moved, false);

// Game over only when the board is full with no equal neighbors
const stuck = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
assert.strictEqual(canMove(stuck), false);
assert.strictEqual(canMove([...stuck.slice(0, 15), 4]), true);

// New tiles only land on empty cells
const added = addTile([2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 0], () => 0);
assert.strictEqual(added.index, 15);
assert.strictEqual(added.board[15], 2);
assert.strictEqual(addTile(stuck).index, -1);

console.log('2048 rules: all checks passed');
