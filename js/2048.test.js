// Checks the 2048 rules. Run with: node js/2048.test.js
const assert = require('assert');
const { slideLine, move, canMove, addTile } = require('./2048.js');

// Sliding and merging a single line
assert.deepStrictEqual(slideLine([0, 0, 0, 2]), { line: [2, 0, 0, 0], gained: 0 });
assert.deepStrictEqual(slideLine([2, 2, 2, 2]), { line: [4, 4, 0, 0], gained: 8 });
assert.deepStrictEqual(slideLine([4, 4, 8, 8]), { line: [8, 16, 0, 0], gained: 24 });
// A merged tile doesn't merge again in the same move
assert.deepStrictEqual(slideLine([2, 2, 4, 0]), { line: [4, 4, 0, 0], gained: 4 });
assert.deepStrictEqual(slideLine([2, 0, 2, 4]), { line: [4, 4, 0, 0], gained: 4 });
assert.deepStrictEqual(slideLine([2, 4, 2, 4]), { line: [2, 4, 2, 4], gained: 0 });

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
